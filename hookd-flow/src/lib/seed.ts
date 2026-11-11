import type { AppData, Client, ContentItem } from '../types';
import { addDaysISO, todayISO } from './dates';
import { DEFAULT_TASK_TITLES } from './tasks';

/** Fictional sample data, shown on first launch only. Every record has isSample: true. */
export function buildSampleData(): AppData {
  const today = todayISO();
  const created = new Date().toISOString();
  const mk = (id: string, businessName: string, contactName: string, industry: string, status: Client['status'], goals: string, audience: string, tone: string, services: string[]): Client =>
    ({ id, businessName, contactName, email: `hello@${id.replace('sample-', '')}.example`, industry, services, goals, audience, tone, notes: 'Sample client (fictional).', status, createdAt: created, isSample: true });
  const clients = [
    mk('sample-brightbean', 'Bright Bean Cafe', 'Alex Sample', 'Coffee shop', 'Onboarding', 'Grow local foot traffic. Build an Instagram following.', 'local students and remote workers', 'Warm and playful', ['Social media management', 'Short-form video']),
    mk('sample-northpeak', 'Northpeak Fitness', 'Jordan Sample', 'Fitness studio', 'Active', 'Increase class sign-ups.', 'busy professionals aged 25-40', 'Motivating and direct', ['Content creation', 'Paid ads'])
  ];
  const tasks = clients.flatMap((c, ci) =>
    DEFAULT_TASK_TITLES.map((title, i) => ({ id: `${c.id}-task-${i}`, clientId: c.id, title, done: ci === 1 || i < 2, createdAt: created })));
  const item = (n: number, clientId: string, title: string, platform: ContentItem['platform'], format: ContentItem['format'], pillar: string, offset: number, status: ContentItem['status']): ContentItem =>
    ({ id: `sample-content-${n}`, clientId, title, platform, format, pillar, hook: '', caption: 'Sample content (fictional).', date: addDaysISO(today, offset), status, isSample: true });
  const content = [
    item(1, 'sample-brightbean', 'Meet the baristas', 'Instagram', 'Reel', 'Behind the scenes', 2, 'Draft'),
    item(2, 'sample-brightbean', 'Seasonal menu launch', 'Instagram', 'Carousel', 'Promotion', 5, 'Idea'),
    item(3, 'sample-brightbean', 'Latte art tips', 'Instagram', 'Static Post', 'Education', -2, 'In Review'),
    item(4, 'sample-northpeak', '3 desk stretches', 'LinkedIn', 'Carousel', 'Education', 1, 'Approved'),
    item(5, 'sample-northpeak', 'Member spotlight', 'Facebook', 'Static Post', 'Social proof', -5, 'Published')
  ];
  return { clients, tasks, content };
}
