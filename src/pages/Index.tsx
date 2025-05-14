import React, { useEffect, useState, useMemo } from 'react';
import { supabase, HotmartEventBodyOrdered } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import SearchFilters from '@/components/SearchFilters';
import DataTable from '@/components/DataTable';
import DashboardStats from '@/components/DashboardStats';
import { isWithinInterval } from 'date-fns';

const Index = () => {
  const [data, setData] = useState<HotmartEventBodyOrdered[]>([]);
  const [filteredData, setFilteredData] = useState<HotmartEventBodyOrdered[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [orderDateRange, setOrderDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [approvalDateRange, setApprovalDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedStatus, setSelectedStatus] = useState('all');

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
        throw error;
      }
      
      console.log('Data fetched successfully:', data);
      setData(data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados do Supabase. Verifique o console para mais detalhes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    console.log('Setting up initial data fetch and realtime subscription...');
    fetchData();

    // Set up realtime subscription
    const subscription = supabase
      .channel('hotmart_events_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'hotmart_events' 
      }, (payload) => {
        console.log('Change received!', payload);
        fetchData(); // Reload all data when any change happens
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription...');
      subscription.unsubscribe();
    };
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    console.log('Applying filters with:', { 
      searchTerm, 
      orderDateRange, 
      approvalDateRange, 
      selectedStatus,
      dataLength: data.length
    });
    
    let results = data;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(
        item =>
          (item.buyer_name?.toLowerCase() || '').includes(searchLower) ||
          (item.buyer_email?.toLowerCase() || '').includes(searchLower) ||
          (item.product_name?.toLowerCase() || '').includes(searchLower) ||
          (item.purchase_transaction?.toLowerCase() || '').includes(searchLower)
      );
    }

    // Apply order date range filter
    if (orderDateRange.from) {
      results = results.filter(item => {
        if (!item.purchase_order_date) return false;
        
        const orderDate = new Date(item.purchase_order_date);
        
        if (orderDateRange.from && orderDateRange.to) {
          // Set the end of the day for the to date
          const toDate = new Date(orderDateRange.to);
          toDate.setHours(23, 59, 59, 999);
          
          return isWithinInterval(orderDate, { 
            start: orderDateRange.from, 
            end: toDate 
          });
        } else if (orderDateRange.from) {
          // Just check if it's after the from date
          return orderDate >= orderDateRange.from;
        }
        
        return true;
      });
    }

    // Apply approval date range filter
    if (approvalDateRange.from) {
      results = results.filter(item => {
        if (!item.purchase_approved_date) return false;
        
        const approvalDate = new Date(item.purchase_approved_date);
        
        if (approvalDateRange.from && approvalDateRange.to) {
          // Set the end of the day for the to date
          const toDate = new Date(approvalDateRange.to);
          toDate.setHours(23, 59, 59, 999);
          
          return isWithinInterval(approvalDate, { 
            start: approvalDateRange.from, 
            end: toDate 
          });
        } else if (approvalDateRange.from) {
          // Just check if it's after the from date
          return approvalDate >= approvalDateRange.from;
        }
        
        return true;
      });
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      results = results.filter(item => item.purchase_status === selectedStatus);
    }

    console.log('Filtered results:', results.length);
    setFilteredData(results);
  }, [data, searchTerm, orderDateRange, approvalDateRange, selectedStatus]);

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleDateRangeChange = (type: 'order' | 'approval', range: { from?: Date; to?: Date }) => {
    if (type === 'order') {
      setOrderDateRange(range);
    } else {
      setApprovalDateRange(range);
    }
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  // Display current filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (orderDateRange.from) count++;
    if (approvalDateRange.from) count++;
    if (selectedStatus !== 'all') count++;
    return count;
  }, [searchTerm, orderDateRange, approvalDateRange, selectedStatus]);

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard de Vendas</h1>
          <p className="text-muted-foreground">
            {isLoading 
              ? 'Carregando dados...' 
              : `Mostrando ${filteredData.length} de ${data.length} registros`}
            {activeFilterCount > 0 && ` (${activeFilterCount} filtros ativos)`}
          </p>
        </div>
      </div>

      {!isLoading && <DashboardStats data={filteredData} />}

      <SearchFilters
        onSearchChange={setSearchTerm}
        onDateRangeChange={handleDateRangeChange}
        onProductChange={() => {}} // Not implemented - would use this for product-specific filter
        onStatusChange={setSelectedStatus}
      />

      <DataTable data={filteredData} isLoading={isLoading} />
    </div>
  );
};

export default Index;
