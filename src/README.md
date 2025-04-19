
# CPU Scheduling Simulator

A dynamic, interactive web application for visualizing and comparing different CPU scheduling algorithms.

## Features

- **Process Management**: Create and manage multiple processes with customizable attributes (ID, Arrival Time, Burst Time, Priority)
- **Multiple Scheduling Algorithms**:
  - First-Come, First-Served (FCFS)
  - Shortest Job First (SJF) - both preemptive and non-preemptive
  - Priority Scheduling - both preemptive and non-preemptive
  - Round Robin (RR) with configurable time quantum
  - Multilevel Feedback Queue (MLFQ) with configurable queue parameters
- **Dynamic Visualization**: Interactive Gantt chart displaying process execution over time
- **Performance Metrics**: Detailed metrics including average waiting time, turnaround time, CPU utilization, and throughput
- **Learning Mode**: Built-in explanations for each algorithm, including advantages, disadvantages, and use cases

## How to Use

1. **Add Processes**: Use the form to add processes with unique IDs and specific attributes
2. **Select Algorithm**: Choose a scheduling algorithm and configure its parameters if needed
3. **Run Simulation**: Click "Run Simulation" to execute the algorithm
4. **View Results**: Switch between the Processes tab to see detailed process information and the Visualization tab to view the Gantt chart and performance metrics
5. **Compare Algorithms**: Change the algorithm and run the simulation again to compare results

## Technical Implementation

- Built with React and TypeScript
- Uses Tailwind CSS for styling
- Implements all algorithms in JavaScript with simulation logic
- Canvas-based Gantt chart visualization

## Educational Value

This application serves as an educational tool for understanding:
- How different CPU scheduling algorithms work
- The trade-offs between algorithms for different workloads
- Key performance metrics in CPU scheduling
- The impact of process characteristics on scheduling outcomes
