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
  'Business',
  'Portfolio',
  'Payment',
  'Music',
  'Content',
] as const;

export const appsLinksCatalog: AppLinkItem[] = [
  {
    id: 'address',
    label: 'Address',
    category: 'Contact',
    color: '#4285F4',
    letter: 'A',
    modal: { title: 'Address', placeholder: 'Type your full address' },
  },
  {
    id: 'contact-card',
    label: 'Contact Card',
    category: 'Contact',
    color: '#9E9E9E',
    iconName: 'person',
    modal: { title: 'Contact Card', placeholder: 'Contact details' },
  },
  {
    id: 'facetime',
    label: 'Facetime',
    category: 'Contact',
    color: '#34C759',
    iconName: 'videocam',
    modal: { title: 'Facetime', placeholder: 'Facetime ID' },
  },
  {
    id: 'messages',
    label: 'Messages',
    category: 'Contact',
    color: '#34C759',
    iconName: 'chatbubble',
    modal: { title: 'Messages', placeholder: 'Phone number' },
  },
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
    id: 'clubhouse',
    label: 'Clubhouse',
    category: 'Social media',
    color: '#F5EFE6',
    letter: 'C',
    modal: { title: 'Clubhouse', placeholder: 'Clubhouse username' },
  },
  {
    id: 'discord',
    label: 'Discord',
    category: 'Social media',
    color: '#5865F2',
    iconName: 'logo-discord',
    modal: { title: 'Discord', placeholder: 'Discord username' },
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
    id: 'appstore',
    label: 'Appstore',
    category: 'Business',
    color: '#0D96F6',
    letter: 'A',
    modal: { title: 'Appstore', placeholder: 'App Store link' },
  },
  {
    id: 'calendly',
    label: 'Calendly',
    category: 'Business',
    color: '#FFFFFF',
    letter: 'C',
    modal: { title: 'Calendly', placeholder: 'Calendly URL' },
  },
  {
    id: 'google-meet',
    label: 'Google Meet',
    category: 'Business',
    color: '#FFFFFF',
    letter: 'M',
    modal: { title: 'Google Meet', placeholder: 'Meeting link' },
  },
  {
    id: 'play-store',
    label: 'Play Store',
    category: 'Business',
    color: '#34A853',
    iconName: 'logo-google-playstore',
    modal: { title: 'Play Store', placeholder: 'Play Store link' },
  },
  {
    id: 'linkedin',
    label: 'Linkedin',
    category: 'Business',
    color: '#0A66C2',
    iconName: 'logo-linkedin',
    modal: { title: 'Linkedin', placeholder: 'LinkedIn profile URL' },
  },
  {
    id: 'linktree',
    label: 'Linktree',
    category: 'Business',
    color: '#43E55E',
    letter: 'L',
    modal: { title: 'Linktree', placeholder: 'Linktree URL' },
  },
  {
    id: 'behance',
    label: 'Behance',
    category: 'Portfolio',
    color: '#1769FF',
    letter: 'B',
    modal: { title: 'Behance', placeholder: 'Behance profile URL' },
  },
  {
    id: 'dribbble',
    label: 'Dribble',
    category: 'Portfolio',
    color: '#EA4C89',
    iconName: 'logo-dribbble',
    modal: { title: 'Dribble', placeholder: 'Dribbble profile URL' },
  },
  {
    id: 'fiverr',
    label: 'Fiverr',
    category: 'Portfolio',
    color: '#1DBF73',
    letter: 'fi',
    modal: { title: 'Fiverr', placeholder: 'Fiverr profile URL' },
  },
  {
    id: 'google-pay',
    label: 'Google Pay',
    category: 'Payment',
    color: '#4285F4',
    letter: 'G',
    modal: { title: 'Google Pay', placeholder: 'UPI / payment link' },
  },
  {
    id: 'paytm',
    label: 'Paytm',
    category: 'Payment',
    color: '#00BAF2',
    letter: 'P',
    modal: { title: 'Paytm', placeholder: 'Paytm UPI ID' },
  },
  {
    id: 'phonepe',
    label: 'Phonepe',
    category: 'Payment',
    color: '#5F259F',
    letter: 'Pe',
    modal: { title: 'Phonepe', placeholder: 'PhonePe UPI ID' },
  },
  {
    id: 'apple-music',
    label: 'applemusic',
    category: 'Music',
    color: '#FC3C44',
    iconName: 'musical-notes',
    modal: { title: 'Apple Music', placeholder: 'Apple Music link' },
  },
  {
    id: 'soundcloud',
    label: 'Sound Cloud',
    category: 'Music',
    color: '#FF5500',
    iconName: 'logo-soundcloud',
    modal: { title: 'Sound Cloud', placeholder: 'SoundCloud profile URL' },
  },
  {
    id: 'spotify',
    label: 'Spotify',
    category: 'Music',
    color: '#1DB954',
    iconName: 'logo-spotify',
    modal: { title: 'Spotify', placeholder: 'Spotify profile URL' },
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
    id: 'video',
    label: 'Video',
    category: 'Content',
    color: '#FFFFFF',
    iconName: 'play-circle-outline',
    modal: {
      title: 'Youtube',
      placeholder: 'Channel/Video link (paste)',
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
