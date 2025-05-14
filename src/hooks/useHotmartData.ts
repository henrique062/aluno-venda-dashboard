
import { useState, useEffect, useMemo } from 'react';
import { isWithinInterval } from 'date-fns';
import { supabase, HotmartEventBodyOrdered } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export interface FilterState {
  searchTerm: string;
  orderDateRange: { from?: Date; to?: Date };
  approvalDateRange: { from?: Date; to?: Date };
  selectedStatus: string;
}

export const useHotmartData = () => {
  const [data, setData] = useState<HotmartEventBodyOrdered[]>([]);
  const [filteredData, setFilteredData] = useState<HotmartEventBodyOrdered[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    orderDateRange: {},
    approvalDateRange: {},
    selectedStatus: 'all'
  });

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      console.log('Fetching data from Supabase...');
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('hotmart_events')
        .select('*')
        .order('purchase_order_date', { ascending: false });

      if (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Erro ao carregar dados',
          description: `Falha ao buscar dados: ${error.message || "Erro desconhecido"}`,
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Data fetched successfully:', data);
      setData(data || []);
      setFilteredData(data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: `Erro inesperado: ${error?.message || "Erro desconhecido"}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up initial data fetch
  useEffect(() => {
    console.log('Setting up initial data fetch...');
    fetchData();
  }, []);

  // Set up realtime subscription
  useEffect(() => {
    console.log('Setting up realtime subscription...');
    
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'hotmart_events' 
      }, (payload) => {
        console.log('Change received!', payload);
        fetchData(); // Reload all data when any change happens
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
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    console.log('Applying filters with:', { 
      ...filters,
      dataLength: data.length
    });
    
    let results = data;

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      results = results.filter(
        item =>
          (item.buyer_name?.toLowerCase() || '').includes(searchLower) ||
          (item.buyer_email?.toLowerCase() || '').includes(searchLower) ||
          (item.product_name?.toLowerCase() || '').includes(searchLower) ||
          (item.purchase_transaction?.toLowerCase() || '').includes(searchLower)
      );
    }

    // Apply order date range filter
    if (filters.orderDateRange.from) {
      results = results.filter(item => {
        if (!item.purchase_order_date) return false;
        
        const orderDate = new Date(item.purchase_order_date);
        
        if (filters.orderDateRange.from && filters.orderDateRange.to) {
          // Set the end of the day for the to date
          const toDate = new Date(filters.orderDateRange.to);
          toDate.setHours(23, 59, 59, 999);
          
          return isWithinInterval(orderDate, { 
            start: filters.orderDateRange.from, 
            end: toDate 
          });
        } else if (filters.orderDateRange.from) {
          // Just check if it's after the from date
          return orderDate >= filters.orderDateRange.from;
        }
        
        return true;
      });
    }

    // Apply approval date range filter
    if (filters.approvalDateRange.from) {
      results = results.filter(item => {
        if (!item.purchase_approved_date) return false;
        
        const approvalDate = new Date(item.purchase_approved_date);
        
        if (filters.approvalDateRange.from && filters.approvalDateRange.to) {
          // Set the end of the day for the to date
          const toDate = new Date(filters.approvalDateRange.to);
          toDate.setHours(23, 59, 59, 999);
          
          return isWithinInterval(approvalDate, { 
            start: filters.approvalDateRange.from, 
            end: toDate 
          });
        } else if (filters.approvalDateRange.from) {
          // Just check if it's after the from date
          return approvalDate >= filters.approvalDateRange.from;
        }
        
        return true;
      });
    }

    // Apply status filter
    if (filters.selectedStatus !== 'all') {
      results = results.filter(item => item.purchase_status === filters.selectedStatus);
    }

    console.log('Filtered results:', results.length);
    setFilteredData(results);
  }, [data, filters]);

  // Update filter functions
  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.orderDateRange.from) count++;
    if (filters.approvalDateRange.from) count++;
    if (filters.selectedStatus !== 'all') count++;
    return count;
  }, [filters]);

  return {
    data,
    filteredData,
    isLoading,
    filters,
    activeFilterCount,
    updateFilters,
    fetchData
  };
};
