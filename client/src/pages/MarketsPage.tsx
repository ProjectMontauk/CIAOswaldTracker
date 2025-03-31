import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function MarketsPage() {
  const queryClient = useQueryClient();
  
  const { data: markets } = useQuery({
    queryKey: ['markets'],
    queryFn: () => fetch('/api/markets').then(res => res.json())
  });
} 