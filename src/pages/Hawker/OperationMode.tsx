
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Loader2
} from 'lucide-react';
import OrderCard from '@/components/ui/OrderCard';
import { useOrders, Order } from '@/hooks/useOrders';
import { toast } from '@/hooks/use-toast';
import AnimatedTransition from '@/components/ui/AnimatedTransition';

const OperationMode = () => {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading: ordersLoading, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/hawker/login');
    }
  }, [authLoading, user, navigate]);
  
  // Group orders by status
  const allOrders = orders
    .filter(order => order.status !== 'scheduled')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const pendingOrders = orders.filter(order => order.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const preparingOrders = orders.filter(order => order.status === 'preparing')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const readyOrders = orders.filter(order => order.status === 'ready')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const completedOrders = orders.filter(order => order.status === 'completed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const cancelledOrders = orders.filter(order => order.status === 'cancelled')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Get displayed orders based on current tab
  const getDisplayedOrders = () => {
    switch(activeTab) {
      case 'all': return allOrders;
      case 'pending': return pendingOrders;
      case 'preparing': return preparingOrders;
      case 'ready': return readyOrders;
      case 'completed': return completedOrders;
      case 'cancelled': return cancelledOrders;
      default: return allOrders;
    }
  };
  
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Only allow status changes when marking as completed
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      // Don't process if the new status isn't 'completed' and the current status is 'completed'
      if (newStatus !== 'completed' && order.status === 'completed') {
        toast({
          title: 'Cannot change status',
          description: 'Completed orders cannot be changed to another status',
          variant: 'destructive',
        });
        return;
      }
      
      await updateOrderStatus(orderId, newStatus);
      
      toast({
        title: 'Order Updated',
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
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
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!user) return null;
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="-ml-3 mr-2"
            onClick={() => navigate('/hawker/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Operation Mode</h1>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">
            All Orders
            {allOrders.length > 0 && (
              <span className="ml-2 text-xs font-medium">({allOrders.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {pendingOrders.length > 0 && (
              <span className="ml-2 text-xs font-medium">({pendingOrders.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="preparing">
            Preparing
            {preparingOrders.length > 0 && (
              <span className="ml-2 text-xs font-medium">({preparingOrders.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ready">
            Ready
            {readyOrders.length > 0 && (
              <span className="ml-2 text-xs font-medium">({readyOrders.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled
            {cancelledOrders.length > 0 && (
              <span className="ml-2 text-xs font-medium">({cancelledOrders.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            {completedOrders.length > 0 && (
              <span className="ml-2 text-xs font-medium">({completedOrders.length})</span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="m-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getDisplayedOrders().length > 0 ? (
              getDisplayedOrders().map((order) => (
                <AnimatedTransition key={order.id}>
                  <OrderCard 
                    order={order} 
                    onUpdateStatus={handleUpdateOrderStatus}
                    showStartPreparingButton={order.status === 'pending'}
                    showMarkReadyButton={order.status === 'preparing'}
                    showMarkCompletedButton={order.status === 'ready'}
                    showCancelButton={['pending', 'preparing', 'ready'].includes(order.status)}
                    startPreparingButtonColor="blue" // Use color for Start Preparing
                    markReadyButtonColor="orange" // Use color for Mark Ready
                    markCompletedButtonColor="green" // Use color for Mark Completed
                  />
                </AnimatedTransition>
              ))
            ) : (
              <Card className="sm:col-span-2 lg:col-span-3">
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <div className="rounded-full bg-muted/50 p-4 mb-4">
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No {activeTab === 'all' ? '' : activeTab} orders found</h3>
                  {activeTab === 'pending' && (
                    <p className="text-muted-foreground text-center">
                      New customer orders will appear here. You can start preparing once received.
                    </p>
                  )}
                  {activeTab === 'preparing' && (
                    <p className="text-muted-foreground text-center">
                      Orders being prepared will appear here. Mark them as ready when completed.
                    </p>
                  )}
                  {activeTab === 'ready' && (
                    <p className="text-muted-foreground text-center">
                      Ready orders will appear here. Mark them as completed when picked up.
                    </p>
                  )}
                  {activeTab === 'completed' && (
                    <p className="text-muted-foreground text-center">
                      Completed orders will appear here for your reference.
                    </p>
                  )}
                  {activeTab === 'cancelled' && (
                    <p className="text-muted-foreground text-center">
                      Cancelled orders will appear here for your reference.
                    </p>
                  )}
                  {activeTab === 'all' && (
                    <p className="text-muted-foreground text-center">
                      No orders found. New orders will appear here once customers place them.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OperationMode;
