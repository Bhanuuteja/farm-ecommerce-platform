// Common interfaces used across the application

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'farmer' | 'customer' | 'agent';
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
  };
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  sku: string;
  farmerId: string;
  farmerName: string;
  stock: number;
  description: string;
  images?: string[];
}

export interface Order {
  _id: string;
  customerId: string;
  customerName?: string;
  items: OrderItem[];
  totalAmount: number;
  orderDate: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress?: string | ShippingAddress;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface FormData {
  name: string;
  category: string;
  price: string;
  sku: string;
  stock: string;
  description: string;
  images: string[];
}
