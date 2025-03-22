
import { useState, useEffect } from 'react';
import { format, addHours, subHours, addMinutes } from 'date-fns';
import { orderAPI, stallAPI, Order as ApiOrder, OrderItem as ApiOrderItem } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

// Mapping our internal Order type to match the API's Order type
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

interface UpdateOrderStatusResult {
  success: boolean;
  message?: string;
  order?: Order;
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

interface CreateOrderResult {
  success: boolean;
  message?: string;
  orderId?: string;
}

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
      // First few orders are new (replacing pending)
      status = 'new';
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

// Map API order to our internal Order type
const mapApiOrderToOrder = (apiOrder: ApiOrder): Order => {
  return {
    id: apiOrder.orderID,
    customerId: apiOrder.customerContact, // Using contact as ID for now
    customerName: apiOrder.customerName,
    hawkerId: apiOrder.stallID,
    items: apiOrder.orderDetails.map(item => ({
      menuItemId: item.menuItemName, // Using name as ID for now
      name: item.menuItemName,
      price: apiOrder.orderTotalCost / apiOrder.orderDetails.reduce((sum, i) => sum + i.quantity, 0), // Estimate price
      quantity: item.quantity
    })),
    status: apiOrder.orderStatus === 'new' ? 'new' : apiOrder.orderStatus as any,
    createdAt: apiOrder.orderDateTime,
    updatedAt: apiOrder.orderDateTime,
    totalAmount: apiOrder.orderTotalCost,
    estimatedReadyTime: new Date(new Date(apiOrder.orderDateTime).getTime() + 15 * 60000).toISOString(),
    paymentStatus: apiOrder.paymentStatus,
    paymentMethod: apiOrder.paymentMethod
  };
};

// Map our Order type to API OrderItem type
const mapOrderToApiOrder = (order: CreateOrderParams): {
  customerName: string;
  customerContact: string;
  orderDetails: ApiOrderItem[];
  orderTotalCost: number;
} => {
  return {
    customerName: order.customerName,
    customerContact: order.customerId,
    orderDetails: order.items.map(item => ({
      menuItemName: item.name,
      quantity: item.quantity
    })),
    orderTotalCost: order.totalAmount
  };
};

export const useOrders = (hawkerId?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const stallId = hawkerId || user?.id || '1';

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        
        // Check if this is a demo account from localStorage
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        const isDemo = user?.accountType === 'demo';
        
        if (isDemo) {
          // Generate mock orders for demo accounts only
          const mockOrders = generateMockOrders(stallId, isDemo);
          setOrders(mockOrders);
        } else {
          try {
            // Fetch real orders from the API
            const response = await stallAPI.getOrders(stallId);
            const apiOrders = response.orders;
            
            // Map API orders to our internal Order type
            const mappedOrders = apiOrders.map(mapApiOrderToOrder);
            setOrders(mappedOrders);
          } catch (error) {
            console.error('Error fetching orders:', error);
            // Fallback to empty orders for new users
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
  }, [stallId]);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']): Promise<UpdateOrderStatusResult> => {
    try {
      // Check if this is a demo account
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const isDemo = user?.accountType === 'demo';
      
      if (isDemo) {
        // Update order status locally for demo accounts
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
      } else {
        // Update order status through the API
        const apiStatus = newStatus === 'new' ? 'new' : newStatus;
        await orderAPI.updateOrderStatus(orderId, apiStatus);
        
        // Update local state after API call succeeds
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
      }
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
      // Check if this is a demo account
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const isDemo = user?.accountType === 'demo';
      
      if (isDemo) {
        // Create new order locally for demo accounts
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
      } else {
        // Create new order through the API
        const apiOrderData = mapOrderToApiOrder(orderData);
        const response = await stallAPI.createOrder(orderData.hawkerId, apiOrderData);
        
        // Create new order with API response
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
    createOrder
  };
};
