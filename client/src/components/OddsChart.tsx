import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface OddsHistoryPoint {
  timestamp: string;
  yesOdds: number;
  noOdds: number;
}

export function OddsChart({ marketId }: { marketId: number }) {
  const { data: history = [] } = useQuery<OddsHistoryPoint[]>({
    queryKey: ['oddsHistory', marketId],
    queryFn: async () => {
      const response = await fetch(`/api/markets/${marketId}/odds-history`);
      return response.json();
    }
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history}>
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(time) => new Date(time).toLocaleDateString()} 
          />
          <YAxis 
            domain={[0, 1]} 
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} 
          />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="yesOdds" 
            stroke="#10b981" 
            name="Yes" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 