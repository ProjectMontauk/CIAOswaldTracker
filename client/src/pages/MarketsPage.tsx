import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function MarketsPage() {
  const queryClient = useQueryClient();
  
  const { data: markets } = useQuery({
    queryKey: ['markets'],
    queryFn: () => fetch('/api/markets').then(res => res.json())
  });
} 

<div className="flex justify-between items-center">
  <div>
    <h2 className="text-2xl font-bold text-primary">Tinfoil</h2>
    <p className="text-sm text-muted-foreground">Question it All</p>
  </div>
</div> 