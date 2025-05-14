
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface SearchFiltersProps {
  onSearchChange: (search: string) => void;
  onDateRangeChange: (type: 'order' | 'approval', range: { from?: Date; to?: Date }) => void;
  onProductChange: (product: string) => void;
  onStatusChange: (status: string) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  onSearchChange,
  onDateRangeChange,
  onProductChange,
  onStatusChange,
}) => {
  // Using DateRange type for compatibility with the Calendar component
  const [orderDateRange, setOrderDateRange] = useState<DateRange | undefined>();
  const [approvalDateRange, setApprovalDateRange] = useState<DateRange | undefined>();

  const handleOrderDateSelect = (range: DateRange | undefined) => {
    setOrderDateRange(range);
    // Convert to the expected format for the parent component
    if (range) {
      onDateRangeChange('order', { from: range.from, to: range.to });
    } else {
      onDateRangeChange('order', {});
    }
  };

  const handleApprovalDateSelect = (range: DateRange | undefined) => {
    setApprovalDateRange(range);
    // Convert to the expected format for the parent component
    if (range) {
      onDateRangeChange('approval', { from: range.from, to: range.to });
    } else {
      onDateRangeChange('approval', {});
    }
  };

  return (
    <div className="space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Buscar por nome, email ou produto..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start w-full sm:w-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {orderDateRange?.from ? (
                orderDateRange.to ? (
                  <>
                    {format(orderDateRange.from, 'dd/MM/yy')} - {format(orderDateRange.to, 'dd/MM/yy')}
                  </>
                ) : (
                  format(orderDateRange.from, 'dd/MM/yy')
                )
              ) : (
                "Data do Pedido"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={orderDateRange}
              onSelect={handleOrderDateSelect}
              locale={ptBR}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start w-full sm:w-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {approvalDateRange?.from ? (
                approvalDateRange.to ? (
                  <>
                    {format(approvalDateRange.from, 'dd/MM/yy')} - {format(approvalDateRange.to, 'dd/MM/yy')}
                  </>
                ) : (
                  format(approvalDateRange.from, 'dd/MM/yy')
                )
              ) : (
                "Data de Aprovação"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={approvalDateRange}
              onSelect={handleApprovalDateSelect}
              locale={ptBR}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        <Select onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="APPROVED">Aprovado</SelectItem>
            <SelectItem value="COMPLETE">Completo</SelectItem>
            <SelectItem value="CANCELED">Cancelado</SelectItem>
            <SelectItem value="REFUNDED">Reembolsado</SelectItem>
            <SelectItem value="PENDING">Pendente</SelectItem>
            <SelectItem value="CHARGEBACK">Estorno</SelectItem>
            <SelectItem value="DISPUTE">Disputa</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchFilters;
