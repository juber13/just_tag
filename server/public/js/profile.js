const PAYMENT_IDS = new Set(['google-pay', 'paytm', 'phonepe']);

/** Brand icons: `tile` = solid color + white glyph; `logo` = full-color logo on white */
const ICON_DEFS = {
  whatsapp: { file: 'whatsapp.svg', tile: '#25D366' },
  phone: { file: 'phone.svg', tile: '#34C759' },
  gmail: { file: 'gmail.svg', logo: true },
  maps: { file: 'maps.svg', logo: true },
  message: { file: 'message.svg', tile: '#34C759' },
  messages: { file: 'message.svg', tile: '#34C759' },
  telegram: { file: 'telegram.svg', tile: '#0088cc' },
  instagram: { file: 'instagram.svg', logo: true },
  link: { file: 'link.svg', logo: true },
  'google-reviews': { file: 'google-reviews.svg', logo: true },
  catalog: { file: 'catalog.svg', tile: '#111111' },
  facetime: { file: 'facetime.svg', tile: '#34C759' },
  twitter: { file: 'twitter.svg', tile: '#000000' },
  googlepay: { file: 'googlepay.svg', logo: true },
  paytm: { file: 'paytm.svg', logo: true },
  phonepe: { file: 'phonepe.svg', logo: true },
  behance: { file: 'behance.svg', logo: true },
  facebook: { file: 'facebook.svg', logo: true },
  linkedin: { file: 'linkedin.svg', logo: true },
  discord: { file: 'discord.svg', tile: '#5865F2' },
  messenger: { file: 'messenger.svg', tile: '#0084FF' },
  twitch: { file: 'twitch.svg', tile: '#9146FF' },
  dribbble: { file: 'dribbble.svg', logo: true },
  soundcloud: { file: 'soundcloud.svg', tile: '#FF5500' },
  spotify: { file: 'spotify.svg', tile: '#1DB954' },
  'play-store': { file: 'play-store.svg', logo: true },
  document: { file: 'document.svg', logo: true },
  video: { file: 'video.svg', logo: true },
  'contact-card': { file: 'contact-card.svg', tile: '#9E9E9E' },
  'apple-music': { file: 'music.svg', tile: '#FC3C44' },
  clubhouse: { letter: 'C', tile: '#F5EFE6', darkText: true },
  appstore: { letter: 'A', tile: '#0D96F6' },
  calendly: { letter: 'C', tile: '#FFFFFF', darkText: true },
  'google-meet': { letter: 'M', tile: '#FFFFFF', darkText: true },
  linktree: { letter: 'L', tile: '#43E55E' },
  fiverr: { letter: 'fi', tile: '#1DBF73' },
};

