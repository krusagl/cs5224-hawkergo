import { useState, useEffect } from 'react';
import { format, addHours, subHours, addMinutes } from 'date-fns';
import { orderAPI, stallAPI } from '../services/api';

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
  status: 'new' | 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'scheduled';
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

// API endpoints
const API_ENDPOINTS = {
  ORDERS: '/api/orders',
  ORDER_STATUS: (orderId: string) => `/api/orders/${orderId}/status`,
  CREATE_ORDER: '/api/orders/create',
  PAYMENT: '/api/payments',
  USER_PROFILE: '/api/user/profile',
  ANALYTICS: '/api/analytics',
};

// Helper function to map API response to our internal Order type
const mapApiResponseToOrder = (apiOrder: any): Order => {
  return {
    id: apiOrder.orderID,
    customerId: apiOrder.customerContact,
    customerName: apiOrder.customerName,
    hawkerId: apiOrder.stallID,
    items: apiOrder.orderDetails.map((item: any) => ({
      menuItemId: item.menuItemName,
      name: item.menuItemName,
      price: item.price,
      quantity: item.quantity
    })),
    status: apiOrder.orderStatus.toLowerCase() === 'new' ? 'new' : apiOrder.orderStatus.toLowerCase() as any,
    createdAt: apiOrder.orderDateTime,
    updatedAt: apiOrder.orderDateTime,
    totalAmount: apiOrder.orderTotalCost,
    estimatedReadyTime: addMinutes(new Date(apiOrder.orderDateTime), 15).toISOString(),
    paymentStatus: apiOrder.paymentStatus.toLowerCase() as 'paid' | 'pending',
    paymentMethod: apiOrder.paymentMethod.toLowerCase() as 'card' | 'qr' | 'cash'
  };
};

// Generate mock orders data for demo accounts
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

  const customerNames = ['John Tan', 'Mary Lim', 'David Ng', 'Sarah Wong', 'Michael Teo', 'Lisa Chen'];
  
  return Array.from({ length: 15 }).map((_, index) => {
    const orderItems = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => {
      const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      
      return {
        ...randomItem,
        quantity,
        specialInstructions: Math.random() > 0.7 ? 'Less spicy please' : ''
      };
    });
    
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const createdAt = subHours(subHours(now, hoursAgo), minutesAgo).toISOString();
    
    let status: Order['status'];
    if (index < 3) {
      status = 'new';
    } else if (index < 6) {
      status = 'preparing';
    } else if (index < 8) {
      status = 'ready';
    } else if (index < 10) {
      status = 'scheduled';
    } else {
      status = Math.random() > 0.2 ? 'completed' : 'cancelled';
    }
    
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

export const useOrders = (hawkerId: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        //const isDemo = user?.accountType === 'demo';
        const isDemo = false;
        if (isDemo) {
          // For demo accounts, use mock data
          await new Promise(resolve => setTimeout(resolve, 500));
          const mockOrders = generateMockOrders(hawkerId, isDemo);
          setOrders(mockOrders);
        } else {
          // For real accounts, fetch from API
          try {
            const response = await stallAPI.getOrders(hawkerId);
            if (response && response.orders) {
              const fetchedOrders = response.orders.map(mapApiResponseToOrder);
              setOrders(fetchedOrders);
            } else {
              setOrders([]);
            }
          } catch (error) {
            console.error('Error fetching orders from API:', error);
            setOrders([]);
          }
        }
      } catch (error) {
        console.error('Error loading orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrders();
  }, [hawkerId]);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']): Promise<UpdateOrderStatusResult> => {
    try {
      // Real mode: update via API
      await orderAPI.updateOrderStatus(orderId, newStatus);
      
      // After successful API call, update local state
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

  const getOrderDetail = async (orderId: string): Promise<Order | null> => {
    try {
      const apiOrder = await orderAPI.getOrderDetail(orderId);
      return mapApiResponseToOrder(apiOrder);
    } catch (error) {
      console.error('Error fetching order details:', error);
      return null;
    }
  };

  const createOrder = async (orderData: CreateOrderParams): Promise<CreateOrderResult> => {
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const isDemo = user?.accountType === 'demo';
      
      if (isDemo) {
        // Demo mode: create locally
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
      } else {
        // Real mode: create via API
        // Transform orderData to match API expectations
        const apiOrderData = {
          customerName: orderData.customerName,
          customerContact: orderData.customerId,
          orderDetails: orderData.items.map(item => ({
            menuItemName: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          orderTotalCost: orderData.totalAmount
        };
        
        const response = await stallAPI.createOrder(orderData.hawkerId, apiOrderData);
        
        if (response && response.orderID) {
          const now = new Date();
          const newOrder: Order = {
            id: response.orderID,
            ...orderData,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
          };
          
          setOrders(prev => [newOrder, ...prev]);
          
          return {
            success: true,
            orderId: newOrder.id
          };
        } else {
          throw new Error('Failed to create order via API');
        }
      }
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
    getOrderDetail,
    createOrder
  };
};
