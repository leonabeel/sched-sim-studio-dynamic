
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricsProps {
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  cpuUtilization: number;
  throughput: number;
  makespan: number;
}

const PerformanceMetrics = ({
  avgWaitingTime,
  avgTurnaroundTime,
  avgResponseTime,
  cpuUtilization,
  throughput,
  makespan
}: MetricsProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-sm font-medium text-blue-800">Average Waiting Time</div>
            <div className="text-2xl font-bold text-blue-600">{avgWaitingTime.toFixed(2)}</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-md">
            <div className="text-sm font-medium text-green-800">Average Turnaround Time</div>
            <div className="text-2xl font-bold text-green-600">{avgTurnaroundTime.toFixed(2)}</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-md">
            <div className="text-sm font-medium text-purple-800">Average Response Time</div>
            <div className="text-2xl font-bold text-purple-600">{avgResponseTime.toFixed(2)}</div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-md">
            <div className="text-sm font-medium text-yellow-800">CPU Utilization</div>
            <div className="text-2xl font-bold text-yellow-600">{cpuUtilization.toFixed(2)}%</div>
          </div>
          
          <div className="bg-indigo-50 p-3 rounded-md">
            <div className="text-sm font-medium text-indigo-800">Throughput</div>
            <div className="text-2xl font-bold text-indigo-600">{throughput.toFixed(4)} proc/time</div>
          </div>
          
          <div className="bg-pink-50 p-3 rounded-md">
            <div className="text-sm font-medium text-pink-800">Makespan</div>
            <div className="text-2xl font-bold text-pink-600">{makespan}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
