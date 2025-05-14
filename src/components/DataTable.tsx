
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { HotmartEventBodyOrdered, formatCurrency, formatDate, getStatusColor } from '@/lib/supabase';

interface DataTableProps {
  data: HotmartEventBodyOrdered[];
  isLoading: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className="p-4">
        <div className="flex justify-center items-center h-64 text-gray-500">
          Nenhum resultado encontrado.
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[200px]">Nome do Aluno</TableHead>
              <TableHead className="w-[180px]">Email</TableHead>
              <TableHead className="w-[120px]">Telefone</TableHead>
              <TableHead className="w-[200px]">Produto</TableHead>
              <TableHead className="w-[120px]">ID Transação</TableHead>
              <TableHead className="w-[160px]">Data do Pedido</TableHead>
              <TableHead className="w-[160px]">Data de Aprovação</TableHead>
              <TableHead className="w-[120px]">Valor</TableHead>
              <TableHead className="w-[150px]">Pagamento</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[80px]">Parcelas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.id || index} className="hover:bg-muted/30">
                <TableCell className="font-medium">{item.buyer_name || 'N/A'}</TableCell>
                <TableCell className="text-sm">{item.buyer_email || 'N/A'}</TableCell>
                <TableCell className="text-sm">
                  {item.buyer_checkout_phone_code || ''} {item.buyer_checkout_phone || 'N/A'}
                </TableCell>
                <TableCell className="text-sm">{item.product_name || 'N/A'}</TableCell>
                <TableCell className="text-sm">{item.purchase_transaction || 'N/A'}</TableCell>
                <TableCell className="text-sm">{formatDate(item.purchase_order_date || '')}</TableCell>
                <TableCell className="text-sm">{formatDate(item.purchase_approved_date || '')}</TableCell>
                <TableCell className="text-sm font-semibold">
                  {formatCurrency(item.purchase_price_value || 0)}
                </TableCell>
                <TableCell className="text-sm">{item.purchase_payment_type || 'N/A'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.purchase_status || '')}`}>
                    {item.purchase_status || 'N/A'}
                  </span>
                </TableCell>
                <TableCell className="text-center text-sm">
                  {item.purchase_payment_installments_number || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default DataTable;
