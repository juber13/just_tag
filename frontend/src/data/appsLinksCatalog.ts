import { SavedProfileLink } from '../types/profile';

export type AppLinkItem = {
  id: string;
  label: string;
  category: string;
  color: string;
  iconName?: string;
  letter?: string;
  modal: {
    title: string;
    placeholder: string;
    showUploadIcon?: boolean;
    showTitleEdit?: boolean;
  };
};

export const APP_CATEGORIES = [
  'Contact',
  'Social media',
  'Music',
  'Content',
] as const;

export const appsLinksCatalog: AppLinkItem[] = [
  {
    id: 'phone',
    label: 'Phone',
    category: 'Contact',
    color: '#34C759',
    iconName: 'call',
    modal: { title: 'Phone', placeholder: 'Phone number' },
  },
  {
    id: 'whatsapp',
    label: 'Whatsapp',
    category: 'Contact',
    color: '#25D366',
    iconName: 'logo-whatsapp',
    modal: { title: 'Whatsapp', placeholder: 'Whatsapp number' },
  },
  {
    id: 'instagram',
    label: 'Instagram',
    category: 'Social media',
    color: '#E1306C',
    iconName: 'logo-instagram',
    modal: { title: 'Instagram', placeholder: 'Instagram username or profile URL' },
  },
  {
    id: 'facebook',
    label: 'Facebook',
    category: 'Social media',
    color: '#1877F2',
    iconName: 'logo-facebook',
    modal: { title: 'Facebook', placeholder: 'Facebook profile URL' },
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    category: 'Social media',
    color: '#000000',
    letter: 'X',
    modal: { title: 'X (Twitter)', placeholder: 'Username or profile URL' },
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    category: 'Social media',
    color: '#000000',
    iconName: 'logo-tiktok',
    modal: { title: 'TikTok', placeholder: 'TikTok username or profile URL' },
  },
  {
    id: 'video',
    label: 'YouTube',
    category: 'Social media',
    color: '#FF0000',
    iconName: 'logo-youtube',
    modal: {
      title: 'YouTube',
      placeholder: 'Channel or video URL',
    },
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    category: 'Social media',
    color: '#0A66C2',
    iconName: 'logo-linkedin',
    modal: { title: 'LinkedIn', placeholder: 'LinkedIn profile URL' },
  },
  {
    id: 'snapchat',
    label: 'Snapchat',
    category: 'Social media',
    color: '#FFFC00',
    letter: 'S',
    modal: { title: 'Snapchat', placeholder: 'Snapchat username' },
  },
  {
    id: 'threads',
    label: 'Threads',
    category: 'Social media',
    color: '#000000',
    letter: '@',
    modal: { title: 'Threads', placeholder: 'Threads username or profile URL' },
  },
  {
    id: 'telegram',
    label: 'Telegram',
    category: 'Social media',
    color: '#0088CC',
    iconName: 'logo-telegram',
    modal: { title: 'Telegram', placeholder: 'Telegram username' },
  },
  {
    id: 'discord',
    label: 'Discord',
    category: 'Social media',
    color: '#5865F2',
    iconName: 'logo-discord',
    modal: { title: 'Discord', placeholder: 'Discord username or invite link' },
  },
  {
    id: 'messenger',
    label: 'Messenger',
    category: 'Social media',
    color: '#0084FF',
    iconName: 'chatbubble-ellipses',
    modal: { title: 'Messenger', placeholder: 'Messenger link' },
  },
  {
    id: 'twitch',
    label: 'Twitch',
    category: 'Social media',
    color: '#9146FF',
    iconName: 'logo-twitch',
    modal: { title: 'Twitch', placeholder: 'Twitch channel URL' },
  },
  {
    id: 'spotify',
    label: 'Spotify',
    category: 'Music',
    color: '#1DB954',
    iconName: 'musical-notes',
    modal: { title: 'Spotify', placeholder: 'Spotify profile URL' },
  },
  {
    id: 'link',
    label: 'Link',
    category: 'Content',
    color: '#FFFFFF',
    iconName: 'link-outline',
    modal: {
      title: 'Link',
      placeholder: 'Link',
      showUploadIcon: true,
      showTitleEdit: true,
    },
  },
  {
    id: 'document',
    label: 'Document',
    category: 'Content',
    color: '#FFFFFF',
    iconName: 'document-text-outline',
    modal: {
      title: 'Document',
      placeholder: 'Link',
      showTitleEdit: true,
    },
  },
];

export function getAppsByCategory(): Record<string, AppLinkItem[]> {
  const map: Record<string, AppLinkItem[]> = {};
  for (const cat of APP_CATEGORIES) {
    map[cat] = appsLinksCatalog.filter((a) => a.category === cat);
  }
  return map;
}

export function getAppLinkItem(id: string): AppLinkItem | undefined {
  return appsLinksCatalog.find((a) => a.id === id);
}

export const CATALOG_LINK_IDS = new Set(appsLinksCatalog.map((a) => a.id));

export function isCatalogLinkId(id: string): boolean {
  return CATALOG_LINK_IDS.has(id);
}

export function filterCatalogLinks(links: SavedProfileLink[]): SavedProfileLink[] {
  return links
    .filter((link) => link.value.trim() && isCatalogLinkId(link.id))
    .map((link) => {
      const catalog = getAppLinkItem(link.id);
      if (!catalog) return link;
      return {
        ...link,
        label: catalog.label,
        category: catalog.category,
        color: catalog.color,
      };
    });
}
