
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProcessForm from "@/components/ProcessForm";
import ProcessTable from "@/components/ProcessTable";
import AlgorithmSelection, { AlgorithmType } from "@/components/AlgorithmSelection";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import GanttChart from "@/components/GanttChart";
import { Process, GanttChartItem } from "@/models/Process";
import { 
  fcfs, 
  sjfNonPreemptive, 
  sjfPreemptive, 
  priorityNonPreemptive, 
  priorityPreemptive, 
  roundRobin, 
  mlfq 
} from "@/utils/schedulingAlgorithms";

const Index = () => {
  // State for processes
  const [processes, setProcesses] = useState<Process[]>([]);
  const [simulatedProcesses, setSimulatedProcesses] = useState<Process[]>([]);
  
  // State for algorithm selection
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>("fcfs");
  const [timeQuantum, setTimeQuantum] = useState(4);
  const [mlfqTimeQuantums, setMlfqTimeQuantums] = useState([8, 16, Infinity]);
  
  // State for Gantt chart
  const [ganttData, setGanttData] = useState<GanttChartItem[]>([]);
  
  // State for metrics
  const [metrics, setMetrics] = useState({
    avgWaitingTime: 0,
    avgTurnaroundTime: 0,
    avgResponseTime: 0,
    cpuUtilization: 0,
    throughput: 0,
    makespan: 0
  });
  
  // State for simulation status
  const [simulationRun, setSimulationRun] = useState(false);
  
  // Handle adding a new process
  const handleAddProcess = (process: Process) => {
    // Check for duplicate process ID
    if (processes.some(p => p.id === process.id)) {
      alert(`Process with ID ${process.id} already exists`);
      return;
    }
    
    setProcesses([...processes, process]);
    setSimulationRun(false);
  };
  
  // Handle clearing all processes
  const handleClearProcesses = () => {
    setProcesses([]);
    setSimulatedProcesses([]);
    setGanttData([]);
    setSimulationRun(false);
  };
  
  // Handle running the simulation
  const runSimulation = () => {
    if (processes.length === 0) {
      alert("Please add at least one process before running the simulation");
      return;
    }
    
    let result;
    
    switch (selectedAlgorithm) {
      case "fcfs":
        result = fcfs(processes);
        break;
      case "sjfNonPreemptive":
        result = sjfNonPreemptive(processes);
        break;
      case "sjfPreemptive":
        result = sjfPreemptive(processes);
        break;
      case "priorityNonPreemptive":
        result = priorityNonPreemptive(processes);
        break;
      case "priorityPreemptive":
        result = priorityPreemptive(processes);
        break;
      case "roundRobin":
        result = roundRobin(processes, timeQuantum);
        break;
      case "mlfq":
        result = mlfq(processes, mlfqTimeQuantums);
        break;
      default:
        alert("Invalid algorithm selection");
        return;
    }
    
    setSimulatedProcesses(result.processes);
    setGanttData(result.ganttChart);
    setMetrics(result.metrics);
    setSimulationRun(true);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">CPU Scheduling Simulator</h1>
        <p className="text-gray-600 mt-2">
          Visualize and compare different CPU scheduling algorithms
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ProcessForm 
          onAddProcess={handleAddProcess} 
          onClearProcesses={handleClearProcesses} 
        />
        
        <AlgorithmSelection 
          selectedAlgorithm={selectedAlgorithm}
          onAlgorithmChange={setSelectedAlgorithm}
          timeQuantum={timeQuantum}
          onTimeQuantumChange={setTimeQuantum}
          mlfqTimeQuantums={mlfqTimeQuantums}
          onMlfqTimeQuantumsChange={setMlfqTimeQuantums}
          onRunSimulation={runSimulation}
          disableRun={processes.length === 0}
        />
      </div>
      
      <Tabs defaultValue="processes" className="w-full mb-6">
        <TabsList>
          <TabsTrigger value="processes">Processes</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="processes" className="p-4 border rounded-md mt-2">
          <ProcessTable 
            processes={simulationRun ? simulatedProcesses : processes} 
            resultsAvailable={simulationRun}
          />
        </TabsContent>
        
        <TabsContent value="visualization" className="mt-2">
          {simulationRun ? (
            <div className="space-y-6">
              <GanttChart ganttData={ganttData} />
              <PerformanceMetrics {...metrics} />
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 border rounded-md">
              Run a simulation to see visualization and metrics
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="text-center text-gray-500 text-sm mt-8">
        <p>
          CPU Scheduling Simulation Tool &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Index;
