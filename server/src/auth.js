import crypto from 'crypto';

const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64, SCRYPT_OPTIONS).toString('hex');
    return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
    if (!stored?.includes(':')) return false;
    const [salt, hash] = stored.split(':');
    if (!salt || !hash || hash.length !== 128) return false;
    try {
        const derived = crypto.scryptSync(password, salt, 64, SCRYPT_OPTIONS).toString('hex');
        return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
    } catch {
        return false;
    }
}

export function slugFromName(name) {
    const base = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    return base || `user-${Date.now().toString(36)}`;
}

export function publicUser(user) {
    return {
        email: user.email,
        fullName: user.fullName ?? '',
        mobile: user.mobile ?? '',
        jobTitle: user.jobTitle ?? '',
        organization: user.organization ?? '',
        location: user.location ?? '',
        about: user.about ?? '',
        profileSlug: user.profileSlug ?? '',
        authMethod: user.authMethod ?? 'email',
        createdAt: user.createdAt,
    };
}
