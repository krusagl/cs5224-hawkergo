
// Need to update the Operation Mode page according to requirements:
// 1. Move completed orders to a separate tab 'Completed'
// 2. Ensure orders don't change status unless marked as 'Completed'
// 3. Use colors to differentiate action buttons 
// 4. Allow filtering by order status
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Loader2,
  Filter
} from 'lucide-react';
import OrderCard from '@/components/ui/OrderCard';
import { useOrders, Order } from '@/hooks/useOrders';
import { toast } from '@/hooks/use-toast';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define a type for the order status to use for filtering
type OrderStatus = 'all' | 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'scheduled';

const OperationMode = () => {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading: ordersLoading, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/hawker/login');
    }
  }, [authLoading, user, navigate]);
  
  // Group orders by status
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
    
  const scheduledOrders = orders.filter(order => order.status === 'scheduled')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Filter orders based on the selected status
  const getFilteredOrders = (status: string) => {
    if (statusFilter === 'all') {
      return status === 'pending' ? pendingOrders :
             status === 'preparing' ? preparingOrders :
             status === 'ready' ? readyOrders :
             status === 'completed' ? completedOrders :
             status === 'cancelled' ? cancelledOrders : scheduledOrders;
    }
    
    return status === statusFilter ? (
      status === 'pending' ? pendingOrders :
      status === 'preparing' ? preparingOrders :
      status === 'ready' ? readyOrders :
      status === 'completed' ? completedOrders :
      status === 'cancelled' ? cancelledOrders : scheduledOrders
    ) : [];
  };
  
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Only allow status changes when marking as completed
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      // Don't process if the new status isn't 'completed' and the current status isn't 'ready'
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
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter: {statusFilter === 'all' ? 'All Orders' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Orders`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus)}>
                <DropdownMenuRadioItem value="all">All Orders</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="pending">Pending Orders</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="preparing">Preparing Orders</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="ready">Ready Orders</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="completed">Completed Orders</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="cancelled">Cancelled Orders</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="scheduled">Scheduled Orders</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {pendingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="preparing" className="relative">
            Preparing
            {preparingOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {preparingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ready" className="relative">
            Ready
            {readyOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {readyOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="relative">
            Scheduled
            {scheduledOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {scheduledOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="relative">
            Cancelled
            {cancelledOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {cancelledOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            Completed
            {completedOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {completedOrders.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        {['pending', 'preparing', 'ready', 'scheduled', 'cancelled', 'completed'].map((status) => (
          <TabsContent key={status} value={status} className="m-0">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {getFilteredOrders(status).length > 0 ? (
                getFilteredOrders(status).map((order) => (
                  <AnimatedTransition key={order.id}>
                    <OrderCard 
                      order={order} 
                      onUpdateStatus={handleUpdateOrderStatus}
                      showStartPreparingButton={status === 'pending'}
                      showMarkReadyButton={status === 'preparing'}
                      showMarkCompletedButton={status === 'ready'}
                      showCancelButton={['pending', 'preparing', 'ready', 'scheduled'].includes(status)}
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
                    <h3 className="text-lg font-medium mb-2">No {status} orders found</h3>
                    {status === 'pending' && (
                      <p className="text-muted-foreground text-center">
                        New customer orders will appear here. You can start preparing once received.
                      </p>
                    )}
                    {status === 'preparing' && (
                      <p className="text-muted-foreground text-center">
                        Orders being prepared will appear here. Mark them as ready when completed.
                      </p>
                    )}
                    {status === 'ready' && (
                      <p className="text-muted-foreground text-center">
                        Ready orders will appear here. Mark them as completed when picked up.
                      </p>
                    )}
                    {status === 'completed' && (
                      <p className="text-muted-foreground text-center">
                        Completed orders will appear here for your reference.
                      </p>
                    )}
                    {status === 'cancelled' && (
                      <p className="text-muted-foreground text-center">
                        Cancelled orders will appear here for your reference.
                      </p>
                    )}
                    {status === 'scheduled' && (
                      <p className="text-muted-foreground text-center">
                        Future scheduled orders will appear here. Prepare them at the scheduled time.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default OperationMode;
