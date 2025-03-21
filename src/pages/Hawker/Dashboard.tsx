import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress'; 
import { 
  BarChart2, 
  QrCode, 
  ChevronRight, 
  Clock, 
  Utensils, 
  DollarSign,
  TrendingUp,
  LayoutDashboard,
  ToggleRight,
  ArrowRight,
  Lock,
  CheckCircle,
  Info
} from 'lucide-react';
import { format, subDays, startOfDay, addDays } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, TooltipProps, ReferenceLine } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import QRCodeGenerator from '@/components/ui/QRCodeGenerator';
import { useOrders, Order } from '@/hooks/useOrders';
import OrderCard from '@/components/ui/OrderCard';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

const generateSalesPredictionData = (pastDays: number = 7, futureDays: number = 7) => {
  const today = new Date();
  let pastData = Array.from({ length: pastDays + 1 }).map((_, i) => {
    const date = subDays(today, pastDays - i);
    return {
      date: format(date, 'MMM dd'),
      sales: Math.floor(Math.random() * 300) + 100,
      orders: Math.floor(Math.random() * 20) + 5,
      isPast: true,
    };
  });
  
  let futureData = Array.from({ length: futureDays }).map((_, i) => {
    const date = addDays(today, i + 1);
    return {
      date: format(date, 'MMM dd'),
      predicted: Math.floor(Math.random() * 300) + 100,
      predictedOrders: Math.floor(Math.random() * 20) + 5,
      isPast: false,
    };
  });
  
  return [...pastData, ...futureData];
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 border rounded shadow-sm">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.dataKey === 'predicted' 
              ? `Predicted Revenue: S$${entry.value}` 
              : entry.dataKey === 'sales'
                ? `Revenue: S$${entry.value}`
                : entry.dataKey === 'predictedOrders'
                  ? `Predicted Orders: ${entry.value}`
                  : `Orders: ${entry.value}`}
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
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [chartType, setChartType] = useState<'revenue' | 'orders'>('revenue');
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);
  
  const [combinedSalesData, setCombinedSalesData] = useState(generateSalesPredictionData(6, 7));
  
  useEffect(() => {
    let pastDays = 6;
    let futureDays = 7;
    if (timeRange === '30d') {
      pastDays = 20;
      futureDays = 10;
    }
    
    setCombinedSalesData(generateSalesPredictionData(pastDays, futureDays));
  }, [timeRange]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/hawker/login');
    }
  }, [authLoading, user, navigate]);

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
  const cancelledOrders = orders.filter(order => order.status === 'cancelled');
  
  const recentPendingOrders = pendingOrders.slice(0, 3);
  const recentPreparingOrders = preparingOrders.slice(0, 3);
  const recentReadyOrders = readyOrders.slice(0, 3);
  const recentCompletedOrders = completedOrders.slice(0, 3);
  const recentCancelledOrders = cancelledOrders.slice(0, 3);
  
  const getRecentTransactionsByStatus = (status: string) => {
    switch(status) {
      case 'pending': return recentPendingOrders;
      case 'preparing': return recentPreparingOrders;
      case 'ready': return recentReadyOrders;
      case 'completed': return recentCompletedOrders;
      case 'cancelled': return recentCancelledOrders;
      default: return recentPendingOrders;
    }
  };
  
  const currentMonthTransactions = 1250;
  const freeThreshold = 2000;
  const percentageUsed = (currentMonthTransactions / freeThreshold) * 100;
  const remainingFree = freeThreshold - currentMonthTransactions;
  
  const pastTotalSales = combinedSalesData
    .filter(d => d.isPast)
    .reduce((acc, curr) => acc + (('sales' in curr) ? Number(curr.sales) : 0), 0);

  const pastTotalOrders = combinedSalesData
    .filter(d => d.isPast)
    .reduce((acc, curr) => acc + (('orders' in curr) ? Number(curr.orders) : 0), 0);

  const predictedTotalSales = combinedSalesData
    .filter(d => !d.isPast)
    .reduce((acc, curr) => acc + (('predicted' in curr) ? Number(curr.predicted) : 0), 0);

  const predictedTotalOrders = combinedSalesData
    .filter(d => !d.isPast)
    .reduce((acc, curr) => acc + (('predictedOrders' in curr) ? Number(curr.predictedOrders) : 0), 0);

  const uniqueMenuItemIds = [...new Set(orders.flatMap(order => order.items.map(item => item.menuItemId)))];
  const stallUrl = `${window.location.origin}/stall/${user?.id}`;

  const handleOpenPremiumDialog = () => {
    setPremiumDialogOpen(true);
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

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <AnimatedTransition>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user?.stallName || 'Your Stall'}</h1>
            <p className="text-muted-foreground mt-1">{user?.stallAddress || 'Manage your stall operations'}</p>
          </div>
        </AnimatedTransition>
        
        <AnimatedTransition className="mt-4 md:mt-0 w-full md:w-auto">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowQRCode(true)}
              className="w-full sm:w-auto"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Display QR Code
            </Button>
            <Button
              variant="default"
              onClick={() => navigate('/hawker/operation-mode')}
              className="w-full sm:w-auto"
            >
              <ToggleRight className="mr-2 h-4 w-4" />
              Switch to Operation Mode
            </Button>
          </div>
        </AnimatedTransition>
      </div>

      {showQRCode && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Your Stall QR Code</h2>
            <p className="text-muted-foreground mb-4">
              Display this QR code at your stall for customers to scan and place orders.
            </p>
            <div className="flex justify-center mb-4">
              <QRCodeGenerator
                value={`${window.location.origin}/stall/${user?.id}`}
                stallName={user?.stallName || 'Your Stall'}
                downloadFileName={`${user?.stallName || 'stall'}-qrcode`}
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

      <Dialog open={premiumDialogOpen} onOpenChange={setPremiumDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to Premium Plan</DialogTitle>
            <DialogDescription>
              Get access to AI-powered demand analysis and more advanced features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Premium Plan Features:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                  <span>AI-Powered Demand Analysis (S$25/summary)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                  <span>Forecast 5 dishes for the next 45 meals (15 days)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                  <span>Multiple stall management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                  <span>Integration with delivery services</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                  <span>24/7 Priority support</span>
                </li>
              </ul>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-medium">Premium Plan: S$59/month</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Cancel anytime. No long-term commitments.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPremiumDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => {
              toast({
                title: "Subscription request received",
                description: "Our team will contact you shortly to complete your subscription.",
              });
              setPremiumDialogOpen(false);
            }}>
              Subscribe Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatedTransition delay={0.1}>
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Billing Information</CardTitle>
            <CardDescription>Free tier usage for the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-sm text-muted-foreground">Current month transactions:</span>
                  <span className="ml-2 font-bold">S$1250.00</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Free tier threshold:</span>
                  <span className="ml-2 font-bold">S$2000.00</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Remaining free:</span>
                  <span className="ml-2 font-bold text-green-600">S$750.00</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usage</span>
                  <span>62.5%</span>
                </div>
                <Progress value={62.5} className="h-2" />
                <div className="flex items-center text-xs text-muted-foreground">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Transactions exceeding S$2,000 will incur a 0.5% transaction fee</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedTransition>

      <div className="grid grid-cols-1 gap-6">
        <AnimatedTransition>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                  <span className="text-2xl font-bold">{pendingOrders.length}</span>
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
          </div>
        </AnimatedTransition>
        
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
                  <TabsTrigger value="ready">Ready ({readyOrders.length})</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
                </TabsList>
                
                {['pending', 'preparing', 'ready', 'cancelled', 'completed'].map((status) => (
                  <TabsContent key={status} value={status} className="m-0">
                    {getRecentTransactionsByStatus(status).length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No {status} orders
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {getRecentTransactionsByStatus(status).map((order) => (
                          <div key={order.id} className="flex flex-col sm:flex-row gap-4">
                            <OrderCard 
                              order={order} 
                              onUpdateStatus={updateOrderStatus}
                            />
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
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </AnimatedTransition>
        
        <AnimatedTransition delay={0.2}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold">Sales Trend & Prediction</CardTitle>
                  <CardDescription>Overview of your recent and predicted sales performance</CardDescription>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant={chartType === 'revenue' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setChartType('revenue')}
                    >
                      Revenue
                    </Button>
                    <Button 
                      variant={chartType === 'orders' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setChartType('orders')}
                    >
                      Orders
                    </Button>
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
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={combinedSalesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    hide={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine x={format(new Date(), 'MMM dd')} 
                    stroke="#888" 
                    strokeDasharray="3 3" 
                    label={{ 
                      value: "Today", 
                      position: "top", 
                      fill: "#888", 
                      fontSize: 12 
                    }} 
                  />
                  {chartType === 'revenue' ? (
                    <>
                      <Line 
                        type="monotone"
                        dataKey="sales" 
                        name="Actual Sales" 
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone"
                        dataKey="predicted" 
                        name="Predicted Sales" 
                        stroke="#82ca9d"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </>
                  ) : (
                    <>
                      <Line 
                        type="monotone"
                        dataKey="orders" 
                        name="Actual Orders" 
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone"
                        dataKey="predictedOrders" 
                        name="Predicted Orders" 
                        stroke="#82ca9d"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
              
              <div className="flex items-center justify-between text-sm mt-4">
                <div className="text-muted-foreground">
                  <span className="font-medium">Past 7 days:</span> {
                    chartType === 'revenue' 
                      ? `S$${pastTotalSales.toFixed(2)}`
                      : `${pastTotalOrders} orders`
                  }
                </div>
                <div className="text-muted-foreground">
                  <span className="font-medium">Predicted 7 days:</span> {
                    chartType === 'revenue' 
                      ? `S$${predictedTotalSales.toFixed(2)}`
                      : `${predictedTotalOrders} orders`
                  }
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary"
                  onClick={handleOpenPremiumDialog}
                >
                  Unlock AI analysis <Lock className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedTransition>

        <

