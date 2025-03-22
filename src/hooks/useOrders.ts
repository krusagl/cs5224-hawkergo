
import { useState, useEffect } from 'react';
import { format, addHours, subHours, addMinutes } from 'date-fns';

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
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'scheduled';
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  estimatedReadyTime: string;
  paymentStatus: 'paid' | 'pending';
  paymentMethod: 'card' | 'qr' | 'cash';
}

interface CreateOrderParams {
  customerId: string;
  customerName: string;
  hawkerId: string;
  items: OrderItem[];
  totalAmount: number;
  estimatedReadyTime: string;
  status: Order['status'];
  paymentStatus: 'paid' | 'pending';
  paymentMethod: 'card' | 'qr' | 'cash';
}

interface UpdateOrderStatusResult {
  success: boolean;
  message?: string;
  order?: Order;
}

interface CreateOrderResult {
  success: boolean;
  message?: string;
  orderId?: string;
}

// API endpoints - can be replaced with real values later
const API_ENDPOINTS = {
  ORDERS: '/api/orders',
  ORDER_STATUS: (orderId: string) => `/api/orders/${orderId}/status`,
  CREATE_ORDER: '/api/orders/create',
  PAYMENT: '/api/payments',
  USER_PROFILE: '/api/user/profile',
  ANALYTICS: '/api/analytics',
};

// Mock orders data for demo accounts only
const generateMockOrders = (hawkerId: string, isDemo: boolean = true): Order[] => {
  if (!isDemo) {
    return []; // New users start with an empty dashboard
  }
  
  const now = new Date();
  const menuItems = [
    { menuItemId: '1', name: 'Fishball Noodles', price: 5 },
    { menuItemId: '2', name: 'Bak Chor Mee', price: 5 },
    { menuItemId: '3', name: 'Fishball Soup', price: 4 },
    { menuItemId: '4', name: 'Laksa', price: 6 },
  ];

  const statuses: Order['status'][] = ['pending', 'preparing', 'ready', 'completed', 'cancelled', 'scheduled'];
  const customerNames = ['John Tan', 'Mary Lim', 'David Ng', 'Sarah Wong', 'Michael Teo', 'Lisa Chen'];
  
  return Array.from({ length: 15 }).map((_, index) => {
    // Select random items for this order
    const orderItems = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => {
      const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      
      return {
        ...randomItem,
        quantity,
        specialInstructions: Math.random() > 0.7 ? 'Less spicy please' : ''
      };
    });
    
    // Calculate total amount
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Generate random dates within the last 24 hours
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const createdAt = subHours(subHours(now, hoursAgo), minutesAgo).toISOString();
    
    // Generate status based on time (older orders are more likely to be completed)
    let status: Order['status'];
    if (index < 3) {
      // First few orders are pending
      status = 'pending';
    } else if (index < 6) {
      // Next few are preparing
      status = 'preparing';
    } else if (index < 8) {
      // A couple are ready
      status = 'ready';
    } else if (index < 10) {
      // A couple are scheduled
      status = 'scheduled';
    } else {
      // The rest are completed or cancelled
      status = Math.random() > 0.2 ? 'completed' : 'cancelled';
    }
    
    // For scheduled orders, set the creation time in the future
    const finalCreatedAt = status === 'scheduled' 
      ? addHours(now, Math.floor(Math.random() * 5) + 1).toISOString()
      : createdAt;
    
    return {
      id: `ORD${(10000 + index).toString()}`,
      customerId: `CUST${(10000 + index).toString()}`,
      customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
      hawkerId,
      items: orderItems,
      status,
      createdAt: finalCreatedAt,
      updatedAt: finalCreatedAt,
      totalAmount,
      estimatedReadyTime: addMinutes(new Date(finalCreatedAt), 15).toISOString(),
      paymentStatus: Math.random() > 0.2 ? 'paid' : 'pending',
      paymentMethod: Math.random() > 0.5 ? 'card' : (Math.random() > 0.5 ? 'qr' : 'cash')
    };
  });
};

export const useOrders = (hawkerId: string = '1') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        
        // Check if this is a demo account from localStorage
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        const isDemo = user?.accountType === 'demo';
        
        // In a real implementation, this would be a fetch call to the API
        // fetch(API_ENDPOINTS.ORDERS)
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate mock orders for demo accounts only
        const mockOrders = generateMockOrders(hawkerId, isDemo);
        setOrders(mockOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrders();
  }, [hawkerId]);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']): Promise<UpdateOrderStatusResult> => {
    try {
      // In a real implementation, this would be a fetch call to the API
      // await fetch(API_ENDPOINTS.ORDER_STATUS(orderId), {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus })
      // });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update order status
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      
      return {
        success: true,
        order: updatedOrders.find(order => order.id === orderId)
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      return {
        success: false,
        message: 'Failed to update order status'
      };
    }
  };
  
  const createOrder = async (orderData: CreateOrderParams): Promise<CreateOrderResult> => {
    try {
      // In a real implementation, this would be a fetch call to the API
      // const response = await fetch(API_ENDPOINTS.CREATE_ORDER, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(orderData)
      // });
      // const data = await response.json();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new order
      const now = new Date();
      const newOrder: Order = {
        id: `ORD${Math.floor(Math.random() * 90000) + 10000}`,
        ...orderData,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      
      setOrders(prev => [newOrder, ...prev]);
      
      return {
        success: true,
        orderId: newOrder.id
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        message: 'Failed to create order'
      };
    }
  };

  return {
    orders,
    loading,
    updateOrderStatus,
    createOrder
  };
};
