// RFQ Request Types
export interface RFQRequest {
  id?: string;
  request_number: string;
  customer_email: string;
  customer_name?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  delivery_zip: string;
  required_date: string; // ISO date string
  status: 'pending' | 'open' | 'closed' | 'accepted' | 'rejected';
  created_at?: string;
  closed_at?: string;
  winning_offer_id?: string;
}

// Offer Types
export interface Offer {
  id?: string;
  rfq_id: string;
  supplier_id: string;
  price: number;
  notes?: string;
  delivery_date?: string; // ISO date string
  status: 'pending' | 'submitted' | 'winning' | 'rejected';
  created_at?: string;
  updated_at?: string;
  magic_link_token?: string;
  magic_link_expires?: string;
}

// Product Types
export interface Product {
  id?: string;
  product_id: string;
  name: string;
  description?: string;
}

// Supplier Types
export interface Supplier {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

// Product Supplier Assignment
export interface ProductSupplier {
  id?: string;
  product_id: string;
  supplier_id: string;
  notes?: string;
}

// Form Types
export interface RequestQuoteFormData {
  product_id: string;
  product_name: string;
  quantity: number;
  delivery_zip: string;
  required_date: string;
  customer_email: string;
  customer_name?: string;
}
