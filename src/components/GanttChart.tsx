
import { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GanttChartItem } from "@/models/Process";

interface GanttChartProps {
  ganttData: GanttChartItem[];
}

const GanttChart = ({ ganttData }: GanttChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
    if (!ganttData.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate the end time of the last process
    const endTime = Math.max(...ganttData.map(item => item.endTime));
    
    // Calculate width and height for rendering
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const barHeight = 50;
    const timeUnitWidth = canvasWidth / (endTime + 1); // Add 1 for padding
    
    // Draw the Gantt chart
    let y = 20; // Starting y position
    
    // Draw time markers
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    for (let t = 0; t <= endTime; t++) {
      const x = t * timeUnitWidth;
      ctx.fillText(t.toString(), x, 15);
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, barHeight + 20);
      ctx.strokeStyle = '#ddd';
      ctx.stroke();
    }

    // Draw process bars
    ganttData.forEach((item) => {
      const startX = item.startTime * timeUnitWidth;
      const width = (item.endTime - item.startTime) * timeUnitWidth;
      
      // Draw the bar
      ctx.fillStyle = item.color;
      ctx.fillRect(startX, y, width, barHeight);
      
      // Draw borders
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(startX, y, width, barHeight);
      
      // Add process ID
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.processId, startX + width / 2, y + barHeight / 2);
      
      // Add start and end time
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.startTime.toString(), startX, y + barHeight + 15);
      ctx.fillText(item.endTime.toString(), startX + width, y + barHeight + 15);
    });

  }, [ganttData]);

  if (!ganttData.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gantt Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-gray-500">
            Run a simulation to see the Gantt chart
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gantt Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={100}
            className="min-w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GanttChart;
