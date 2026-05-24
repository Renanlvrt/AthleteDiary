// ============================================================
// lib/types.ts — All shared TypeScript interfaces & type unions
// ============================================================

export type SportType =
  | 'running'
  | 'gym'
  | 'cycling'
  | 'swimming'
  | 'football'
  | 'basketball'
  | 'other';

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
// 1 = Terrible, 2 = Bad, 3 = Okay, 4 = Good, 5 = Great

export type PerformanceLevel = 1 | 2 | 3 | 4 | 5;
// 1 = Poor, 2 = Below avg, 3 = Average, 4 = Good, 5 = Peak

export interface Session {
  id: string;              // uuid v4
  date: string;            // 'YYYY-MM-DD'
  timestamp: number;       // Unix ms
  sport: SportType;
  mood: MoodLevel;
  performance: PerformanceLevel;
  notes?: string;
}

// 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TrainingSlot {
  id: string;
  dayOfWeek: DayOfWeek;
  hour: number;    // 0–23
  minute: number;  // 0–59
}

export interface TrainingSchedule {
  slots: TrainingSlot[];
  isConfigured: boolean;
  updatedAt: number;       // Unix ms
}
