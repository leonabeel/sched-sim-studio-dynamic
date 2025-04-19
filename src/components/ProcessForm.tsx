
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Process } from "@/models/Process";

interface ProcessFormProps {
  onAddProcess: (process: Process) => void;
  onClearProcesses: () => void;
}

const ProcessForm = ({ onAddProcess, onClearProcesses }: ProcessFormProps) => {
  const [processId, setProcessId] = useState("");
  const [arrivalTime, setArrivalTime] = useState(0);
  const [burstTime, setBurstTime] = useState(1);
  const [priority, setPriority] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!processId.trim()) {
      alert("Please enter a valid Process ID");
      return;
    }
    
    if (burstTime <= 0) {
      alert("Burst Time must be greater than 0");
      return;
    }
    
    const newProcess: Process = {
      id: processId,
      arrivalTime,
      burstTime,
      priority,
    };
    
    onAddProcess(newProcess);
    
    // Reset form for next process
    setProcessId("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add Process</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="processId">Process ID</Label>
              <Input
                id="processId"
                value={processId}
                onChange={(e) => setProcessId(e.target.value)}
                placeholder="P1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrivalTime">Arrival Time</Label>
              <Input
                id="arrivalTime"
                type="number"
                min="0"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(parseInt(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="burstTime">Burst Time</Label>
              <Input
                id="burstTime"
                type="number"
                min="1"
                value={burstTime}
                onChange={(e) => setBurstTime(parseInt(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              Add Process
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClearProcesses}
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              Clear All
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProcessForm;
