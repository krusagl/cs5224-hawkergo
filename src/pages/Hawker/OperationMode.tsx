
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  QrCode, ArrowLeft, Clock, CheckCircle, 
  BellRing, Search, Filter, ChevronDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useOrders, Order } from '@/hooks/useOrders';
import { format, formatDistanceToNow } from 'date-fns';
import AnimatedTransition from '@/components/ui/AnimatedTransition';

const OperationMode = () => {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading: ordersLoading, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  const [showQRCode, setShowQRCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');
  const [sortedOrders, setSortedOrders] = useState<Order[]>([]);

  // Sort and filter orders
  useEffect(() => {
    let filtered = [...orders];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.items.some(item => item.name.toLowerCase().includes(query))
      );
    }
    
    // Sort orders by priority and time
    filtered.sort((a, b) => {
      // First sort by status priority
      const statusPriority = {
        pending: 0,
        preparing: 1,
        ready: 2,
        completed: 3,
        cancelled: 4
      };
      
      const priorityDiff = (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then sort by creation time (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    setSortedOrders(filtered);
  }, [orders, filterStatus, searchQuery]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/hawker/login');
    }
  }, [authLoading, user, navigate]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const result = await updateOrderStatus(orderId, newStatus);
    
    if (result.success) {
      toast({
        title: 'Status Updated',
        description: `Order has been marked as ${newStatus}`,
      });
      
      // If status is changed to ready, show a mock notification to customer
      if (newStatus === 'ready') {
        toast({
          title: 'Customer Notified',
          description: 'Customer has been notified that their order is ready for collection',
        });
      }
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };
  
  // Get the next status based on current status
  const getNextStatus = (currentStatus: Order['status']): Order['status'] => {
    switch (currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'completed';
      default: return currentStatus;
    }
  };
  
  // Get appropriate action button text based on status
  const getActionButtonText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Start Preparing';
      case 'preparing': return 'Mark Ready';
      case 'ready': return 'Complete Order';
      default: return 'Update Status';
    }
  };
  
  // Get appropriate status badge style
  const getStatusBadgeStyle = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Calculate elapsed time from order creation
  const getElapsedTime = (createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };
  
  const stallUrl = user ? `${window.location.origin}/stall/${user.id}` : '';

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

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <AnimatedTransition>
          <div>
            <Button
              variant="ghost"
              className="-ml-3 mb-2"
              onClick={() => navigate('/hawker/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Operation Mode</h1>
            <p className="text-muted-foreground mt-1">Manage incoming orders and track transactions</p>
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
              <div className="bg-white p-4 rounded-lg shadow">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(stallUrl)}`} 
                  alt="QR Code" 
                  className="w-40 h-40"
                />
                <p className="text-center mt-2 text-sm font-medium">{user.stallName}</p>
              </div>
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
      
      {/* Search and Filter Bar */}
      <AnimatedTransition delay={0.1}>
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name or order ID..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Button 
                    variant="outline"
                    className="flex items-center gap-2 min-w-[140px] justify-between"
                    onClick={() => setFilterStatus(filterStatus === 'all' ? 'pending' : 'all')}
                  >
                    <Filter className="h-4 w-4" />
                    <span>
                      {filterStatus === 'all' ? 'All Orders' : 
                        filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedTransition>
      
      {/* Orders List */}
      <AnimatedTransition delay={0.2}>
        <div className="space-y-4">
          {sortedOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <BellRing className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No Orders Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No orders match your current filters. Try changing your search or filter settings.
              </p>
              {filterStatus !== 'all' && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setFilterStatus('all')}
                >
                  Show All Orders
                </Button>
              )}
            </div>
          ) : (
            sortedOrders.map((order) => {
              const isPriority = order.status === 'pending' || order.status === 'preparing';
              const isCompleted = order.status === 'completed' || order.status === 'cancelled';
              return (
                <Card 
                  key={order.id}
                  className={`${isPriority ? 'border-primary/30 shadow-md' : ''} 
                    ${isCompleted ? 'opacity-60' : ''}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center">
                              {order.customerName}
                              {isPriority && (
                                <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-primary"></span>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Order #{order.id} • {format(new Date(order.createdAt), 'MMM d, h:mm a')}
                            </p>
                          </div>
                          
                          <span className={`text-xs px-3 py-1 rounded-full ${getStatusBadgeStyle(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="mt-4 space-y-2 border-t pt-4">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Items</span>
                            <span>Quantity</span>
                          </div>
                          
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name}</span>
                              <span className="font-medium">{item.quantity}x</span>
                            </div>
                          ))}
                          
                          {order.items.some(item => item.specialInstructions) && (
                            <div className="text-sm mt-2 pt-2 border-t border-dashed">
                              <p className="font-medium">Special Instructions:</p>
                              {order.items
                                .filter(item => item.specialInstructions)
                                .map((item, index) => (
                                  <p key={index} className="text-muted-foreground">
                                    <span className="font-medium">{item.name}:</span> {item.specialInstructions}
                                  </p>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Order Status and Actions */}
                      <div className="md:w-72 flex flex-col justify-between border-t pt-4 md:pt-0 md:border-t-0 md:border-l md:pl-6">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Total Amount:</span>
                            <span className="font-bold">S${order.totalAmount.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Payment Status:</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium">Elapsed Time:</span>
                            <span className="text-sm flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                              {getElapsedTime(order.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <Button
                              onClick={() => handleUpdateOrderStatus(order.id, getNextStatus(order.status))}
                              className="w-full"
                              variant={order.status === 'ready' ? "outline" : "default"}
                            >
                              {order.status === 'ready' ? (
                                <CheckCircle className="mr-2 h-4 w-4" />
                              ) : (
                                <BellRing className="mr-2 h-4 w-4" />
                              )}
                              {getActionButtonText(order.status)}
                            </Button>
                          )}
                          
                          {order.status !== 'cancelled' && order.status !== 'completed' && (
                            <Button
                              onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                              variant="ghost"
                              className="w-full text-muted-foreground"
                            >
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </AnimatedTransition>
    </div>
  );
};

export default OperationMode;
