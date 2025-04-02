import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';

interface OddsHistoryPoint {
  timestamp: string;
  yesOdds: string;
  noOdds: string;
}

export function OddsChart({ marketId }: { marketId: number }) {
  const { data: history = [] } = useQuery({
    queryKey: ['oddsHistory', marketId],
    queryFn: async () => {
      const response = await fetch(`/api/markets/${marketId}/odds-history`);
      return response.json();
    }
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <Line 
            type="linear" 
            dataKey="yesOdds" 
            stroke="#10b981" 
            dot={(props) => {
              const isLastPoint = props.index === history.length - 1;
              return isLastPoint ? (
                <circle 
                  cx={props.cx} 
                  cy={props.cy} 
                  r={4} 
                  fill="#10b981"
                />
              ) : null;
            }}
            strokeWidth={2}
            name="Yes Probability"
          />
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false}
            stroke="#94a3b8"
            opacity={1}
            strokeWidth={0.5}
          />
          <XAxis 
            dataKey="timestamp"
            tickFormatter={(time) => {
              const date = new Date(time);
              return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            }}
            tick={{ fontSize: 12 }}
            ticks={[history[0]?.timestamp]}
            label={false}
          />
          <YAxis 
            domain={[0, 1]} 
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            orientation="right"
            tick={{ 
              fontSize: 12,
              dy: 0,
              textAnchor: 'start',
              dominantBaseline: 'auto'
            }}
            axisLine={false}
            tickLine={true}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
          />
          <Tooltip 
            formatter={(value: any) => `${(Number(value) * 100).toFixed(1)}%`}
            labelFormatter={(label) => new Date(label).toLocaleString()}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 