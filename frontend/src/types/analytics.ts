export type AnalyticsRange = '24h' | 'week' | 'month' | 'all';

export type LinkAnalytics = {
  linkId: string;
  label: string;
  clicks: number;
};

export type DailyAnalytics = {
  date: string;
  views: number;
  clicks: number;
  contactModals: number;
  contacts: number;
};

export type ProfileAnalytics = {
  range: AnalyticsRange;
  rangeLabel: string;
  views: number;
  clicks: number;
  contacts: number;
  contactModals: number;
  clickRate: number;
  links: LinkAnalytics[];
  daily: DailyAnalytics[];
};

export const ANALYTICS_RANGE_OPTIONS: { value: AnalyticsRange; label: string }[] = [
  { value: '24h', label: 'Past 24 Hours' },
  { value: 'week', label: 'Past 7 Days' },
  { value: 'month', label: 'Past 30 Days' },
  { value: 'all', label: 'All Time' },
];
