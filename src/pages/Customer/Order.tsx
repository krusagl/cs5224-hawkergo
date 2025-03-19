
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, CreditCard, QrCode, Clock, CheckCircle, Loader2
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import AnimatedTransition from '@/components/ui/AnimatedTransition';

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

interface StallDetails {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  address: string;
  openingHours: string;
}

const Order = () => {
  const { stallId } = useParams<{ stallId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { createOrder } = useOrders(stallId);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [stallDetails, setStallDetails] = useState<StallDetails | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'qr'>('card');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<'pending' | 'preparing' | 'ready' | 'completed'>('pending');
  
  // Calculate cart total
  const cartTotal = React.useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);
  
  // Estimated preparation time
  const estimatedTime = React.useMemo(() => {
    // Basic calculation: 5 mins base + 2 mins per item
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    return 5 + (totalItems * 2);
  }, [cart]);
  
  // Get cart and stall details from location state
  useEffect(() => {
    if (location.state) {
      const { cart: locationCart, stallDetails: locationStallDetails } = location.state as {
        cart: CartItem[];
        stallDetails: StallDetails;
      };
      
      if (locationCart?.length) {
        setCart(locationCart);
      }
      
      if (locationStallDetails) {
        setStallDetails(locationStallDetails);
      }
    } else {
      // If there's no cart data, redirect back to menu
      navigate(`/stall/${stallId}`);
    }
  }, [location.state, stallId, navigate]);
  
  // Simulate order status updates
  useEffect(() => {
    if (!orderId) return;
    
    const updateStatusTimer = setTimeout(() => {
      if (orderStatus === 'pending') {
        setOrderStatus('preparing');
        toast({
          title: 'Order Update',
          description: 'Your order is now being prepared',
        });
      } else if (orderStatus === 'preparing') {
        setOrderStatus('ready');
        toast({
          title: 'Order Ready!',
          description: 'Your order is ready for collection',
        });
      }
    }, 10000); // 10 seconds for simulation
    
    return () => clearTimeout(updateStatusTimer);
  }, [orderId, orderStatus]);
  
  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide your name',
        variant: 'destructive',
      });
      return;
    }
    
    if (!contactNumber.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide your contact number',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulate API call to create order
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create order in the system
      const result = await createOrder({
        customerId: 'guest',
        customerName,
        hawkerId: stallId || '',
        items: cart,
        status: 'pending',
        totalAmount: cartTotal,
        estimatedReadyTime: new Date(Date.now() + estimatedTime * 60000).toISOString(),
        paymentStatus: 'paid',
        paymentMethod: selectedPaymentMethod,
      });
      
      if (result.success) {
        setOrderId(result.orderId);
        setOrderPlaced(true);
        
        toast({
          title: 'Order Placed Successfully',
          description: 'Your order has been sent to the hawker stall',
        });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      toast({
        title: 'Error',
        description: 'Failed to place your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const completeOrder = () => {
    // In a real app, this would update the order status
    setOrderStatus('completed');
    
    toast({
      title: 'Order Completed',
      description: 'Thank you for your order!',
    });
    
    // Redirect to menu after a short delay
    setTimeout(() => {
      navigate(`/stall/${stallId}`);
    }, 2000);
  };
  
  if (!stallDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-200 mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {!orderPlaced ? (
          <>
            {/* Checkout Form */}
            <AnimatedTransition>
              <div className="mb-6">
                <Button
                  variant="ghost"
                  className="-ml-3"
                  onClick={() => navigate(`/stall/${stallId}`)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Menu
                </Button>
                <h1 className="text-2xl font-bold mt-2">Checkout</h1>
                <p className="text-muted-foreground">{stallDetails.name}</p>
              </div>
            </AnimatedTransition>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Customer Information */}
                <AnimatedTransition delay={0.1}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter your name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact">Contact Number</Label>
                        <Input
                          id="contact"
                          placeholder="For order notifications"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedTransition>
                
                {/* Payment Method */}
                <AnimatedTransition delay={0.2}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4">
                        <div 
                          className={`flex-1 border rounded-lg p-4 cursor-pointer ${selectedPaymentMethod === 'card' ? 'border-primary bg-primary/5' : ''}`}
                          onClick={() => setSelectedPaymentMethod('card')}
                        >
                          <div className="flex items-center">
                            <CreditCard className="h-5 w-5 mr-2 text-primary" />
                            <span className="font-medium">Credit Card</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Pay securely with credit or debit card
                          </p>
                        </div>
                        
                        <div 
                          className={`flex-1 border rounded-lg p-4 cursor-pointer ${selectedPaymentMethod === 'qr' ? 'border-primary bg-primary/5' : ''}`}
                          onClick={() => setSelectedPaymentMethod('qr')}
                        >
                          <div className="flex items-center">
                            <QrCode className="h-5 w-5 mr-2 text-primary" />
                            <span className="font-medium">QR Payment</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Scan a QR code to pay with PayNow, PayLah, etc.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedTransition>
              </div>
              
              {/* Order Summary */}
              <AnimatedTransition delay={0.3}>
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.menuItemId} className="flex justify-between text-sm">
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                          <span>S${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>S${cartTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="pt-4">
                      <Button
                        className="w-full"
                        disabled={loading}
                        onClick={handlePlaceOrder}
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Processing...' : 'Place Order'}
                      </Button>
                      
                      <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Estimated preparation time: {estimatedTime} minutes
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedTransition>
            </div>
          </>
        ) : (
          /* Order Status Page */
          <AnimatedTransition>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  {orderStatus === 'ready' ? (
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                  )}
                  
                  <h2 className="text-2xl font-bold mb-2">
                    {orderStatus === 'pending' && 'Order Received'}
                    {orderStatus === 'preparing' && 'Order Being Prepared'}
                    {orderStatus === 'ready' && 'Order Ready for Collection!'}
                  </h2>
                  
                  <p className="text-muted-foreground mb-6">
                    {orderStatus === 'ready' 
                      ? 'Your order is ready. Please proceed to the stall for collection.'
                      : `Your order is being prepared by ${stallDetails.name}. We'll notify you when it's ready.`
                    }
                  </p>
                  
                  <div className="w-full bg-muted rounded-full h-2 mb-6">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: orderStatus === 'pending' ? '33%' : 
                              orderStatus === 'preparing' ? '66%' : '100%' 
                      }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-3 w-full gap-2 mb-6 text-sm">
                    <div className="text-center">
                      <div className={`h-8 w-8 rounded-full mx-auto mb-1 flex items-center justify-center ${orderStatus !== 'pending' ? 'bg-primary text-white' : 'bg-muted'}`}>
                        1
                      </div>
                      <span className={orderStatus !== 'pending' ? 'text-primary font-medium' : ''}>Received</span>
                    </div>
                    <div className="text-center">
                      <div className={`h-8 w-8 rounded-full mx-auto mb-1 flex items-center justify-center ${orderStatus === 'preparing' || orderStatus === 'ready' ? 'bg-primary text-white' : 'bg-muted'}`}>
                        2
                      </div>
                      <span className={orderStatus === 'preparing' || orderStatus === 'ready' ? 'text-primary font-medium' : ''}>Preparing</span>
                    </div>
                    <div className="text-center">
                      <div className={`h-8 w-8 rounded-full mx-auto mb-1 flex items-center justify-center ${orderStatus === 'ready' ? 'bg-primary text-white' : 'bg-muted'}`}>
                        3
                      </div>
                      <span className={orderStatus === 'ready' ? 'text-primary font-medium' : ''}>Ready</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 w-full">
                    <div className="text-sm bg-muted/50 p-4 rounded-lg">
                      <div className="font-medium mb-2">Order Details</div>
                      <p>Order #: {orderId}</p>
                      <p>Customer: {customerName}</p>
                      <p>Amount: S${cartTotal.toFixed(2)}</p>
                      <p>Payment: {selectedPaymentMethod === 'card' ? 'Credit Card' : 'QR Payment'}</p>
                    </div>
                    
                    {orderStatus === 'ready' ? (
                      <Button
                        className="w-full"
                        onClick={completeOrder}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirm Received
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/stall/${stallId}`)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Return to Menu
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedTransition>
        )}
      </div>
    </div>
  );
};

export default Order;
