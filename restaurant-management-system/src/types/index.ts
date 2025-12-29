export interface User {
  id: number;
  name: string;
  username: string;
  password?: string;
  role: 'Admin' | 'Waiter';
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category_id: number;
  category_name?: string;
  stock: number;
  available: number;
  created_at: string;
}

export interface Order {
  id: number;
  table_number: number;
  waiter_id: number;
  waiter_name?: string;
  status: 'Pending' | 'Served' | 'Paid' | 'Cancelled';
  subtotal: number;
  discount_amount: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  item_name?: string;
  quantity: number;
  price: number;
}

export interface Discount {
  id: number;
  name: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  active: number;
  created_at: string;
}

export interface Transaction {
  id: number;
  order_id: number;
  amount: number;
  payment_method: string;
  table_number?: number;
  total_price?: number;
  created_at: string;
}
