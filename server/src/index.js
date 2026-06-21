import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSlug } from './slug.js';
import {
  addContactSubmission,
  ensureDataDir,
  findProfileByEmail,
  getProfile,
  saveMediaBase64,
  saveProfile,
  MEDIA_DIR,
} from './storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const PORT = Number(process.env.PORT) || 3000;

ensureDataDir();

const app = express();
app.use(cors());
app.use(express.json({ limit: '12mb' }));
app.use('/media', express.static(MEDIA_DIR));
app.use(express.static(PUBLIC_DIR));

function emptyProfile(slug, ownerEmail) {
  return {
    slug,
    ownerEmail,
    fullName: '',
    jobTitle: '',
    organization: '',
    about: '',
    mobile: '',
    email: '',
    location: '',
    avatarUrl: null,
    coverUrl: null,
    leadCaptureEnabled: true,
    links: [],
    payments: [],
  };
}

function assertOwner(req, profile) {
  const email = req.headers['x-owner-email']?.trim().toLowerCase();
  if (!email || email !== profile.ownerEmail) {
    return false;
  }
  return true;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/profiles/by-email/:email', (req, res) => {
  const profile = findProfileByEmail(req.params.email);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }
  res.json(profile);
});

app.get('/api/profiles/:slug', (req, res) => {
  const profile = getProfile(req.params.slug);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }
  res.json(profile);
});

app.post('/api/profiles', (req, res) => {
  const ownerEmail = req.body?.ownerEmail?.trim().toLowerCase();
  if (!ownerEmail) {
    res.status(400).json({ error: 'ownerEmail is required' });
    return;
  }

  const existing = findProfileByEmail(ownerEmail);
  if (existing) {
    res.json(existing);
    return;
  }

  let slug = generateSlug();
  while (getProfile(slug)) slug = generateSlug();

  const profile = saveProfile(slug, {
    ...emptyProfile(slug, ownerEmail),
    ...req.body,
    slug,
    ownerEmail,
  });

  res.status(201).json(profile);
});

app.put('/api/profiles/:slug', (req, res) => {
  const slug = req.params.slug;
  const existing = getProfile(slug);
  if (!existing) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }
  if (!assertOwner(req, existing)) {
    res.status(403).json({ error: 'Not allowed' });
    return;
  }

  const body = { ...req.body };
  delete body.slug;
  delete body.ownerEmail;

  if (body.avatarBase64) {
    body.avatarUrl = saveMediaBase64(slug, 'avatar', body.avatarBase64);
    delete body.avatarBase64;
  }
  if (body.coverBase64) {
    body.coverUrl = saveMediaBase64(slug, 'cover', body.coverBase64);
    delete body.coverBase64;
  }

  const profile = saveProfile(slug, { ...existing, ...body });
  res.json(profile);
});

app.post('/api/profiles/:slug/contacts', (req, res) => {
  const profile = getProfile(req.params.slug);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  const { name, email, phone, jobTitle, company, message, visitorPhotoBase64 } = req.body ?? {};
  if (!name?.trim() || !phone?.trim()) {
    res.status(400).json({ error: 'Name and phone are required' });
    return;
  }

  const entryId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let visitorPhotoUrl = null;
  if (visitorPhotoBase64) {
    visitorPhotoUrl = saveMediaBase64(`contact-${entryId}`, 'visitor', visitorPhotoBase64);
  }

  const entry = addContactSubmission(profile.slug, {
    id: entryId,
    name: name.trim(),
    email: email?.trim() ?? '',
    phone: phone.trim(),
    jobTitle: jobTitle?.trim() ?? '',
    company: company?.trim() ?? '',
    message: message?.trim() ?? '',
    visitorPhotoUrl,
  });

  res.status(201).json({ ok: true, id: entry.id });
});

app.get('/', (_req, res) => {
  res.redirect('/p/demo');
});

app.get('/p/:slug', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'profile.html'));
});

function upsertDemoProfile() {
  saveProfile('demo', {
    slug: 'demo',
    ownerEmail: 'demo@justagg.local',
    fullName: 'Mallika Hirani',
    jobTitle: 'Owner',
    organization: 'Game and Gamer',
    about: '',
    mobile: '9871137547',
    email: 'mallika@example.com',
    location: '',
    avatarUrl: null,
    coverUrl: null,
    leadCaptureEnabled: true,
    links: [
      { id: 'whatsapp', label: 'Whatsapp', category: 'Contact', value: '9871137547', color: '#25D366' },
      { id: 'phone', label: 'Phone', category: 'Contact', value: '9871137547', color: '#34C759' },
      { id: 'gmail', label: 'Gmail', category: 'Contact', value: 'mallika@example.com', color: '#EA4335' },
      { id: 'address', label: 'Address', category: 'Contact', value: 'New Delhi, India', color: '#4285F4' },
      { id: 'messages', label: 'Message', category: 'Contact', value: '9871137547', color: '#34C759' },
      { id: 'telegram', label: 'Telegram', category: 'Contact', value: 'mallikahirani', color: '#0088cc' },
      { id: 'catalog', label: 'Catalog', category: 'Business', value: 'https://example.com/catalog', color: '#111' },
      { id: 'instagram', label: 'Instagram', category: 'Social media', value: 'mallikahirani', color: '#E4405F' },
      { id: 'google-reviews', label: 'Google Reviews', category: 'Business', value: 'https://g.page/review', color: '#4285F4' },
      { id: 'facetime', label: 'Facetime', category: 'Contact', value: '9871137547', color: '#34C759' },
      { id: 'twitter', label: 'Twitter X', category: 'Social media', value: 'mallikahirani', color: '#000' },
    ],
    payments: [
      { provider: 'google-pay', upiId: 'mallikahalder14@okhdfcbank' },
      { provider: 'paytm', upiId: '9871137547@ptaxis' },
      { provider: 'phonepe', upiId: '9871137547-2@ibl' },
    ],
  });
}

upsertDemoProfile();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Justtag profile server: http://localhost:${PORT}`);
  console.log(`Demo profile UI:       http://localhost:${PORT}/p/demo`);
});
