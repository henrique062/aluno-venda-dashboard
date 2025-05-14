
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HotmartEventBodyOrdered, formatCurrency } from '@/lib/supabase';

interface DashboardStatsProps {
  data: HotmartEventBodyOrdered[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ data }) => {
  const totalSales = data.length;
  
  const totalRevenue = data.reduce((acc, item) => {
    return acc + (item.purchase_price_value || 0);
  }, 0);
  
  const approvedSales = data.filter(item => 
    item.purchase_status === 'APPROVED' || item.purchase_status === 'COMPLETE'
  ).length;
  
  const uniqueStudents = new Set(data.map(item => item.buyer_email)).size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSales}</div>
          <p className="text-xs text-muted-foreground">
            {approvedSales} aprovadas
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            Média: {formatCurrency(totalSales ? totalRevenue / totalSales : 0)}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Alunos Únicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueStudents}</div>
          <p className="text-xs text-muted-foreground">
            Taxa de conversão: {totalSales ? ((approvedSales / totalSales) * 100).toFixed(1) : 0}%
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Produtos Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Set(data.map(item => item.product_name)).size}
          </div>
          <p className="text-xs text-muted-foreground">
            Por aluno: {uniqueStudents ? (totalSales / uniqueStudents).toFixed(1) : 0}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
