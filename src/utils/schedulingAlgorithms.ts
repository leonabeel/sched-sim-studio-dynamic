
import { Process, GanttChartItem } from '../models/Process';

// Generate a random color for each process
const generateColor = (): string => {
  const colors = [
    '#4299E1', // blue
    '#48BB78', // green
    '#F56565', // red
    '#ED8936', // orange
    '#9F7AEA', // purple
    '#38B2AC', // teal
    '#ED64A6', // pink
    '#ECC94B'  // yellow
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Helper function to deep clone processes
const cloneProcesses = (processes: Process[]): Process[] => {
  return processes.map(p => ({
    ...p,
    remainingTime: p.burstTime,
    waitingTime: 0,
    turnaroundTime: 0,
    responseTime: -1, // -1 means not started yet
    color: p.color || generateColor()
  }));
};

// Helper function to calculate metrics
const calculateMetrics = (processes: Process[]) => {
  // Calculate waiting time, turnaround time, and response time
  processes.forEach((process) => {
    if (process.startTime !== undefined && process.endTime !== undefined) {
      process.waitingTime = process.endTime - process.arrivalTime - process.burstTime;
      process.turnaroundTime = process.endTime - process.arrivalTime;
      process.responseTime = process.startTime - process.arrivalTime;
    }
  });
  
  // Calculate average metrics
  const avgWaitingTime = processes.reduce((sum, process) => sum + (process.waitingTime || 0), 0) / processes.length;
  const avgTurnaroundTime = processes.reduce((sum, process) => sum + (process.turnaroundTime || 0), 0) / processes.length;
  const avgResponseTime = processes.reduce((sum, process) => sum + (process.responseTime || 0), 0) / processes.length;
  const totalBurstTime = processes.reduce((sum, process) => sum + process.burstTime, 0);
  const makespan = Math.max(...processes.map(p => p.endTime || 0));
  const cpuUtilization = totalBurstTime / makespan * 100;
  const throughput = processes.length / makespan;
  
  return {
    avgWaitingTime,
    avgTurnaroundTime,
    avgResponseTime,
    cpuUtilization,
    throughput,
    makespan
  };
};

// First-Come, First-Served (FCFS)
export const fcfs = (processes: Process[]) => {
  const clonedProcesses = cloneProcesses(processes);
  
  // Sort by arrival time
  clonedProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime);
  
  let currentTime = 0;
  const ganttChart: GanttChartItem[] = [];
  
  clonedProcesses.forEach((process) => {
    // If current time is less than arrival time, CPU is idle
    if (currentTime < process.arrivalTime) {
      currentTime = process.arrivalTime;
    }
    
    process.startTime = currentTime;
    process.endTime = currentTime + process.burstTime;
    currentTime = process.endTime;
    
    // Add to Gantt chart
    ganttChart.push({
      processId: process.id,
      startTime: process.startTime,
      endTime: process.endTime,
      color: process.color || '#000'
    });
  });
  
  const metrics = calculateMetrics(clonedProcesses);
  
  return {
    processes: clonedProcesses,
    ganttChart,
    metrics
  };
};

// Shortest Job First (SJF) - Non-preemptive
export const sjfNonPreemptive = (processes: Process[]) => {
  const clonedProcesses = cloneProcesses(processes);
  
  let currentTime = 0;
  const ganttChart: GanttChartItem[] = [];
  const completedProcesses: Process[] = [];
  const readyQueue: Process[] = [];
  
  // Continue until all processes are completed
  while (completedProcesses.length < clonedProcesses.length) {
    // Add newly arrived processes to the ready queue
    for (const process of clonedProcesses) {
      if (process.arrivalTime <= currentTime && !readyQueue.includes(process) && !completedProcesses.includes(process)) {
        readyQueue.push(process);
      }
    }
    
    if (readyQueue.length === 0) {
      // No process in ready queue, advance time to next arrival
      const nextArrival = clonedProcesses
        .filter(p => !completedProcesses.includes(p))
        .reduce((min, p) => p.arrivalTime < min ? p.arrivalTime : min, Infinity);
      currentTime = nextArrival;
      continue;
    }
    
    // Select the process with the shortest burst time
    readyQueue.sort((a, b) => a.burstTime - b.burstTime);
    const selectedProcess = readyQueue.shift()!;
    
    selectedProcess.startTime = currentTime;
    selectedProcess.endTime = currentTime + selectedProcess.burstTime;
    currentTime = selectedProcess.endTime;
    
    // Add to Gantt chart
    ganttChart.push({
      processId: selectedProcess.id,
      startTime: selectedProcess.startTime,
      endTime: selectedProcess.endTime,
      color: selectedProcess.color || '#000'
    });
    
    completedProcesses.push(selectedProcess);
  }
  
  const metrics = calculateMetrics(clonedProcesses);
  
  return {
    processes: clonedProcesses,
    ganttChart,
    metrics
  };
};

// Shortest Job First (SJF) - Preemptive (Shortest Remaining Time First - SRTF)
export const sjfPreemptive = (processes: Process[]) => {
  const clonedProcesses = cloneProcesses(processes);
  
  let currentTime = 0;
  const ganttChart: GanttChartItem[] = [];
  const completedProcesses: Process[] = [];
  let runningProcess: Process | null = null;
  let prevRunningProcess: Process | null = null;
  
  // Continue until all processes are completed
  while (completedProcesses.length < clonedProcesses.length) {
    // Find processes that have arrived
    const availableProcesses = clonedProcesses.filter(p => 
      p.arrivalTime <= currentTime && 
      !completedProcesses.includes(p)
    );
    
    if (availableProcesses.length === 0) {
      // No process available, advance time to next arrival
      const nextArrival = clonedProcesses
        .filter(p => !completedProcesses.includes(p))
        .reduce((min, p) => p.arrivalTime < min ? p.arrivalTime : min, Infinity);
      currentTime = nextArrival;
      continue;
    }
    
    // Select the process with the shortest remaining time
    runningProcess = availableProcesses.reduce((shortest, current) => 
      (current.remainingTime || 0) < (shortest.remainingTime || Infinity) ? current : shortest
    );
    
    // If there's a context switch (different process starts running)
    if (runningProcess !== prevRunningProcess && prevRunningProcess) {
      // End the previous process's execution in Gantt chart
      const lastGanttItem = ganttChart[ganttChart.length - 1];
      if (lastGanttItem && lastGanttItem.processId === prevRunningProcess.id) {
        lastGanttItem.endTime = currentTime;
      }
    }
    
    // If this is the first time this process is running, set its start time
    if (runningProcess.startTime === undefined) {
      runningProcess.startTime = currentTime;
    }
    
    // If this is a new process or a context switch, add a new entry to the Gantt chart
    if (runningProcess !== prevRunningProcess) {
      ganttChart.push({
        processId: runningProcess.id,
        startTime: currentTime,
        endTime: currentTime + 1, // Will be updated later
        color: runningProcess.color || '#000'
      });
    } else {
      // Update the end time of the current Gantt chart entry
      const lastGanttItem = ganttChart[ganttChart.length - 1];
      if (lastGanttItem) {
        lastGanttItem.endTime = currentTime + 1;
      }
    }
    
    // Execute for 1 time unit
    runningProcess.remainingTime = (runningProcess.remainingTime || 0) - 1;
    currentTime += 1;
    
    // Check if the process is completed
    if (runningProcess.remainingTime === 0) {
      runningProcess.endTime = currentTime;
      completedProcesses.push(runningProcess);
    }
    
    prevRunningProcess = runningProcess;
  }
  
  // Combine consecutive Gantt chart items for the same process
  const optimizedGantt: GanttChartItem[] = [];
  for (const item of ganttChart) {
    const lastItem = optimizedGantt[optimizedGantt.length - 1];
    if (lastItem && lastItem.processId === item.processId && lastItem.endTime === item.startTime) {
      lastItem.endTime = item.endTime;
    } else {
      optimizedGantt.push({ ...item });
    }
  }
  
  const metrics = calculateMetrics(clonedProcesses);
  
  return {
    processes: clonedProcesses,
    ganttChart: optimizedGantt,
    metrics
  };
};

// Priority Scheduling - Non-preemptive
export const priorityNonPreemptive = (processes: Process[]) => {
  const clonedProcesses = cloneProcesses(processes);
  
  let currentTime = 0;
  const ganttChart: GanttChartItem[] = [];
  const completedProcesses: Process[] = [];
  const readyQueue: Process[] = [];
  
  // Continue until all processes are completed
  while (completedProcesses.length < clonedProcesses.length) {
    // Add newly arrived processes to the ready queue
    for (const process of clonedProcesses) {
      if (process.arrivalTime <= currentTime && !readyQueue.includes(process) && !completedProcesses.includes(process)) {
        readyQueue.push(process);
      }
    }
    
    if (readyQueue.length === 0) {
      // No process in ready queue, advance time to next arrival
      const nextArrival = clonedProcesses
        .filter(p => !completedProcesses.includes(p))
        .reduce((min, p) => p.arrivalTime < min ? p.arrivalTime : min, Infinity);
      currentTime = nextArrival;
      continue;
    }
    
    // Select the process with the highest priority (lower value means higher priority)
    readyQueue.sort((a, b) => a.priority - b.priority);
    const selectedProcess = readyQueue.shift()!;
    
    selectedProcess.startTime = currentTime;
    selectedProcess.endTime = currentTime + selectedProcess.burstTime;
    currentTime = selectedProcess.endTime;
    
    // Add to Gantt chart
    ganttChart.push({
      processId: selectedProcess.id,
      startTime: selectedProcess.startTime,
      endTime: selectedProcess.endTime,
      color: selectedProcess.color || '#000'
    });
    
    completedProcesses.push(selectedProcess);
  }
  
  const metrics = calculateMetrics(clonedProcesses);
  
  return {
    processes: clonedProcesses,
    ganttChart,
    metrics
  };
};

// Priority Scheduling - Preemptive
export const priorityPreemptive = (processes: Process[]) => {
  const clonedProcesses = cloneProcesses(processes);
  
  let currentTime = 0;
  const ganttChart: GanttChartItem[] = [];
  const completedProcesses: Process[] = [];
  let runningProcess: Process | null = null;
  let prevRunningProcess: Process | null = null;
  
  // Continue until all processes are completed
  while (completedProcesses.length < clonedProcesses.length) {
    // Find processes that have arrived
    const availableProcesses = clonedProcesses.filter(p => 
      p.arrivalTime <= currentTime && 
      !completedProcesses.includes(p)
    );
    
    if (availableProcesses.length === 0) {
      // No process available, advance time to next arrival
      const nextArrival = clonedProcesses
        .filter(p => !completedProcesses.includes(p))
        .reduce((min, p) => p.arrivalTime < min ? p.arrivalTime : min, Infinity);
      currentTime = nextArrival;
      continue;
    }
    
    // Select the process with the highest priority (lower value means higher priority)
    runningProcess = availableProcesses.reduce((highest, current) => 
      current.priority < highest.priority ? current : highest
    );
    
    // If there's a context switch (different process starts running)
    if (runningProcess !== prevRunningProcess && prevRunningProcess) {
      // End the previous process's execution in Gantt chart
      const lastGanttItem = ganttChart[ganttChart.length - 1];
      if (lastGanttItem && lastGanttItem.processId === prevRunningProcess.id) {
        lastGanttItem.endTime = currentTime;
      }
    }
    
    // If this is the first time this process is running, set its start time
    if (runningProcess.startTime === undefined) {
      runningProcess.startTime = currentTime;
    }
    
    // If this is a new process or a context switch, add a new entry to the Gantt chart
    if (runningProcess !== prevRunningProcess) {
      ganttChart.push({
        processId: runningProcess.id,
        startTime: currentTime,
        endTime: currentTime + 1, // Will be updated later
        color: runningProcess.color || '#000'
      });
    } else {
      // Update the end time of the current Gantt chart entry
      const lastGanttItem = ganttChart[ganttChart.length - 1];
      if (lastGanttItem) {
        lastGanttItem.endTime = currentTime + 1;
      }
    }
    
    // Execute for 1 time unit
    runningProcess.remainingTime = (runningProcess.remainingTime || 0) - 1;
    currentTime += 1;
    
    // Check if the process is completed
    if (runningProcess.remainingTime === 0) {
      runningProcess.endTime = currentTime;
      completedProcesses.push(runningProcess);
    }
    
    prevRunningProcess = runningProcess;
  }
  
  // Combine consecutive Gantt chart items for the same process
  const optimizedGantt: GanttChartItem[] = [];
  for (const item of ganttChart) {
    const lastItem = optimizedGantt[optimizedGantt.length - 1];
    if (lastItem && lastItem.processId === item.processId && lastItem.endTime === item.startTime) {
      lastItem.endTime = item.endTime;
    } else {
      optimizedGantt.push({ ...item });
    }
  }
  
  const metrics = calculateMetrics(clonedProcesses);
  
  return {
    processes: clonedProcesses,
    ganttChart: optimizedGantt,
    metrics
  };
};

// Round Robin (RR)
export const roundRobin = (processes: Process[], timeQuantum: number) => {
  const clonedProcesses = cloneProcesses(processes);
  
  let currentTime = 0;
  const ganttChart: GanttChartItem[] = [];
  const completedProcesses: Process[] = [];
  const readyQueue: Process[] = [];
  
  // Continue until all processes are completed
  while (completedProcesses.length < clonedProcesses.length) {
    // Add newly arrived processes to the ready queue
    for (const process of clonedProcesses) {
      if (process.arrivalTime <= currentTime && 
          !readyQueue.includes(process) && 
          !completedProcesses.includes(process) && 
          !process.inQueue) {
        process.inQueue = true;
        readyQueue.push(process);
      }
    }
    
    if (readyQueue.length === 0) {
      // No process in ready queue, advance time to next arrival
      const nextArrival = clonedProcesses
        .filter(p => !completedProcesses.includes(p))
        .reduce((min, p) => p.arrivalTime < min ? p.arrivalTime : min, Infinity);
      currentTime = nextArrival;
      continue;
    }
    
    // Select the next process from the ready queue (FIFO)
    const selectedProcess = readyQueue.shift()!;
    
    // If this is the first time this process is running, set its start time
    if (selectedProcess.startTime === undefined) {
      selectedProcess.startTime = currentTime;
    }
    
    // Determine how much time this process will run
    const executeTime = Math.min(timeQuantum, selectedProcess.remainingTime || 0);
    
    // Add to Gantt chart
    ganttChart.push({
      processId: selectedProcess.id,
      startTime: currentTime,
      endTime: currentTime + executeTime,
      color: selectedProcess.color || '#000'
    });
    
    // Update process state
    selectedProcess.remainingTime = (selectedProcess.remainingTime || 0) - executeTime;
    currentTime += executeTime;
    
    // Check if the process is completed
    if (selectedProcess.remainingTime === 0) {
      selectedProcess.endTime = currentTime;
      completedProcesses.push(selectedProcess);
    } else {
      // Process still has remaining time, add back to ready queue
      selectedProcess.inQueue = false; // Reset flag to allow re-entry
    }
  }
  
  // Combine consecutive Gantt chart items for the same process
  const optimizedGantt: GanttChartItem[] = [];
  for (const item of ganttChart) {
    const lastItem = optimizedGantt[optimizedGantt.length - 1];
    if (lastItem && lastItem.processId === item.processId && lastItem.endTime === item.startTime) {
      lastItem.endTime = item.endTime;
    } else {
      optimizedGantt.push({ ...item });
    }
  }
  
  const metrics = calculateMetrics(clonedProcesses);
  
  return {
    processes: clonedProcesses,
    ganttChart: optimizedGantt,
    metrics
  };
};

// Multilevel Feedback Queue (MLFQ)
export const mlfq = (processes: Process[], timeQuantums: number[] = [8, 16, Infinity]) => {
  const clonedProcesses = cloneProcesses(processes);
  
  // Initialize queues for each level
  const queues: Process[][] = Array(timeQuantums.length).fill(null).map(() => []);
  
  let currentTime = 0;
  const ganttChart: GanttChartItem[] = [];
  const completedProcesses: Process[] = [];
  
  // Helper function to add a process to the appropriate queue
  const addToQueue = (process: Process, level = 0) => {
    if (level >= queues.length) level = queues.length - 1;
    process.level = level;
    queues[level].push(process);
  };
  
  // Continue until all processes are completed
  while (completedProcesses.length < clonedProcesses.length) {
    // Add newly arrived processes to the highest priority queue
    for (const process of clonedProcesses) {
      if (process.arrivalTime <= currentTime && 
          !completedProcesses.includes(process) && 
          !process.inQueue) {
        process.inQueue = true;
        addToQueue(process, 0); // Add to highest priority queue
      }
    }
    
    // Check if all queues are empty
    const allQueuesEmpty = queues.every(queue => queue.length === 0);
    
    if (allQueuesEmpty) {
      // No process in any queue, advance time to next arrival
      const nextArrival = clonedProcesses
        .filter(p => !completedProcesses.includes(p))
        .reduce((min, p) => p.arrivalTime < min ? p.arrivalTime : min, Infinity);
      currentTime = nextArrival;
      continue;
    }
    
    // Find the highest non-empty priority queue
    const activeQueueIndex = queues.findIndex(queue => queue.length > 0);
    const activeQueue = queues[activeQueueIndex];
    const timeQuantum = timeQuantums[activeQueueIndex];
    
    // Select the process at the front of the queue
    const selectedProcess = activeQueue.shift()!;
    
    // If this is the first time this process is running, set its start time
    if (selectedProcess.startTime === undefined) {
      selectedProcess.startTime = currentTime;
    }
    
    // Determine how much time this process will run
    const executeTime = Math.min(timeQuantum, selectedProcess.remainingTime || 0);
    
    // Add to Gantt chart
    ganttChart.push({
      processId: selectedProcess.id,
      startTime: currentTime,
      endTime: currentTime + executeTime,
      color: selectedProcess.color || '#000'
    });
    
    // Update process state
    selectedProcess.remainingTime = (selectedProcess.remainingTime || 0) - executeTime;
    currentTime += executeTime;
    
    // Check if the process is completed
    if (selectedProcess.remainingTime === 0) {
      selectedProcess.endTime = currentTime;
      completedProcesses.push(selectedProcess);
    } else {
      // Process still has remaining time, add to the next lower priority queue
      selectedProcess.inQueue = false; // Reset flag to allow re-entry
      addToQueue(selectedProcess, (selectedProcess.level || 0) + 1);
    }
  }
  
  // Combine consecutive Gantt chart items for the same process
  const optimizedGantt: GanttChartItem[] = [];
  for (const item of ganttChart) {
    const lastItem = optimizedGantt[optimizedGantt.length - 1];
    if (lastItem && lastItem.processId === item.processId && lastItem.endTime === item.startTime) {
      lastItem.endTime = item.endTime;
    } else {
      optimizedGantt.push({ ...item });
    }
  }
  
  const metrics = calculateMetrics(clonedProcesses);
  
  return {
    processes: clonedProcesses,
    ganttChart: optimizedGantt,
    metrics
  };
};

// Algorithm info for learning mode
export const algorithmInfo = {
  fcfs: {
    name: "First-Come, First-Served (FCFS)",
    description: "A non-preemptive scheduling algorithm that executes processes in the order they arrive.",
    pros: [
      "Simple to implement and understand",
      "Fair in terms of arrival time",
      "No starvation (every process will eventually get CPU time)"
    ],
    cons: [
      "Can lead to the \"convoy effect\" where short processes wait behind long ones",
      "Not optimal for interactive systems",
      "Higher average waiting time compared to other algorithms"
    ],
    useCases: [
      "Batch processing systems where response time is not critical",
      "Simple systems with similar process lengths",
      "When simplicity of implementation is more important than optimizing performance"
    ]
  },
  sjfNonPreemptive: {
    name: "Shortest Job First (SJF) - Non-preemptive",
    description: "A non-preemptive scheduling algorithm that selects the process with the shortest burst time next.",
    pros: [
      "Optimal average waiting time when all processes are available simultaneously",
      "Favors short processes, which can improve system throughput",
      "Good for batch systems where process times are known in advance"
    ],
    cons: [
      "Potential starvation of long processes if short ones keep arriving",
      "Requires knowledge of process burst times in advance",
      "Not ideal for interactive systems"
    ],
    useCases: [
      "Batch processing where process burst times are known",
      "Systems where throughput is more important than fairness",
      "When minimizing average waiting time is a priority"
    ]
  },
  sjfPreemptive: {
    name: "Shortest Job First (SJF) - Preemptive (SRTF)",
    description: "A preemptive version of SJF that always runs the process with the shortest remaining time.",
    pros: [
      "Provides the absolutely minimal average waiting time",
      "Responsive to short processes, improving interactive performance",
      "Adapts to changing execution patterns"
    ],
    cons: [
      "Higher overhead due to context switching",
      "Requires continuous monitoring of remaining time",
      "Potential starvation of longer processes",
      "Difficult to implement in practice as exact burst times are rarely known"
    ],
    useCases: [
      "Interactive systems where response time is critical",
      "Systems with mix of short and long processes where favoring short ones is beneficial",
      "When minimizing average waiting time is the primary goal"
    ]
  },
  priorityNonPreemptive: {
    name: "Priority Scheduling - Non-preemptive",
    description: "Selects processes based on priority, with lower values typically indicating higher priority.",
    pros: [
      "Allows important processes to run first",
      "Can implement business/organizational policies",
      "Balances system and user needs"
    ],
    cons: [
      "Potential starvation of low-priority processes",
      "May need priority aging to prevent starvation",
      "Not optimal for average waiting time"
    ],
    useCases: [
      "Real-time systems with critical tasks",
      "Systems where some processes are more important than others",
      "Operating systems that must balance system and user tasks"
    ]
  },
  priorityPreemptive: {
    name: "Priority Scheduling - Preemptive",
    description: "The preemptive version of priority scheduling where a process can be interrupted by a higher priority process.",
    pros: [
      "Immediate response to high-priority processes",
      "Adaptable to changing system conditions",
      "Good for real-time systems"
    ],
    cons: [
      "Higher overhead due to context switching",
      "Complex implementation",
      "Potential starvation of low-priority processes"
    ],
    useCases: [
      "Real-time operating systems",
      "Systems where critical tasks must be executed immediately",
      "Applications with varying levels of task importance"
    ]
  },
  roundRobin: {
    name: "Round Robin (RR)",
    description: "Each process gets a small unit of CPU time (time quantum) in a circular manner.",
    pros: [
      "Fair allocation of CPU time",
      "Good for time-sharing systems",
      "No starvation",
      "Good response time for short processes"
    ],
    cons: [
      "Performance depends heavily on time quantum size",
      "Higher average waiting time than SJF",
      "More context switching overhead"
    ],
    useCases: [
      "Time-sharing systems",
      "Interactive environments where responsiveness is important",
      "Systems with many users or processes requiring fair CPU distribution"
    ]
  },
  mlfq: {
    name: "Multilevel Feedback Queue (MLFQ)",
    description: "Uses multiple queues with different priorities and time quantums, moving processes between queues based on their behavior.",
    pros: [
      "Adapts to process behavior",
      "Favors short, interactive processes",
      "Balances between responsiveness and throughput",
      "Combines benefits of multiple scheduling algorithms"
    ],
    cons: [
      "Complex implementation",
      "Higher overhead",
      "Requires tuning of parameters (number of queues, time quantums)",
      "Potential starvation in some implementations"
    ],
    useCases: [
      "General-purpose operating systems",
      "Systems with varied workloads (mix of interactive and batch processes)",
      "Modern time-sharing systems requiring adaptability"
    ]
  }
};
