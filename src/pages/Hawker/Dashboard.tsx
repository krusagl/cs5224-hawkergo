
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
  ChevronRight, 
  Clock, 
  Utensils, 
  DollarSign,
  Bell,
  TrendingUp,
  CheckCircle,
  LayoutDashboard,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { format, subDays, startOfDay, addDays } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import QRCodeGenerator from '@/components/ui/QRCodeGenerator';
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
  const today = new Date();
  return Array.from({ length: days }).map((_, i) => {
    const date = addDays(today, i);
    return {
      date: format(date, 'MMM dd'),
      sales: Math.floor(Math.random() * 300) + 100,
      predicted: Math.floor(Math.random() * 300) + 100,
    };
  });
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 border rounded shadow-sm">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.dataKey === 'predicted' 
              ? `Predicted: S$${entry.value}` 
              : `Sales: S$${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading: ordersLoading, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  const [showQRCode, setShowQRCode] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('7d');
  const [hasNewNotification, setHasNewNotification] = useState(true);
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');
  
  // Combined data for sales trends and predictions
  const [combinedSalesData, setCombinedSalesData] = useState(generateSalesPredictionData(14));
  
  // Update chart data when time range changes
  useEffect(() => {
    let days = 7;
    if (timeRange === '30d') days = 30;
    else if (timeRange === '90d') days = 90;
    else if (timeRange === '1y') days = 365;
    
    setCombinedSalesData(generateSalesPredictionData(days));
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
  const readyOrders = orders.filter(order => order.status === 'ready');
  const completedOrders = orders.filter(order => order.status === 'completed');
  const scheduledOrders = orders.filter(order => order.status === 'scheduled'); // New status
  
  const recentTransactions = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Status indicator for transaction priority
  const getStatusColor = (status: Order['status']) => {
    switch(status) {
      case 'pending': return 'bg-orange-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'scheduled': return 'bg-purple-500';
      default: return 'bg-red-500';
    }
  };
  
  const getStatusName = (status: Order['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
              onClick={() => navigate('/hawker/operation-mode')}
              className="w-full sm:w-auto flex items-center gap-2"
              size="lg"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard Mode</span>
              <ToggleRight className="ml-1 h-5 w-5 text-muted-foreground" />
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
                      View all orders
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
                      Manage menu
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
                      Mark as read
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedTransition>
          
          {/* Recent Transactions - Moved up as requested */}
          <AnimatedTransition delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
                <CardDescription>Manage your incoming and current orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending">
                  <TabsList className="mb-4">
                    <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
                    <TabsTrigger value="preparing">Preparing ({preparingOrders.length})</TabsTrigger>
                    <TabsTrigger value="scheduled">Scheduled ({scheduledOrders.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
                  </TabsList>
                  
                  {['pending', 'preparing', 'scheduled', 'completed'].map((status) => (
                    <TabsContent key={status} value={status} className="m-0">
                      {orders.filter(o => o.status === status).length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                          No {status} orders
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders
                            .filter(o => o.status === status)
                            .slice(0, 5)
                            .map((order) => (
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
                            )
                          )}
                          
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
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </AnimatedTransition>
          
          {/* Sales Trends - Moved down as requested */}
          <AnimatedTransition delay={0.2}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Sales Trend & Prediction</CardTitle>
                    <CardDescription>Overview of your recent and predicted sales performance</CardDescription>
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
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={combinedSalesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      hide={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="sales" 
                      name="Actual Sales" 
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                    <Bar 
                      dataKey="predicted" 
                      name="Predicted Sales" 
                      fill="#82ca9d"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="flex items-center justify-between text-sm mt-4">
                  <div className="text-muted-foreground">
                    <span className="font-medium">Past 7 days:</span> S${combinedSalesData.slice(0, 7).reduce((acc, curr) => acc + (curr.sales || 0), 0).toFixed(2)}
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-medium">Predicted 7 days:</span> S${combinedSalesData.slice(7, 14).reduce((acc, curr) => acc + (curr.predicted || 0), 0).toFixed(2)}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary"
                    onClick={() => navigate('/hawker/analytics')}
                  >
                    View analytics <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedTransition>
        </div>
        
        {/* Right Column - Latest Orders */}
        <div className="space-y-6">
          <AnimatedTransition delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Latest Orders</CardTitle>
                <CardDescription>Your most recent transactions</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No recent transactions
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentTransactions.slice(0, 8).map((order) => (
                      <div key={order.id} className="py-3 px-1 hover:bg-muted/50 transition-colors rounded-md">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <span className={`h-2 w-2 rounded-full ${getStatusColor(order.status)} mr-2`}></span>
                            <span className="text-sm font-medium">
                              {format(new Date(order.createdAt), 'h:mm a')}
                            </span>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                            {getStatusName(order.status)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{order.items.length} items</span>
                          <span className="font-medium">S${order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {order.customerName}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => navigate('/hawker/operation-mode')}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Go to Operation Mode
                </Button>
              </CardContent>
            </Card>
          </AnimatedTransition>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
