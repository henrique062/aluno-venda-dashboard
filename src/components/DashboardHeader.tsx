
import React from 'react';

interface DashboardHeaderProps {
  isLoading: boolean;
  totalCount: number;
  filteredCount: number;
  activeFilterCount: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isLoading,
  totalCount,
  filteredCount,
  activeFilterCount
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendas</h1>
        <p className="text-muted-foreground">
          {isLoading 
            ? 'Carregando dados...' 
            : `Mostrando ${filteredCount} de ${totalCount} registros`}
          {activeFilterCount > 0 && ` (${activeFilterCount} filtros ativos)`}
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;
