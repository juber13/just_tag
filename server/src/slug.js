const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateSlug(length = 9) {
  let slug = '';
  for (let i = 0; i < length; i++) {
    slug += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return slug;
}
