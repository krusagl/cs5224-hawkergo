
import { useState, useEffect } from 'react';
import { format, addHours, subHours, addMinutes, isSameDay, startOfDay, parse } from 'date-fns';
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
  
  // Use a consistent seed value based on hawkerId to generate consistent mock data
  const getConsistentRandom = (seed: number, max: number) => {
    // Simple pseudo-random number generator based on a seed
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    const result = (a * seed + c) % m;
    
    return Math.floor((result / m) * max);
  };
  
  const now = new Date();
  const today = startOfDay(now);
  
  // Fixed menu items
  const menuItems = [
    { menuItemId: '1', name: 'Fishball Noodles', price: 5 },
    { menuItemId: '2', name: 'Bak Chor Mee', price: 5 },
    { menuItemId: '3', name: 'Fishball Soup', price: 4 },
    { menuItemId: '4', name: 'Laksa', price: 6 },
  ];

  // Fixed customer names
  const customerNames = ['John Tan', 'Mary Lim', 'David Ng', 'Sarah Wong', 'Michael Teo', 'Lisa Chen'];

  // Create a consistently generated set of orders
  const mockOrders: Order[] = [];
  let seedValue = hawkerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Generate 15 orders with consistent data
  for (let index = 0; index < 15; index++) {
    // Use the seed value to generate consistent results
    const randomSeed = seedValue + index;
    
    // Select items for this order consistently
    const numItems = getConsistentRandom(randomSeed * 7, 3) + 1; // 1-3 items
    const orderItems: OrderItem[] = [];
    
    for (let i = 0; i < numItems; i++) {
      const itemIndex = getConsistentRandom(randomSeed * (i + 13), menuItems.length);
      const randomItem = menuItems[itemIndex];
      const quantity = getConsistentRandom(randomSeed * (i + 29), 3) + 1; // 1-3 quantity
      
      orderItems.push({
        ...randomItem,
        quantity,
        specialInstructions: getConsistentRandom(randomSeed * (i + 41), 10) > 7 ? 'Less spicy please' : ''
      });
    }
    
    // Calculate total amount
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Generate consistent date/time
    const hoursAgo = getConsistentRandom(randomSeed * 3, 24);
    const minutesAgo = getConsistentRandom(randomSeed * 5, 60);
    let orderDate = new Date(now);
    orderDate.setHours(orderDate.getHours() - hoursAgo);
    orderDate.setMinutes(orderDate.getMinutes() - minutesAgo);
    const createdAt = orderDate.toISOString();
    
    // Generate status based on index (to ensure consistent distribution)
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
      status = getConsistentRandom(randomSeed * 11, 10) > 2 ? 'completed' : 'cancelled';
    }
    
    // For scheduled orders, set the creation time in the future
    const finalCreatedAt = status === 'scheduled' 
      ? addHours(now, getConsistentRandom(randomSeed * 13, 5) + 1).toISOString()
      : createdAt;
    
    // Complete orders that should be completed today
    const shouldBeCompletedToday = index % 5 === 0 && status === 'completed';
    const finalDate = shouldBeCompletedToday 
      ? addHours(today, getConsistentRandom(randomSeed * 17, 12)).toISOString() 
      : finalCreatedAt;
    
    const customerNameIndex = getConsistentRandom(randomSeed * 19, customerNames.length);
    
    mockOrders.push({
      id: `ORD${(10000 + index).toString()}`,
      customerId: `CUST${(10000 + index).toString()}`,
      customerName: customerNames[customerNameIndex],
      hawkerId,
      items: orderItems,
      status,
      createdAt: finalDate,
      updatedAt: finalDate,
      totalAmount,
      estimatedReadyTime: addMinutes(new Date(finalDate), 15).toISOString(),
      paymentStatus: getConsistentRandom(randomSeed * 23, 10) > 2 ? 'paid' : 'pending',
      paymentMethod: getConsistentRandom(randomSeed * 29, 3) === 0 ? 'card' : (getConsistentRandom(randomSeed * 31, 2) === 0 ? 'qr' : 'cash')
    });
  }
  
  // Add a few orders that are definitely completed today for consistent revenue data
  for (let i = 0; i < 3; i++) {
    const randomSeed = seedValue + 100 + i;
    const numItems = getConsistentRandom(randomSeed * 7, 2) + 1;
    const orderItems: OrderItem[] = [];
    
    for (let j = 0; j < numItems; j++) {
      const itemIndex = getConsistentRandom(randomSeed * (j + 13), menuItems.length);
      const randomItem = menuItems[itemIndex];
      const quantity = getConsistentRandom(randomSeed * (j + 29), 2) + 1;
      
      orderItems.push({
        ...randomItem,
        quantity,
        specialInstructions: ''
      });
    }
    
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const hoursAgo = getConsistentRandom(randomSeed * 3, 8); // Within today
    
    let orderDate = new Date(now);
    orderDate.setHours(orderDate.getHours() - hoursAgo);
    
    const customerNameIndex = getConsistentRandom(randomSeed * 19, customerNames.length);
    
    mockOrders.push({
      id: `ORD${(20000 + i).toString()}`,
      customerId: `CUST${(20000 + i).toString()}`,
      customerName: customerNames[customerNameIndex],
      hawkerId,
      items: orderItems,
      status: 'completed',
      createdAt: orderDate.toISOString(),
      updatedAt: orderDate.toISOString(),
      totalAmount,
      estimatedReadyTime: addMinutes(orderDate, 15).toISOString(),
      paymentStatus: 'paid',
      paymentMethod: getConsistentRandom(randomSeed * 29, 3) === 0 ? 'card' : (getConsistentRandom(randomSeed * 31, 2) === 0 ? 'qr' : 'cash')
    });
  }
  
  return mockOrders;
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
          // Generate mock orders for demo accounts only - now with consistent data
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
