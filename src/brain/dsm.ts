// src/brain/dsm.ts
export type State = 'ONBOARDING' | 'PLAN' | 'CRAVING' | 'LAPSE' | 'MAINTENANCE' | 'EMOTIONAL_TRIAGE' | 'CRISIS';

export interface DSM {
  current: State;
  data: {
    name: string;
    goal?: string;
    triggers: string[];
    plan: any;
    streak: number;
    lastCraving?: number;
  };
}

let dsm: DSM = {
  current: 'ONBOARDING',
  data: { name: '', triggers: [], plan: {}, streak: 0 }
};

export const initDSM = (name: string) => {
  dsm.data.name = name;
};

export const next = (intent: string, payload?: any): DSM => {
  const now = Date.now();

  if (dsm.current === 'ONBOARDING' && intent === 'start') {
    dsm.current = 'PLAN';
  }
  if (intent === 'craving') {
    dsm.current = 'CRAVING';
    dsm.data.lastCraving = now;
  }
  if (intent === 'lapse') {
    dsm.current = 'LAPSE';
    dsm.data.streak = 0;
  }
  if (intent === 'win') {
    dsm.data.streak++;
    if (dsm.data.streak >= 7) dsm.current = 'MAINTENANCE';
  }

  return dsm;
};

export const getState = (): DSM => dsm;