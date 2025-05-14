
import { useState, useEffect, useMemo } from 'react';
import { HotmartEventBodyOrdered } from '@/lib/supabase';
import { fetchHotmartData, setupRealtimeSubscription } from '@/services/hotmartService';
import { FilterState, applyFilters, countActiveFilters } from '@/utils/hotmartFilters';

export { FilterState } from '@/utils/hotmartFilters';

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

  // Fetch data function wrapped for reuse
  const loadData = async () => {
    setIsLoading(true);
    const fetchedData = await fetchHotmartData();
    setData(fetchedData);
    setIsLoading(false);
  };

  // Set up initial data fetch
  useEffect(() => {
    console.log('Setting up initial data fetch...');
    loadData();
  }, []);

  // Set up realtime subscription
  useEffect(() => {
    const cleanup = setupRealtimeSubscription(loadData);
    return cleanup;
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    const filtered = applyFilters(data, filters);
    setFilteredData(filtered);
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
    return countActiveFilters(filters);
  }, [filters]);

  return {
    data,
    filteredData,
    isLoading,
    filters,
    activeFilterCount,
    updateFilters,
    fetchData: loadData
  };
};
