export type MetabolismSpeed = 'fast' | 'normal' | 'slow';

export interface DrinkPreset {
  id: string;
  name: string;
  defaultAmount: string;
  caffeine: number; // in mg
  category: 'energy' | 'coffee' | 'tea' | 'other';
  brand?: string;
  description?: string;
  popular?: boolean;
}

export interface DrinkEntry {
  id: string;
  presetId?: string;
  drinkName: string;
  amountInfo: string;
  caffeine: number; // in mg
  intakeTime: string; // HH:mm format, e.g. "08:30"
  intakeMinutes: number; // minutes from 00:00 of the intake day
}

export interface UserProfile {
  name: string;
  weightKg: number;
  metabolismSpeed: MetabolismSpeed;
  customHalfLife?: number;
}

export type StatusLevel = 'safe' | 'caution' | 'danger';

export interface Night10Eval {
  caffeineRemaining: number;
  status: StatusLevel;
  statusLabel: string;
  statusDesc: string;
  bedtimeSafetyMargin: number; // diff from 25mg threshold
}

export interface ChartDataPoint {
  timeStr: string;
  minutesFromMidnight: number;
  totalCaffeine: number;
  isNight10: boolean;
  activeDrinks: {
    name: string;
    remaining: number;
  }[];
}
