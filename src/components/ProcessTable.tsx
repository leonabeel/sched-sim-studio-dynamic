
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Process } from "@/models/Process";

interface ProcessTableProps {
  processes: Process[];
  resultsAvailable: boolean;
}

const ProcessTable = ({ processes, resultsAvailable }: ProcessTableProps) => {
  if (processes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No processes added yet. Use the form above to add processes.
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Process ID</TableHead>
            <TableHead>Arrival Time</TableHead>
            <TableHead>Burst Time</TableHead>
            <TableHead>Priority</TableHead>
            {resultsAvailable && (
              <>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Waiting Time</TableHead>
                <TableHead>Turnaround Time</TableHead>
                <TableHead>Response Time</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {processes.map((process) => (
            <TableRow key={process.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">
                <div 
                  className="inline-block w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: process.color || '#ccc' }}
                ></div>
                {process.id}
              </TableCell>
              <TableCell>{process.arrivalTime}</TableCell>
              <TableCell>{process.burstTime}</TableCell>
              <TableCell>{process.priority}</TableCell>
              {resultsAvailable && (
                <>
                  <TableCell>{process.startTime}</TableCell>
                  <TableCell>{process.endTime}</TableCell>
                  <TableCell>{process.waitingTime}</TableCell>
                  <TableCell>{process.turnaroundTime}</TableCell>
                  <TableCell>{process.responseTime}</TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProcessTable;
