import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectToDatabase from './db.js';
import { hashPassword, publicUser, slugFromName, verifyPassword } from './src/auth.js';
import { deleteCloudinaryImage, uploadImageBuffer } from './src/cloudinary.js';
import multer from 'multer';
dotenv.config();

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: IMAGE_MAX_BYTES },
    fileFilter: (req, file, cb) => {
        if (file.mimetype?.startsWith('image/')) {
            cb(null, true);
            return;
        }
        cb(new Error('Only image files are allowed'));
    },
});

function handleImageUpload(req, res, next) {
    upload.single('image')(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            const message = error.code === 'LIMIT_FILE_SIZE'
                ? 'Image must be 5 MB or smaller'
                : error.message;
            return res.status(400).json({ error: message });
        }
        if (error) {
            return res.status(400).json({ error: error.message || 'Invalid image upload' });
        }
        next();
    });
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');
const app = express();
let db;

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findProfile(key) {
    const trimmed = decodeURIComponent(key).trim();
    if (!trimmed) return null;

    let profile = await db.collection('profiles').findOne({ slug: trimmed });
    if (profile) return profile;

    profile = await db.collection('profiles').findOne({
        fullName: { $regex: new RegExp(`^${escapeRegex(trimmed)}$`, 'i') },
    });
    if (profile) return profile;

    profile = await db.collection('profiles').findOne({
        email: trimmed.toLowerCase(),
    });
    if (profile) return profile;

    return db.collection('profiles').findOne({
        ownerEmail: trimmed.toLowerCase(),
    });
}

async function isProfileOwner(profile, ownerEmail) {
    if (!ownerEmail) return true;

    const normalized = ownerEmail.trim().toLowerCase();
    const allowed = [profile.ownerEmail, profile.email]
        .map((value) => value?.trim().toLowerCase())
        .filter(Boolean);

    if (allowed.includes(normalized)) return true;

    const user = await db.collection('users').findOne({ email: normalized });
    if (user?.profileSlug && user.profileSlug === profile.slug) return true;

    return allowed.length === 0;
}

app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ ok: true });
});

async function uniqueProfileSlug(baseName) {
    let slug = slugFromName(baseName);
    let attempt = 0;
    while (await db.collection('profiles').findOne({ slug })) {
        attempt += 1;
        slug = `${slugFromName(baseName)}-${attempt}`;
    }
    return slug;
}

app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password, mobile } = req.body ?? {};
        const normalizedEmail = email?.trim().toLowerCase();

        if (!fullName?.trim() || !normalizedEmail || !password) {
            return res.status(400).json({ error: 'Full name, email, and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const existing = await db.collection('users').findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }

        const profileSlug = await uniqueProfileSlug(fullName);
        const now = new Date().toISOString();

        await db.collection('profiles').insertOne({
            slug: profileSlug,
            ownerEmail: normalizedEmail,
            email: normalizedEmail,
            fullName: fullName.trim(),
            mobile: mobile?.trim() ?? '',
            jobTitle: '',
            organization: '',
            about: '',
            location: '',
            avatarUrl: null,
            coverUrl: null,
            leadCaptureEnabled: true,
            links: [],
            payments: [],
            updatedAt: now,
        });

        const userDoc = {
            email: normalizedEmail,
            fullName: fullName.trim(),
            mobile: mobile?.trim() ?? '',
            jobTitle: '',
            organization: '',
            location: '',
            about: '',
            profileSlug,
            passwordHash: hashPassword(password),
            authMethod: 'email',
            createdAt: now,
        };

        await db.collection('users').insertOne(userDoc);

        res.status(201).json({ ok: true, user: publicUser(userDoc) });
    } catch (error) {
        console.error('Register failed:', error);
        res.status(500).json({ error: 'Failed to register account' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body ?? {};
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await db.collection('users').findOne({ email: normalizedEmail });
        if (!user || !verifyPassword(password, user.passwordHash)) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        let profileSlug = user.profileSlug;
        if (!profileSlug) {
            const profile = await db.collection('profiles').findOne({
                $or: [{ ownerEmail: normalizedEmail }, { email: normalizedEmail }],
            });
            profileSlug = profile?.slug ?? '';
        }

        res.json({
            ok: true,
            user: publicUser({ ...user, profileSlug }),
        });
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ error: 'Failed to sign in' });
    }
});

app.use(express.static(PUBLIC_DIR));

