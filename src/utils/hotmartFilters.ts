
import { HotmartEventBodyOrdered } from '@/lib/supabase';
import { isWithinInterval } from 'date-fns';

export interface FilterState {
  searchTerm: string;
  orderDateRange: { from?: Date; to?: Date };
  approvalDateRange: { from?: Date; to?: Date };
  selectedStatus: string;
}

export const applyFilters = (
  data: HotmartEventBodyOrdered[],
  filters: FilterState
): HotmartEventBodyOrdered[] => {
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
  return results;
};

export const countActiveFilters = (filters: FilterState): number => {
  let count = 0;
  if (filters.searchTerm) count++;
  if (filters.orderDateRange.from) count++;
  if (filters.approvalDateRange.from) count++;
  if (filters.selectedStatus !== 'all') count++;
  return count;
};
