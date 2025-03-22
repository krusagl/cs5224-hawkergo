
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, AlertCircle } from 'lucide-react';
import { Order, useOrders } from '@/hooks/useOrders';
import OrderCard from '@/components/ui/OrderCard';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const OperationMode = () => {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading: ordersLoading, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/hawker/login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    // Apply filtering and searching
    let result = [...orders];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        order => 
          order.customerName.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query) ||
          order.items.some(item => item.name.toLowerCase().includes(query))
      );
    }
    
    setFilteredOrders(result);
  }, [orders, searchQuery]);

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const result = await updateOrderStatus(orderId, status);
    if (result.success) {
      toast({
        title: 'Success',
        description: `Order status updated to ${status === 'pending' ? 'New' : status}`,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-200 mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const allOrders = filteredOrders;
  const pendingOrders = filteredOrders.filter(order => order.status === 'pending');
  const preparingOrders = filteredOrders.filter(order => order.status === 'preparing');
  const readyOrders = filteredOrders.filter(order => order.status === 'ready');
  const completedOrders = filteredOrders.filter(order => order.status === 'completed');
  const cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled');

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <AnimatedTransition>
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/hawker/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Operation Mode</h1>
            <p className="text-muted-foreground">Manage all your stall orders</p>
          </div>
        </div>
      </AnimatedTransition>

      <AnimatedTransition>
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by ID, customer name, or items..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </AnimatedTransition>

      <AnimatedTransition delay={0.1}>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({allOrders.length})</TabsTrigger>
            <TabsTrigger value="pending">New ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="preparing">Preparing ({preparingOrders.length})</TabsTrigger>
            <TabsTrigger value="ready">Ready ({readyOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="all" className="mt-0">
              {renderOrderList(allOrders)}
            </TabsContent>
            
            <TabsContent value="pending" className="mt-0">
              {renderOrderList(pendingOrders)}
            </TabsContent>
            
            <TabsContent value="preparing" className="mt-0">
              {renderOrderList(preparingOrders)}
            </TabsContent>
            
            <TabsContent value="ready" className="mt-0">
              {renderOrderList(readyOrders)}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              {renderOrderList(completedOrders)}
            </TabsContent>
            
            <TabsContent value="cancelled" className="mt-0">
              {renderOrderList(cancelledOrders)}
            </TabsContent>
          </div>
        </Tabs>
      </AnimatedTransition>
    </div>
  );

  function renderOrderList(orderList: Order[]) {
    if (orderList.length === 0) {
      return (
        <Alert className="bg-muted">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {searchQuery
              ? `No orders found matching "${searchQuery}"`
              : 'No orders found'}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orderList.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        ))}
      </div>
    );
  }
};

export default OperationMode;