app.get('/api/profiles/by-email/:email', async (req, res) => {
    try {
        const profile = await findProfile(req.params.email);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        console.error('Fetch profile by email failed:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

async function uploadProfileImage(req, res, field) {
    try {
        const profile = await findProfile(req.params.slug);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const ownerEmail = req.headers['x-owner-email']?.trim().toLowerCase();
        if (!(await isProfileOwner(profile, ownerEmail))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (!req.file?.buffer?.length) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        const previousUrl = profile[field];

        const imageUrl = await uploadImageBuffer(
            req.file.buffer,
            `justtag/profiles/${profile.slug}/${field === 'avatarUrl' ? 'avatar' : 'cover'}`,
        );
        if (!imageUrl) {
            return res.status(500).json({ error: 'Failed to upload image' });
        }

        await db.collection('profiles').updateOne(
            { slug: profile.slug },
            {
                $set: {
                    [field]: imageUrl,
                    updatedAt: new Date().toISOString(),
                },
            },
        );

        if (previousUrl && previousUrl !== imageUrl) {
            await deleteCloudinaryImage(previousUrl);
        }

        const updated = await db.collection('profiles').findOne({ slug: profile.slug });
        res.json(updated);
    } catch (error) {
        console.error(`Upload ${field} failed:`, error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
}

app.post('/api/profiles/:slug/avatar', handleImageUpload, (req, res) => {
    void uploadProfileImage(req, res, 'avatarUrl');
});

app.post('/api/profiles/:slug/cover', handleImageUpload, (req, res) => {
    void uploadProfileImage(req, res, 'coverUrl');
});

app.get('/api/profiles/:slug', async (req, res) => {
    try {
        const profile = await findProfile(req.params.slug);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        console.error('Fetch profile failed:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

app.put('/api/profiles/:slug', async (req, res) => {
    try {
        const profile = await findProfile(req.params.slug);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const ownerEmail = req.headers['x-owner-email']?.trim().toLowerCase();
        if (!(await isProfileOwner(profile, ownerEmail))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const body = req.body ?? {};
        const updates = { updatedAt: new Date().toISOString() };

        for (const key of ['fullName', 'jobTitle', 'organization', 'about', 'mobile', 'email', 'location']) {
            if (body[key] !== undefined) {
                updates[key] = String(body[key]).trim();
            }
        }

        if (body.leadCaptureEnabled !== undefined) {
            updates.leadCaptureEnabled = body.leadCaptureEnabled !== false;
        }

        if (Array.isArray(body.links)) {
            updates.links = body.links;
        }

        if (Array.isArray(body.payments)) {
            updates.payments = body.payments;
        }

        await db.collection('profiles').updateOne(
            { slug: profile.slug },
            { $set: updates },
        );

        const updated = await db.collection('profiles').findOne({ slug: profile.slug });
        res.json(updated);
    } catch (error) {
        console.error('Update profile failed:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

app.patch('/api/profiles/:slug/lead-capture', async (req, res) => {
    try {
        const profile = await findProfile(req.params.slug);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const ownerEmail = req.headers['x-owner-email']?.trim().toLowerCase();
        if (!(await isProfileOwner(profile, ownerEmail))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (typeof req.body?.leadCaptureEnabled !== 'boolean') {
            return res.status(400).json({ error: 'leadCaptureEnabled (boolean) is required' });
        }

        const leadCaptureEnabled = req.body.leadCaptureEnabled;

        await db.collection('profiles').updateOne(
            { slug: profile.slug },
            {
                $set: {
                    leadCaptureEnabled,
                    updatedAt: new Date().toISOString(),
                },
            },
        );

        const updated = await db.collection('profiles').findOne({ slug: profile.slug });
        res.json({
            slug: updated.slug,
            leadCaptureEnabled: updated.leadCaptureEnabled !== false,
        });
    } catch (error) {
        console.error('Update lead capture failed:', error);
        res.status(500).json({ error: 'Failed to update lead capture setting' });
    }
});

function mapContactDoc(doc) {
    return {
        id: doc._id?.toString() ?? doc.id,
        fullName: (doc.name ?? doc.fullName ?? '').trim(),
        mobile: (doc.phone ?? doc.mobile ?? '').trim(),
        email: (doc.email ?? '').trim(),
        jobTitle: (doc.jobTitle ?? '').trim(),
        organization: (doc.company ?? doc.organization ?? '').trim(),
        location: (doc.location ?? '').trim(),
        message: (doc.message ?? '').trim(),
        createdAt: doc.createdAt ?? new Date().toISOString(),
    };
}

app.get('/api/profiles/:slug/contacts', async (req, res) => {
    try {
        const profile = await findProfile(req.params.slug);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const ownerEmail = req.headers['x-owner-email']?.trim().toLowerCase();
        if (!(await isProfileOwner(profile, ownerEmail))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const slugVariants = [
            profile.slug,
            req.params.slug,
            profile.email?.trim().toLowerCase(),
        ].filter(Boolean);

        const docs = await db.collection('contacts')
            .find({ slug: { $in: slugVariants } })
            .sort({ createdAt: -1 })
            .toArray();

        res.json(docs.map(mapContactDoc));
    } catch (error) {
        console.error('Fetch contacts failed:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

app.post('/api/profiles/:slug/contacts', async (req, res) => {
    try {
        const { name, phone } = req.body ?? {};
        if (!name?.trim() || !phone?.trim()) {
            return res.status(400).json({ error: 'Name and phone are required' });
        }

        const profile = await findProfile(req.params.slug);
        if (profile?.leadCaptureEnabled === false) {
            return res.status(403).json({ error: 'Lead capture is disabled for this profile' });
        }

        await db.collection('contacts').insertOne({
            slug: profile?.slug ?? req.params.slug,
            ...req.body,
            createdAt: new Date().toISOString(),
        });
        res.status(201).json({ ok: true });
    } catch (error) {
        console.error('Create contact failed:', error);
        res.status(500).json({ error: 'Failed to save contact' });
    }
});

app.get('/p/:slug', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'profile.html'));
});

connectToDatabase().then((database) => {
    db = database;
    const port = Number(process.env.PORT) || 3001;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((err) => {
    console.error('Error connecting to database:', err);
    process.exit(1);
});
