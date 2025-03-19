
import React, { useState, useEffect } from 'react';
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
  DollarSign,
  Bell,
  ArrowRight,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import QRCodeGenerator from '@/components/ui/QRCodeGenerator';
import OrderCard from '@/components/ui/OrderCard';
import { useOrders, Order } from '@/hooks/useOrders';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import { toast } from '@/hooks/use-toast';

// Generate mock data for sales trends
const generateSalesTrendData = (days: number = 7) => {
  return Array.from({ length: days }).map((_, i) => {
    const date = subDays(new Date(), days - i - 1);
    return {
      date: format(date, 'MMM dd'),
      sales: Math.floor(Math.random() * 300) + 100,
      orders: Math.floor(Math.random() * 20) + 5,
    };
  });
};

// Generate mock data for sales predictions
const generateSalesPredictionData = (days: number = 7) => {
  return Array.from({ length: days }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: format(date, 'MMM dd'),
      predicted: Math.floor(Math.random() * 300) + 100,
    };
  });
};

const SalesChart = ({ data, dataKey = 'sales', stroke = "#8884d8" }) => (
  <ResponsiveContainer width="100%" height={200}>
    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={stroke} stopOpacity={0.3} />
          <stop offset="95%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
      <XAxis 
        dataKey="date" 
        tickLine={false}
        axisLine={false}
        tick={{ fontSize: 12 }}
      />
      <YAxis 
        hide={true}
      />
      <Tooltip />
      <Area 
        type="monotone" 
        dataKey={dataKey} 
        stroke={stroke} 
        fillOpacity={1} 
        fill={`url(#color${dataKey})`} 
      />
    </AreaChart>
  </ResponsiveContainer>
);

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading: ordersLoading, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  const [showQRCode, setShowQRCode] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('7d');
  const [hasNewNotification, setHasNewNotification] = useState(true);
  
  // Mock data for sales trends and predictions
  const [salesTrendData, setSalesTrendData] = useState(generateSalesTrendData(7));
  const [salesPredictionData, setSalesPredictionData] = useState(generateSalesPredictionData(7));
  
  // Update chart data when time range changes
  useEffect(() => {
    let days = 7;
    if (timeRange === '30d') days = 30;
    else if (timeRange === '90d') days = 90;
    else if (timeRange === '1y') days = 365;
    
    setSalesTrendData(generateSalesTrendData(days));
  }, [timeRange]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/hawker/login');
    }
  }, [authLoading, user, navigate]);
  
  // Set up notification system
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Math.random() > 0.7) {
        setHasNewNotification(true);
        toast({
          title: 'New Order Received!',
          description: 'You have received a new order. Check your orders page.',
        });
      }
    }, 30000);
    
    return () => clearTimeout(timer);
  }, []);

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

  // Calculate some statistics from the orders
  const totalRevenueToday = orders
    .filter(order => {
      const orderDate = new Date(order.createdAt);
      const today = startOfDay(new Date());
      return orderDate >= today;
    })
    .reduce((sum, order) => sum + order.totalAmount, 0);
    
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');
  const recentTransactions = [...pendingOrders, ...preparingOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Status indicator for transaction priority
  const getStatusColor = (status: Order['status']) => {
    switch(status) {
      case 'pending': return 'bg-orange-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-red-500';
    }
  };
  
  const uniqueMenuItemIds = [...new Set(orders.flatMap(order => order.items.map(item => item.menuItemId)))];
  const stallUrl = `${window.location.origin}/stall/${user?.id}`;

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

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      {/* Header Section */}
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
              onClick={() => navigate('/hawker/operation-mode')}
              className="w-full sm:w-auto"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Operation Mode
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowQRCode(true)}
              className="w-full sm:w-auto"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Display QR Code
            </Button>
          </div>
        </AnimatedTransition>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Your Stall QR Code</h2>
            <p className="text-muted-foreground mb-4">
              Display this QR code at your stall for customers to scan and place orders.
            </p>
            <div className="flex justify-center mb-4">
              <QRCodeGenerator
                value={stallUrl}
                stallName={user.stallName || 'Your Stall'}
                downloadFileName={`${user.stallName || 'stall'}-qrcode`}
              />
            </div>
            <Button
              variant="default"
              className="w-full"
              onClick={() => setShowQRCode(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Sales & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Stats */}
          <AnimatedTransition>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Today's Revenue</span>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-2xl font-bold">S${totalRevenueToday.toFixed(2)}</span>
                    <div className="text-xs text-green-500 font-medium flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12% from yesterday
                    </div>
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
                      <span className="text-muted-foreground text-sm">Notifications</span>
                      <Bell className={`h-4 w-4 ${hasNewNotification ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                    </div>
                    <span className="text-2xl font-bold">{hasNewNotification ? 'New!' : 'None'}</span>
                    <button 
                      onClick={() => setHasNewNotification(false)}
                      className="text-xs text-primary hover:underline flex items-center"
                    >
                      Mark as read <ArrowUpRight className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedTransition>
          
          {/* Sales Trends */}
          <AnimatedTransition delay={0.1}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Sales Trend</CardTitle>
                    <CardDescription>Overview of your recent sales performance</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant={timeRange === '7d' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setTimeRange('7d')}
                    >
                      7D
                    </Button>
                    <Button 
                      variant={timeRange === '30d' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setTimeRange('30d')}
                    >
                      30D
                    </Button>
                    <Button 
                      variant={timeRange === '90d' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setTimeRange('90d')}
                    >
                      90D
                    </Button>
                    <Button 
                      variant={timeRange === '1y' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setTimeRange('1y')}
                    >
                      1Y
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <SalesChart data={salesTrendData} dataKey="sales" stroke="#8884d8" />
                
                <div className="flex items-center justify-between text-sm mt-4">
                  <div className="text-muted-foreground">
                    <span className="font-medium">Total sales:</span> S${salesTrendData.reduce((acc, curr) => acc + curr.sales, 0).toFixed(2)}
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-medium">Orders:</span> {salesTrendData.reduce((acc, curr) => acc + curr.orders, 0)}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary"
                    onClick={() => navigate('/hawker/analytics')}
                  >
                    View detailed analytics <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedTransition>
          
          {/* Latest Orders */}
          <AnimatedTransition delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
                <CardDescription>Manage your incoming and current orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="recent">
                  <TabsList className="mb-4">
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
                    <TabsTrigger value="preparing">Preparing ({preparingOrders.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="recent" className="m-0">
                    {recentTransactions.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No recent transactions
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentTransactions.slice(0, 5).map((order) => (
                          <div key={order.id} className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)} mr-3`}></div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="font-medium">{order.customerName}</span>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(order.createdAt), 'h:mm a')}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{order.items.length} items · S${order.totalAmount.toFixed(2)}</span>
                                <span className="capitalize font-medium text-xs px-2 py-0.5 rounded-full bg-muted">
                                  {order.status}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate('/hawker/operation-mode')}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => navigate('/hawker/operation-mode')}
                        >
                          View All Transactions <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="pending" className="m-0">
                    {pendingOrders.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No pending orders at the moment
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {pendingOrders.slice(0, 4).map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onUpdateStatus={handleUpdateOrderStatus}
                          />
                        ))}
                        {pendingOrders.length > 4 && (
                          <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => navigate('/hawker/operation-mode')}
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
                        {preparingOrders.slice(0, 4).map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onUpdateStatus={handleUpdateOrderStatus}
                          />
                        ))}
                        {preparingOrders.length > 4 && (
                          <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => navigate('/hawker/operation-mode')}
                          >
                            View All Preparing Orders <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </AnimatedTransition>
        </div>
        
        {/* Right Column - Sales Prediction & QR Code */}
        <div className="space-y-6">
          {/* Sales Prediction */}
          <AnimatedTransition delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Sales Prediction</CardTitle>
                <CardDescription>AI-powered forecast for the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <SalesChart data={salesPredictionData} dataKey="predicted" stroke="#82ca9d" />
                
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Predicted total: </span>
                    <span className="font-medium">S${salesPredictionData.reduce((acc, curr) => acc + curr.predicted, 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-lg border border-muted">
                    <h4 className="text-sm font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      Busiest predicted day
                    </h4>
                    <p className="text-sm mt-1">
                      {salesPredictionData.reduce((max, curr) => curr.predicted > max.predicted ? curr : max).date}
                    </p>
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={() => navigate('/hawker/analytics')}
                  >
                    Generate Detailed Forecast
                    <BarChart2 className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedTransition>
          
          {/* Digital Menu URL */}
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
          
          {/* Quick Actions */}
          <AnimatedTransition delay={0.5}>
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
                    onClick={() => navigate('/hawker/operation-mode')}
                    className="justify-start"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Enter Operation Mode
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/hawker/analytics')}
                    className="justify-start"
                  >
                    <BarChart2 className="mr-2 h-4 w-4" />
                    View Analytics
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
