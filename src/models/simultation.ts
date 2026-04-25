export type SimulationResults = Record<string, number>;

export interface SimulationJobResponse {
  job_id: string;
}

export interface DetailedSimulationResult {
  id: number;
  name: string;
  chance: number;
}

export interface JobProgress {
  job_id: string;
  progress: number;
}
