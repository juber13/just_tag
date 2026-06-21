import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const MEDIA_DIR = path.join(DATA_DIR, 'media');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });
  if (!fs.existsSync(PROFILES_FILE)) fs.writeFileSync(PROFILES_FILE, '{}', 'utf8');
  if (!fs.existsSync(CONTACTS_FILE)) fs.writeFileSync(CONTACTS_FILE, '[]', 'utf8');
}

function readJson(file, fallback) {
  ensureDataDir();
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

export function getAllProfiles() {
  return readJson(PROFILES_FILE, {});
}

export function getProfile(slug) {
  const profiles = getAllProfiles();
  return profiles[slug] ?? null;
}

export function saveProfile(slug, profile) {
  const profiles = getAllProfiles();
  profiles[slug] = { ...profile, slug, updatedAt: new Date().toISOString() };
  writeJson(PROFILES_FILE, profiles);
  return profiles[slug];
}

export function findProfileByEmail(email) {
  const normalized = email.trim().toLowerCase();
  const profiles = getAllProfiles();
  return Object.values(profiles).find((p) => p.ownerEmail === normalized) ?? null;
}

export function saveMediaBase64(slug, kind, base64) {
  if (!base64 || typeof base64 !== 'string') return null;
  const match = base64.match(/^data:image\/(\w+);base64,(.+)$/);
  const ext = match ? match[1].replace('jpeg', 'jpg') : 'jpg';
  const raw = match ? match[2] : base64.replace(/^data:.*;base64,/, '');
  const filename = `${slug}-${kind}.${ext}`;
  const filepath = path.join(MEDIA_DIR, filename);
  fs.writeFileSync(filepath, Buffer.from(raw, 'base64'));
  return `/media/${filename}`;
}

export function addContactSubmission(slug, submission) {
  const list = readJson(CONTACTS_FILE, []);
  const entry = {
    id: submission.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    slug,
    ...submission,
    createdAt: new Date().toISOString(),
  };
  list.push(entry);
  writeJson(CONTACTS_FILE, list);
  return entry;
}

export { MEDIA_DIR, ensureDataDir };