function externalHref(value) {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

const LINK_META = {
  whatsapp: {
    label: 'Whatsapp',
    href: (v) => `https://wa.me/${v.replace(/\D/g, '')}`,
    icon: 'whatsapp',
  },
  phone: {
    label: 'Phone',
    href: (v) => `tel:${v}`,
    icon: 'phone',
  },
  gmail: {
    label: 'Gmail',
    href: (v) => `mailto:${v}`,
    icon: 'gmail',
  },
  email: {
    label: 'Gmail',
    href: (v) => `mailto:${v}`,
    icon: 'gmail',
  },
  address: {
    label: 'Address',
    href: (v) => `https://maps.google.com/?q=${encodeURIComponent(v)}`,
    icon: 'maps',
  },
  messages: {
    label: 'Message',
    href: (v) => `sms:${v}`,
    icon: 'messages',
  },
  telegram: {
    label: 'Telegram',
    href: (v) => `https://t.me/${v.replace('@', '')}`,
    icon: 'telegram',
  },
  instagram: {
    label: 'Instagram',
    href: (v) => (v.startsWith('http') ? v : `https://instagram.com/${v.replace('@', '')}`),
    icon: 'instagram',
  },
  'google-reviews': {
    label: 'Google Reviews',
    href: (v) => externalHref(v),
    icon: 'google-reviews',
  },
  catalog: {
    label: 'Catalog',
    href: (v) => externalHref(v),
    icon: 'catalog',
  },
  facetime: {
    label: 'Facetime',
    href: (v) => `facetime:${v}`,
    icon: 'facetime',
  },
  twitter: {
    label: 'Twitter X',
    href: (v) => (v.startsWith('http') ? v : `https://x.com/${v.replace('@', '')}`),
    icon: 'twitter',
  },
  clubhouse: {
    label: 'Clubhouse',
    href: (v) => externalHref(v),
    icon: 'clubhouse',
  },
  discord: {
    label: 'Discord',
    href: (v) => externalHref(v),
    icon: 'discord',
  },
  facebook: {
    label: 'Facebook',
    href: (v) => externalHref(v),
    icon: 'facebook',
  },
  messenger: {
    label: 'Messenger',
    href: (v) => externalHref(v),
    icon: 'messenger',
  },
  twitch: {
    label: 'Twitch',
    href: (v) => externalHref(v),
    icon: 'twitch',
  },
  appstore: {
    label: 'Appstore',
    href: (v) => externalHref(v),
    icon: 'appstore',
  },
  calendly: {
    label: 'Calendly',
    href: (v) => externalHref(v),
    icon: 'calendly',
  },
  'google-meet': {
    label: 'Google Meet',
    href: (v) => externalHref(v),
    icon: 'google-meet',
  },
  'play-store': {
    label: 'Play Store',
    href: (v) => externalHref(v),
    icon: 'play-store',
  },
  linkedin: {
    label: 'Linkedin',
    href: (v) => externalHref(v),
    icon: 'linkedin',
  },
  linktree: {
    label: 'Linktree',
    href: (v) => externalHref(v),
    icon: 'linktree',
  },
  behance: {
    label: 'Behance',
    href: (v) => externalHref(v),
    icon: 'behance',
  },
  dribbble: {
    label: 'Dribble',
    href: (v) => externalHref(v),
    icon: 'dribbble',
  },
  fiverr: {
    label: 'Fiverr',
    href: (v) => externalHref(v),
    icon: 'fiverr',
  },
  'apple-music': {
    label: 'Apple Music',
    href: (v) => externalHref(v),
    icon: 'apple-music',
  },
  soundcloud: {
    label: 'Sound Cloud',
    href: (v) => externalHref(v),
    icon: 'soundcloud',
  },
  spotify: {
    label: 'Spotify',
    href: (v) => externalHref(v),
    icon: 'spotify',
  },
  document: {
    label: 'Document',
    href: (v) => externalHref(v),
    icon: 'document',
  },
  link: {
    label: 'Link',
    href: (v) => externalHref(v),
    icon: 'link',
  },
  video: {
    label: 'Video',
    href: (v) => externalHref(v),
    icon: 'video',
  },
  'contact-card': {
    label: 'Contact Card',
    href: (v) => externalHref(v),
    icon: 'contact-card',
  },
  'google-pay': { label: 'Google Pay', icon: 'googlepay', payment: true },
  paytm: { label: 'Paytm', icon: 'paytm', payment: true },
  phonepe: { label: 'Phonepe', icon: 'phonepe', payment: true },
};

function getSlugFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const pIndex = parts.indexOf('p');
  if (pIndex >= 0 && parts[pIndex + 1]) return parts[pIndex + 1];
  return parts[parts.length - 1] || '';
}

