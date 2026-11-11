export const CLIENT_STATUSES = ['Onboarding', 'Active', 'Paused'] as const;
export const PLATFORMS = ['Instagram', 'LinkedIn', 'YouTube', 'Facebook'] as const;
export const FORMATS = ['Reel', 'Carousel', 'Static Post', 'Story', 'Video'] as const;
export const CONTENT_STATUSES = ['Idea', 'Draft', 'In Review', 'Approved', 'Published'] as const;
export const SERVICES = ['Social media management', 'Content creation', 'Short-form video', 'Paid ads', 'Community management', 'Branding', 'Analytics reporting'] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];
export type Platform = (typeof PLATFORMS)[number];
export type ContentFormat = (typeof FORMATS)[number];
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export interface Client {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  industry: string;
  services: string[];
  goals: string;
  audience: string;
  tone: string;
  notes: string;
  status: ClientStatus;
  createdAt: string;
  isSample?: boolean;
}

export interface Task {
  id: string;
  clientId: string;
  title: string;
  done: boolean;
  createdAt: string;
}

export interface ContentItem {
  id: string;
  clientId: string;
  title: string;
  platform: Platform;
  format: ContentFormat;
  pillar: string;
  hook: string;
  caption: string;
  /** Local calendar date, YYYY-MM-DD (never a UTC timestamp). */
  date: string;
  status: ContentStatus;
  isSample?: boolean;
}

export interface AppData {
  clients: Client[];
  tasks: Task[];
  content: ContentItem[];
}

export const EMPTY_DATA: AppData = { clients: [], tasks: [], content: [] };
export const DATA_VERSION = 1;
