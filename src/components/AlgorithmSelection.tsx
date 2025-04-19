
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { algorithmInfo } from "@/utils/schedulingAlgorithms";

export type AlgorithmType = 
  | "fcfs" 
  | "sjfNonPreemptive" 
  | "sjfPreemptive" 
  | "priorityNonPreemptive" 
  | "priorityPreemptive" 
  | "roundRobin" 
  | "mlfq";

interface AlgorithmSelectionProps {
  selectedAlgorithm: AlgorithmType;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  timeQuantum: number;
  onTimeQuantumChange: (quantum: number) => void;
  mlfqTimeQuantums: number[];
  onMlfqTimeQuantumsChange: (quantums: number[]) => void;
  onRunSimulation: () => void;
  disableRun: boolean;
}

const AlgorithmSelection = ({ 
  selectedAlgorithm, 
  onAlgorithmChange,
  timeQuantum,
  onTimeQuantumChange,
  mlfqTimeQuantums,
  onMlfqTimeQuantumsChange,
  onRunSimulation,
  disableRun
}: AlgorithmSelectionProps) => {
  const [quantum1, setQuantum1] = useState(mlfqTimeQuantums[0]);
  const [quantum2, setQuantum2] = useState(mlfqTimeQuantums[1]);

  const handleMlfqChange = () => {
    const quantums = [quantum1, quantum2, Infinity];
    onMlfqTimeQuantumsChange(quantums);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Algorithm</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="algorithm">Scheduling Algorithm</Label>
            <Select 
              value={selectedAlgorithm} 
              onValueChange={(value) => onAlgorithmChange(value as AlgorithmType)}
            >
              <SelectTrigger id="algorithm">
                <SelectValue placeholder="Select algorithm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fcfs">First-Come, First-Served (FCFS)</SelectItem>
                <SelectItem value="sjfNonPreemptive">Shortest Job First (Non-preemptive)</SelectItem>
                <SelectItem value="sjfPreemptive">Shortest Job First (Preemptive)</SelectItem>
                <SelectItem value="priorityNonPreemptive">Priority Scheduling (Non-preemptive)</SelectItem>
                <SelectItem value="priorityPreemptive">Priority Scheduling (Preemptive)</SelectItem>
                <SelectItem value="roundRobin">Round Robin (RR)</SelectItem>
                <SelectItem value="mlfq">Multilevel Feedback Queue (MLFQ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedAlgorithm === "roundRobin" && (
            <div className="space-y-2">
              <Label htmlFor="timeQuantum">Time Quantum</Label>
              <Input
                id="timeQuantum"
                type="number"
                min="1"
                value={timeQuantum}
                onChange={(e) => onTimeQuantumChange(parseInt(e.target.value))}
              />
            </div>
          )}

          {selectedAlgorithm === "mlfq" && (
            <div className="space-y-2">
              <Label>MLFQ Time Quantums</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantum1">Queue 1 Quantum</Label>
                  <Input
                    id="quantum1"
                    type="number"
                    min="1"
                    value={quantum1}
                    onChange={(e) => {
                      setQuantum1(parseInt(e.target.value));
                      setTimeout(handleMlfqChange, 0);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="quantum2">Queue 2 Quantum</Label>
                  <Input
                    id="quantum2"
                    type="number"
                    min="1"
                    value={quantum2}
                    onChange={(e) => {
                      setQuantum2(parseInt(e.target.value));
                      setTimeout(handleMlfqChange, 0);
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Queue 3 has infinite time quantum (FCFS)
              </p>
            </div>
          )}

          {selectedAlgorithm && (
            <div className="mt-4 bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">{algorithmInfo[selectedAlgorithm].name}</h3>
              <p className="text-sm text-gray-700 mb-3">{algorithmInfo[selectedAlgorithm].description}</p>
              
              <div className="mb-2">
                <h4 className="text-sm font-medium text-blue-700">Advantages:</h4>
                <ul className="text-xs text-gray-600 list-disc pl-5 mt-1">
                  {algorithmInfo[selectedAlgorithm].pros.map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-2">
                <h4 className="text-sm font-medium text-blue-700">Disadvantages:</h4>
                <ul className="text-xs text-gray-600 list-disc pl-5 mt-1">
                  {algorithmInfo[selectedAlgorithm].cons.map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-blue-700">Use Cases:</h4>
                <ul className="text-xs text-gray-600 list-disc pl-5 mt-1">
                  {algorithmInfo[selectedAlgorithm].useCases.map((useCase, index) => (
                    <li key={index}>{useCase}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button 
              onClick={onRunSimulation}
              disabled={disableRun}
              className="bg-green-600 hover:bg-green-700"
            >
              Run Simulation
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgorithmSelection;
