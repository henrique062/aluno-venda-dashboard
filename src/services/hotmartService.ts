
import { supabase, HotmartEventBodyOrdered } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const fetchHotmartData = async (): Promise<HotmartEventBodyOrdered[]> => {
  try {
    console.log('Fetching data from Supabase...');
    
    const { data, error } = await supabase
      .from('hotmarteventbodyordered')
      .select('*')
      .order('purchase_order_date', { ascending: false });

    if (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: `Falha ao buscar dados: ${error.message || "Erro desconhecido"}`,
        variant: 'destructive',
      });
      return [];
    }
    
    console.log('Data fetched successfully:', data);
    return data || [];
  } catch (error: any) {
    console.error('Error fetching data:', error);
    toast({
      title: 'Erro ao carregar dados',
      description: `Erro inesperado: ${error?.message || "Erro desconhecido"}`,
      variant: 'destructive',
    });
    return [];
  }
};

export const setupRealtimeSubscription = (onDataChange: () => void) => {
  console.log('Setting up realtime subscription...');
  
  const channel = supabase
    .channel('schema-db-changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'hotmarteventbodyordered' 
    }, (payload) => {
      console.log('Change received!', payload);
      onDataChange(); // Reload data when any change happens
    })
    .subscribe((status, error) => {
      console.log('Realtime subscription status:', status, error || '');
      if (error) {
        console.error('Realtime subscription error:', error);
      }
    });

  return () => {
    console.log('Cleaning up subscription...');
    supabase.removeChannel(channel);
  };
};
