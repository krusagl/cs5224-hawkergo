
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart2, 
  QrCode, 
  ShoppingBag, 
  FileText, 
  ChevronRight, 
  Clock, 
  Utensils, 
  ArrowUpRight, 
  DollarSign 
} from 'lucide-react';
import QRCodeGenerator from '@/components/ui/QRCodeGenerator';
import OrderCard from '@/components/ui/OrderCard';
import { useOrders, Order } from '@/hooks/useOrders';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading: ordersLoading, updateOrderStatus } = useOrders();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/hawker/login');
    }
  }, [authLoading, user, navigate]);

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const result = await updateOrderStatus(orderId, status);
    if (result.success) {
      toast({
        title: 'Success',
        description: `Order status updated to ${status}`,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
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

  const uniqueMenuItemIds = [...new Set(orders.flatMap(order => order.items.map(item => item.menuItemId)))];
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');
  const stallUrl = `${window.location.origin}/stall/${user.id}`;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <AnimatedTransition>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.stallName || 'Your Stall'}</h1>
            <p className="text-muted-foreground mt-1">{user.stallAddress || 'Manage your stall operations'}</p>
          </div>
        </AnimatedTransition>
        
        <AnimatedTransition className="mt-4 md:mt-0 w-full md:w-auto">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => navigate('/hawker/menu')}
              className="w-full sm:w-auto"
            >
              <FileText className="mr-2 h-4 w-4" />
              Edit Menu
            </Button>
            <Button 
              onClick={() => navigate('/hawker/orders')}
              className="w-full sm:w-auto"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Manage Orders
            </Button>
          </div>
        </AnimatedTransition>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <AnimatedTransition>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Total Revenue</span>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-2xl font-bold">S${totalRevenue.toFixed(2)}</span>
                    <div className="text-xs text-muted-foreground">
                      From {orders.length} orders
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Menu Items</span>
                      <Utensils className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-2xl font-bold">{uniqueMenuItemIds.length}</span>
                    <Link 
                      to="/hawker/menu" 
                      className="text-xs text-primary hover:underline flex items-center"
                    >
                      Manage menu <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Pending Orders</span>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-2xl font-bold">{pendingOrders.length + preparingOrders.length}</span>
                    <Link 
                      to="/hawker/orders" 
                      className="text-xs text-primary hover:underline flex items-center"
                    >
                      View all orders <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedTransition>
          
          <AnimatedTransition delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Latest Orders</CardTitle>
                <CardDescription>Manage your incoming and current orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending">
                  <TabsList className="mb-4">
                    <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
                    <TabsTrigger value="preparing">Preparing ({preparingOrders.length})</TabsTrigger>
                    <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="pending" className="m-0">
                    {pendingOrders.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No pending orders at the moment
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {pendingOrders.slice(0, 3).map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onUpdateStatus={handleUpdateOrderStatus}
                          />
                        ))}
                        {pendingOrders.length > 3 && (
                          <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => navigate('/hawker/orders')}
                          >
                            View All Pending Orders <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="preparing" className="m-0">
                    {preparingOrders.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No orders being prepared at the moment
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {preparingOrders.slice(0, 3).map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onUpdateStatus={handleUpdateOrderStatus}
                          />
                        ))}
                        {preparingOrders.length > 3 && (
                          <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => navigate('/hawker/orders')}
                          >
                            View All Preparing Orders <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="all" className="m-0">
                    {orders.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No orders yet
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {orders.slice(0, 5).map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onUpdateStatus={handleUpdateOrderStatus}
                          />
                        ))}
                        <Button
                          variant="outline"
                          className="mt-2"
                          onClick={() => navigate('/hawker/orders')}
                        >
                          View All Orders <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </AnimatedTransition>

          <AnimatedTransition delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Analytics</CardTitle>
                  <CardDescription>Get insights into your business performance</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <BarChart2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">AI-Powered Demand Forecasting</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get predictions for ingredient preparation and optimize your inventory
                    </p>
                    <Button
                      onClick={() => navigate('/hawker/analytics')}
                      className="w-full"
                    >
                      Generate Forecast
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                  <CardDescription>Common tasks you might want to perform</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/hawker/menu')}
                      className="justify-start"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Update Menu Items
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(stallUrl, '_blank')}
                      className="justify-start"
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      View Customer Menu
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/hawker/orders')}
                      className="justify-start"
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      View All Orders
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedTransition>
        </div>
        
        <div className="space-y-6">
          <AnimatedTransition delay={0.3}>
            <QRCodeGenerator
              value={stallUrl}
              stallName={user.stallName || 'Your Stall'}
              downloadFileName={`${user.stallName || 'stall'}-qrcode`}
            />
          </AnimatedTransition>
          
          <AnimatedTransition delay={0.4}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Your Digital Menu URL</CardTitle>
                <CardDescription>Share this link to allow customers to browse your menu</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-muted p-3 rounded-md text-sm font-mono break-all">
                  {stallUrl}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(stallUrl);
                      toast({
                        title: 'Copied!',
                        description: 'URL copied to clipboard',
                      });
                    }}
                  >
                    Copy Link
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(stallUrl, '_blank')}
                  >
                    Open Menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedTransition>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