function absUrl(path) {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${window.location.origin}${path.startsWith('/') ? '' : '/'}${path}`;
}

function initials(name) {
  return (name || '?')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function orgInitials(org) {
  if (!org) return '';
  const words = org.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return org.slice(0, 2).toUpperCase();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const CONTACT_OPEN_DELAY_MS = 280;
const CONTACT_ANIM_MS = 420;

function openContactModal() {
  const el = document.getElementById('contact-modal');
  if (!el) return;

  el.classList.remove('hidden', 'contact-modal-closing');
  el.setAttribute('aria-hidden', 'false');
  document.body.classList.add('contact-modal-open');

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.add('contact-modal-visible');
    });
  });
}

function closeContactModal() {
  const el = document.getElementById('contact-modal');
  if (!el || el.classList.contains('hidden')) return;

  el.classList.remove('contact-modal-visible');
  el.classList.add('contact-modal-closing');

  window.setTimeout(() => {
    el.classList.add('hidden');
    el.classList.remove('contact-modal-closing');
    el.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('contact-modal-open');
  }, CONTACT_ANIM_MS);
}

function openModal(id) {
  if (id === 'contact-modal') {
    openContactModal();
    return;
  }

  const el = document.getElementById(id);
  el.classList.remove('hidden');
  el.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeModal(id) {
  if (id === 'contact-modal') {
    closeContactModal();
    return;
  }

  const el = document.getElementById(id);
  el.classList.add('hidden');
  el.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.modal:not(.hidden)')) {
    document.body.classList.remove('modal-open');
    document.body.classList.remove('contact-modal-open');
  }
}

function applyCoverImage(coverUrl) {
  const url = absUrl(coverUrl);
  const cssValue = url ? `url(${url})` : '';
  const banner = document.getElementById('banner');
  const modalBanner = document.getElementById('modal-banner');
  if (banner) banner.style.backgroundImage = cssValue;
  if (modalBanner) modalBanner.style.backgroundImage = cssValue;
}

function syncContactModalHeader(data) {
  applyCoverImage(data.coverUrl);

  const modalAvatarImg = document.getElementById('modal-avatar');
  const modalAvatarFallback = document.getElementById('modal-avatar-fallback');
  const avatarUrl = absUrl(data.avatarUrl);
  if (!modalAvatarImg || !modalAvatarFallback) return;

  if (avatarUrl) {
    modalAvatarImg.src = avatarUrl;
    modalAvatarImg.alt = data.fullName || '';
    modalAvatarImg.classList.remove('hidden');
    modalAvatarFallback.classList.add('hidden');
  } else {
    modalAvatarImg.classList.add('hidden');
    modalAvatarFallback.textContent = initials(data.fullName);
    modalAvatarFallback.classList.remove('hidden');
  }
}

function resetContactForm(form) {
  form.reset();
  const moreFields = document.getElementById('contact-more-fields');
  if (moreFields) moreFields.open = false;
}

function prefillContactForm() {
  try {
    const saved = JSON.parse(localStorage.getItem('justtag-contact-draft') || '{}');
    const nameEl = document.getElementById('contact-name');
    const emailEl = document.getElementById('contact-email');
    const phoneEl = document.getElementById('contact-phone');
    if (nameEl && saved.name) nameEl.value = saved.name;
    if (emailEl && saved.email) emailEl.value = saved.email;
    if (phoneEl && saved.phone) phoneEl.value = saved.phone;
  } catch {
    /* ignore invalid draft */
  }
}

function saveContactDraft(payload) {
  localStorage.setItem(
    'justtag-contact-draft',
    JSON.stringify({
      name: payload.name || '',
      email: payload.email || '',
      phone: payload.phone || '',
    }),
  );
}

function setupContactPhoto() {
  const input = document.getElementById('contact-photo-input');
  const previewImg = document.getElementById('contact-avatar-img');
  const placeholder = document.querySelector('.contact-avatar-placeholder');
  if (!input || !previewImg) return;

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      previewImg.src = reader.result;
      previewImg.dataset.base64 = reader.result;
      previewImg.classList.remove('hidden');
      placeholder?.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  });
}

function setupModals() {
  document.querySelectorAll('[data-close]').forEach((el) => {
    el.addEventListener('click', () => {
      closeModal('contact-modal');
      closeModal('payment-modal');
    });
  });
}

function createIconElement(iconKey) {
  const def = ICON_DEFS[iconKey] || ICON_DEFS.link;
  const wrap = document.createElement('span');
  wrap.className = 'link-icon';

  if (def.logo) {
    wrap.classList.add('link-icon--logo');
  } else if (def.tile) {
    wrap.classList.add('link-icon--tile');
    wrap.style.backgroundColor = def.tile;
  }

  if (def.file) {
    const img = document.createElement('img');
    img.src = `/icons/${def.file}`;
    img.alt = '';
    img.className = 'link-icon-img';
    img.loading = 'lazy';
    img.decoding = 'async';
    wrap.appendChild(img);
    return wrap;
  }

  if (def.letter) {
    wrap.classList.add('link-icon--letter');
    const letter = document.createElement('span');
    letter.className = 'link-icon-letter';
    letter.textContent = def.letter;
    letter.style.color = def.darkText ? '#111' : '#fff';
    wrap.appendChild(letter);
    return wrap;
  }

  const img = document.createElement('img');
  img.src = `/icons/${ICON_DEFS.link.file}`;
  img.alt = '';
  img.className = 'link-icon-img';
  wrap.classList.add('link-icon--logo');
  wrap.appendChild(img);
  return wrap;
}

function createTile(label, iconKey, onClick, href) {
  const labelEl = document.createElement('span');
  labelEl.className = 'link-label';
  labelEl.textContent = label;

  const iconWrap = createIconElement(iconKey);

  if (href) {
    const a = document.createElement('a');
    a.className = 'link-tile';
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.append(iconWrap, labelEl);
    return a;
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'link-tile';
  btn.append(iconWrap, labelEl);
  btn.addEventListener('click', onClick);
  return btn;
}

function renderLinksGrid(links, payments) {
  const grid = document.getElementById('links-grid');
  grid.innerHTML = '';

  const tiles = [];

  for (const link of links || []) {
    if (!link.value?.trim() || PAYMENT_IDS.has(link.id)) continue;
    const meta = LINK_META[link.id] || {
      label: link.label || link.id,
      href: (v) => externalHref(v),
      icon: link.id in ICON_DEFS ? link.id : 'link',
    };
    tiles.push(
      createTile(link.label || meta.label, meta.icon, null, meta.href(link.value.trim())),
    );
  }

  for (const p of payments || []) {
    if (!p.upiId?.trim()) continue;
    const meta = LINK_META[p.provider] || { label: p.provider, icon: 'link', payment: true };
    tiles.push(
      createTile(meta.label, meta.icon, () => {
        document.getElementById('payment-title').textContent = meta.label;
        document.getElementById('payment-id').textContent = p.upiId;
        openModal('payment-modal');
      }),
    );
  }

  if (tiles.length === 0) {
    grid.innerHTML = '<p class="grid-empty">No links added yet.</p>';
    return;
  }

  for (const tile of tiles) grid.appendChild(tile);
}

async function loadProfile() {
  const slug = getSlugFromPath();
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const profileEl = document.getElementById('profile');

  setupModals();

  if (!slug) {
    loading.classList.add('hidden');
    error.textContent = 'Invalid profile link.';
    error.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch(`/api/profiles/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Profile not found');
    const data = await res.json();

    loading.classList.add('hidden');
    profileEl.classList.remove('hidden');

    document.title = `${data.fullName || 'Profile'} — Justagg`;

    applyCoverImage(data.coverUrl);

    const avatarImg = document.getElementById('avatar');
    const avatarFallback = document.getElementById('avatar-fallback');
    const avatarUrl = absUrl(data.avatarUrl);
    if (avatarUrl) {
      avatarImg.src = avatarUrl;
      avatarImg.alt = data.fullName || '';
      avatarImg.classList.remove('hidden');
      avatarFallback.classList.add('hidden');
    } else {
      avatarFallback.textContent = initials(data.fullName);
    }

    if (data.organization?.trim()) {
      const badge = document.getElementById('org-badge');
      badge.textContent = orgInitials(data.organization);
      badge.classList.remove('hidden');
    }

    document.getElementById('name').textContent = data.fullName || 'Unnamed';
    const roleParts = [data.jobTitle, data.organization].filter(Boolean);
    document.getElementById('role').textContent =
      roleParts.length >= 2
        ? `${roleParts[0]} @ ${roleParts.slice(1).join(' ')}`
        : roleParts.join(' ') || '';

    renderLinksGrid(data.links, data.payments);
    syncContactModalHeader(data);

    const connectBtn = document.getElementById('connect-btn');
    setupContactPhoto();
    prefillContactForm();

    if (data.leadCaptureEnabled === false) {
      connectBtn.classList.add('hidden');
    } else {
      connectBtn.addEventListener('click', () => openContactModal());
      window.setTimeout(() => openContactModal(), CONTACT_OPEN_DELAY_MS);
    }

    const form = document.getElementById('contact-form');
    const previewImg = document.getElementById('contact-avatar-img');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      if (previewImg?.dataset.base64) {
        payload.visitorPhotoBase64 = previewImg.dataset.base64;
      }
      const btn = form.querySelector('.submit-btn');
      btn.disabled = true;
      try {
        const r = await fetch(`/api/profiles/${encodeURIComponent(slug)}/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!r.ok) throw new Error('Failed');
        saveContactDraft(payload);
        resetContactForm(form);
        if (previewImg) {
          previewImg.removeAttribute('src');
          previewImg.removeAttribute('data-base64');
          previewImg.classList.add('hidden');
        }
        document.querySelector('.contact-avatar-placeholder')?.classList.remove('hidden');
        document.getElementById('contact-photo-input').value = '';
        document.getElementById('contact-success').classList.remove('hidden');
        setTimeout(() => closeModal('contact-modal'), 1500);
      } catch {
        alert('Could not send message. Please try again.');
      } finally {
        btn.disabled = false;
      }
    });
  } catch (err) {
    loading.classList.add('hidden');
    error.innerHTML = `
      <p><strong>${escapeHtml(err.message || 'Could not load profile.')}</strong></p>
      <p style="margin-top:12px;font-size:0.9rem;color:#666;">
        Try <a href="/p/demo">/p/demo</a> or sync from the mobile app.
      </p>
    `;
    error.classList.remove('hidden');
  }
}

loadProfile();
