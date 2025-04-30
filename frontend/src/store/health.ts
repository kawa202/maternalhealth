// store/health.ts
import { create } from 'zustand';

interface Metric {
  userId: string;
  timestamp: string;
  type: string;
  value: string;
  unit: string;
  status: string;
}

interface HealthState {
  metrics: Metric[];
  addMetric: (metric: Metric) => void;
  setMetrics: (metrics: Metric[]) => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  metrics: [],
  addMetric: (metric) =>
    set((state) => ({ metrics: [metric, ...state.metrics] })),
  setMetrics: (metrics) => set({ metrics }),
}));
