
import { createClient } from '@supabase/supabase-js';

// Supabase connection
const supabaseUrl = 'https://tybdysmxmxzwebaooeqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5YmR5c214bXh6d2ViYW9vZXFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjA1MzU4MywiZXhwIjoyMDYxNjI5NTgzfQ.1cPee3mXQujnT28QzfLqfMg5ji2Jvi6JtdZdS9k_WyA';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { 
    persistSession: false,
    autoRefreshToken: false,
  },
  global: { 
    headers: { 
      'x-app-version': '1.0.0',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    } 
  },
  // Enable debug mode to see logs
  db: {
    schema: 'public',
  }
});

// Type definition for HotmartEventBodyOrdered
export interface HotmartEventBodyOrdered {
  id?: string;
  buyer_name: string;
  buyer_email: string;
  buyer_checkout_phone_code: string;
  buyer_checkout_phone: string;
  product_name: string;
  purchase_transaction: string;
  purchase_order_date: string;
  purchase_approved_date: string;
  purchase_price_value: number;
  purchase_payment_type: string;
  purchase_status: string;
  purchase_payment_installments_number: number;
  event_creation_date: string;
}

export const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  // Convert to GMT-3 (Brasilia time)
  const date = new Date(dateString);
  date.setHours(date.getHours() - 3);
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    'APPROVED': 'bg-green-100 text-green-800',
    'COMPLETE': 'bg-green-100 text-green-800',
    'CANCELED': 'bg-red-100 text-red-800',
    'REFUNDED': 'bg-orange-100 text-orange-800',
    'CHARGEBACK': 'bg-red-100 text-red-800',
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'DISPUTE': 'bg-purple-100 text-purple-800',
  };
  
  return statusMap[status] || 'bg-gray-100 text-gray-800';
};
