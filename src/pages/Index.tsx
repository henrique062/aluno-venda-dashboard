
import React from 'react';
import SearchFilters from '@/components/SearchFilters';
import DataTable from '@/components/DataTable';
import DashboardStats from '@/components/DashboardStats';
import DashboardHeader from '@/components/DashboardHeader';
import { useHotmartData } from '@/hooks/useHotmartData';

const Index = () => {
  const {
    data,
    filteredData,
    isLoading,
    filters,
    activeFilterCount,
    updateFilters
  } = useHotmartData();

  const handleSearchChange = (search: string) => {
    updateFilters({ searchTerm: search });
  };

  const handleDateRangeChange = (type: 'order' | 'approval', range: { from?: Date; to?: Date }) => {
    if (type === 'order') {
      updateFilters({ orderDateRange: range });
    } else {
      updateFilters({ approvalDateRange: range });
    }
  };

  const handleStatusChange = (status: string) => {
    updateFilters({ selectedStatus: status });
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <DashboardHeader 
        isLoading={isLoading}
        totalCount={data.length}
        filteredCount={filteredData.length}
        activeFilterCount={activeFilterCount}
      />

      {!isLoading && <DashboardStats data={filteredData} />}

      <SearchFilters
        onSearchChange={handleSearchChange}
        onDateRangeChange={handleDateRangeChange}
        onProductChange={() => {}} // Not implemented - would use this for product-specific filter
        onStatusChange={handleStatusChange}
      />

      <DataTable data={filteredData} isLoading={isLoading} />
    </div>
  );
};

export default Index;
