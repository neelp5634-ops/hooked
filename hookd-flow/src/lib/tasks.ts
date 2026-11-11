import type { Task } from '../types';
import { newId } from './id';

export const DEFAULT_TASK_TITLES = [
  'Collect logo and brand guidelines',
  'Confirm required social account access',
  'Confirm services and deliverables',
  'Schedule kickoff call',
  'Approve the first content plan'
];

export function createDefaultTasks(clientId: string): Task[] {
  const createdAt = new Date().toISOString();
  return DEFAULT_TASK_TITLES.map((title) => ({ id: newId(), clientId, title, done: false, createdAt }));
}

/** Percent complete (0-100). An empty checklist is 0%, never NaN. */
export function progressPercent(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
}
