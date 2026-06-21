import type { MenuDetailPage } from '../navigation/types';

export type MenuContentSection = {
  title: string;
  body?: string;
  bullets?: string[];
};

export type MenuPageContent = {
  title: string;
  icon: string;
  intro: string;
  sections: MenuContentSection[];
  ctaLabel?: string;
};

export const MENU_PAGE_CONTENT: Record<MenuDetailPage, MenuPageContent> = {
  howToUse: {
    title: 'How to use Justagg',
    icon: 'book-outline',
    intro:
      'Justagg turns your profile into a tap-to-share digital card. Follow these steps to get the most out of it.',
    sections: [
      {
        title: '1. Set up your profile',
        bullets: [
          'Add your name, photo, and contact details from the Profile tab.',
          'Fill in job title, company, and bio so people know who you are.',
          'Complete all profile steps to unlock your full share card.',
        ],
      },
      {
        title: '2. Add apps & links',
        bullets: [
          'Open Apps & Links Store from your profile.',
          'Choose social, payment, booking, or custom links.',
          'Reorder links so your most important ones appear first.',
        ],
      },
      {
        title: '3. Share your card',
        bullets: [
          'Use the Share tab to show your QR code or link.',
          'Let someone scan your code or tap your Justagg device.',
          'Save your email signature from Signature Preview.',
        ],
      },
      {
        title: '4. Track engagement',
        body: 'Visit Analytics to see views, taps, and which links get the most attention.',
      },
    ],
  },
  getDevice: {
    title: 'Get Justagg Device',
    icon: 'hardware-chip-outline',
    intro:
      'A Justagg device lets people save your profile with a single tap—no app install required on their phone.',
    sections: [
      {
        title: 'What you get',
        bullets: [
          'NFC-enabled card, tag, or accessory linked to your profile.',
          'Works with most modern Android and iPhone devices.',
          'Same profile and links you manage in the app.',
        ],
      },
      {
        title: 'How it works',
        bullets: [
          'Activate your product from the Menu screen after purchase.',
          'Hold the device near a phone to open your Justagg page.',
          'Update your profile anytime—changes sync automatically.',
        ],
      },
      {
        title: 'Ordering',
        body: 'Browse available formats (cards, stickers, keychains) on our store. Shipping and setup instructions are included with every order.',
      },
    ],
    ctaLabel: 'Visit device store',
  },
  ambassador: {
    title: 'Ambassador Program',
    icon: 'people-outline',
    intro:
      'Love Justagg? Join our ambassador community and earn rewards for referrals and content.',
    sections: [
      {
        title: 'Benefits',
        bullets: [
          'Exclusive discounts on devices and accessories.',
          'Referral credits when friends sign up and activate.',
          'Early access to new features and beta programs.',
        ],
      },
      {
        title: 'Who can apply',
        body: 'Creators, sales professionals, event organizers, and community leaders who actively share their network.',
      },
      {
        title: 'How to join',
        bullets: [
          'Submit a short application with your social or business links.',
          'Our team reviews applications within 5–7 business days.',
          'Approved ambassadors receive a welcome kit and tracking dashboard.',
        ],
      },
    ],
    ctaLabel: 'Apply now',
  },
  helpSupport: {
    title: 'Help & Support',
    icon: 'help-circle-outline',
    intro: 'Need assistance? Browse common topics below or reach our support team.',
    sections: [
      {
        title: 'Account & profile',
        bullets: [
          'Reset password from the sign-in screen.',
          'Update mobile or email from Profile → Manage.',
          'Sign out safely from the Menu screen.',
        ],
      },
      {
        title: 'Devices & activation',
        bullets: [
          'Use Activate Product in Menu after you receive your device.',
          'Each device can link to one profile at a time.',
          'Contact support if your tap does not open your page.',
        ],
      },
      {
        title: 'Contact us',
        body: 'Email: support@justagg.com\nHours: Mon–Fri, 9am–6pm (your local business timezone).\nWe typically reply within one business day.',
      },
    ],
    ctaLabel: 'Email support',
  },
};

export const MENU_ITEM_ROUTES: Record<string, MenuDetailPage> = {
  'How to use Justagg': 'howToUse',
  'Get Justagg Device': 'getDevice',
  'Ambassador Program': 'ambassador',
  'Help & Support': 'helpSupport',
};
