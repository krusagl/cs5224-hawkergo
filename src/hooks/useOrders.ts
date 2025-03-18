
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  hawkerId: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  estimatedReadyTime?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: 'card' | 'qr' | 'cash';
}

export const useOrders = (stallId?: string) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // In a real app, this would be a fetch to your orders API
        // For now, let's use mock data
        const mockOrders: Order[] = [
          {
            id: '1',
            customerId: 'cust1',
            customerName: 'John Tan',
            hawkerId: user?.id || '1',
            items: [
              { menuItemId: 'item1', name: 'Chicken Rice', price: 5.50, quantity: 2 },
              { menuItemId: 'item2', name: 'Iced Tea', price: 1.50, quantity: 1 }
            ],
            status: 'pending',
            totalAmount: 12.50,
            createdAt: new Date().toISOString(),
            estimatedReadyTime: new Date(Date.now() + 15 * 60000).toISOString(),
            paymentStatus: 'paid',
            paymentMethod: 'card'
          },
          {
            id: '2',
            customerId: 'cust2',
            customerName: 'Lisa Wong',
            hawkerId: user?.id || '1',
            items: [
              { menuItemId: 'item3', name: 'Laksa', price: 6.50, quantity: 1 },
            ],
            status: 'preparing',
            totalAmount: 6.50,
            createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
            estimatedReadyTime: new Date(Date.now() + 5 * 60000).toISOString(),
            paymentStatus: 'paid',
            paymentMethod: 'qr'
          }
        ];
        
        setOrders(mockOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, stallId]);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      setLoading(true);
      // In a real app, this would be a PUT/PATCH to your orders API
      // For now, update the local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status } 
            : order
        )
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order. Please try again.');
      return { success: false, error: 'Failed to update order' };
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (newOrder: Omit<Order, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      // In a real app, this would be a POST to your orders API
      // For now, update the local state
      const createdOrder: Order = {
        ...newOrder,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
      };
      
      setOrders(prev => [createdOrder, ...prev]);
      
      return { success: true, orderId: createdOrder.id };
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order. Please try again.');
      return { success: false, error: 'Failed to create order' };
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    createOrder,
  };
};
