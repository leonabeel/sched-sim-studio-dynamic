
export interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  remainingTime?: number;
  startTime?: number;
  endTime?: number;
  waitingTime?: number;
  turnaroundTime?: number;
  responseTime?: number;
  color?: string;
  inQueue?: boolean;
  level?: number;
}

export interface GanttChartItem {
  processId: string;
  startTime: number;
  endTime: number;
  color: string;
}
