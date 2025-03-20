
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useOrders } from '@/hooks/useOrders';
import { 
  ShoppingCart, Plus, Minus, Trash2, CreditCard, QrCode, Clock, CheckCircle, Loader2, ArrowLeft
} from 'lucide-react';
import MenuItemCard from '@/components/ui/MenuItemCard';
import AnimatedTransition from '@/components/ui/AnimatedTransition';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

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

const CustomerMenu = () => {
  const { stallId } = useParams<{ stallId: string }>();
  const { createOrder } = useOrders(stallId);
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [stallDetails, setStallDetails] = useState<StallDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  
  // Checkout state
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'qr'>('card');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
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
  
  // Load stall data
  useEffect(() => {
    const fetchStallData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call to fetch stall data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock stall details
        const mockStallDetails: StallDetails = {
          id: stallId || '1',
          name: 'Delicious Food Stall',
          description: 'Serving the best local cuisine',
          logoUrl: '/placeholder.svg',
          address: 'Maxwell Food Centre #01-23',
          openingHours: '10:00 AM - 8:00 PM'
        };
        
        // Mock menu items
        const mockMenuItems: MenuItem[] = [
          {
            id: '1',
            name: 'Chicken Rice',
            description: 'Fragrant rice with steamed chicken and special sauce',
            price: 5,
            image: '/placeholder.svg',
            category: 'Rice',
            available: true
          },
          {
            id: '2',
            name: 'Wanton Noodles',
            description: 'Springy noodles with char siu and wantons',
            price: 5.5,
            image: '/placeholder.svg',
            category: 'Noodles',
            available: true
          },
          {
            id: '3',
            name: 'Laksa',
            description: 'Spicy noodle soup with coconut milk',
            price: 6,
            image: '/placeholder.svg',
            category: 'Noodles',
            available: true
          },
          {
            id: '4',
            name: 'Nasi Lemak',
            description: 'Coconut rice with sambal, fried chicken, and sides',
            price: 5.5,
            image: '/placeholder.svg',
            category: 'Rice',
            available: true
          },
          {
            id: '5',
            name: 'Milo Dinosaur',
            description: 'Iced milo topped with milo powder',
            price: 3,
            image: '/placeholder.svg',
            category: 'Drinks',
            available: true
          },
          {
            id: '6',
            name: 'Teh Tarik',
            description: 'Pulled milk tea',
            price: 2,
            image: '/placeholder.svg',
            category: 'Drinks',
            available: true
          }
        ];
        
        setStallDetails(mockStallDetails);
        setMenuItems(mockMenuItems);
        
        // Extract unique categories
        const uniqueCategories = ['all', ...new Set(mockMenuItems.map(item => item.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching stall data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load menu data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStallData();
  }, [stallId]);
  
  // Add item to cart
  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.menuItemId === item.id);
      
      if (existingItem) {
        // Increment quantity if item already in cart
        return prevCart.map(cartItem => 
          cartItem.menuItemId === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      } else {
        // Add new item to cart
        return [...prevCart, {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1
        }];
      }
    });
    
    // Show toast notification
    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart`,
    });
  };
  
  // Update cart item quantity
  const updateCartItemQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or negative
      setCart(prevCart => prevCart.filter(item => item.menuItemId !== menuItemId));
    } else {
      // Update quantity
      setCart(prevCart => 
        prevCart.map(item => 
          item.menuItemId === menuItemId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
    }
  };
  
  // Remove item from cart
  const removeFromCart = (menuItemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.menuItemId !== menuItemId));
  };
  
  // Update special instructions for an item
  const updateSpecialInstructions = (menuItemId: string, instructions: string) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.menuItemId === menuItemId 
          ? { ...item, specialInstructions: instructions } 
          : item
      )
    );
  };
  
  // Open checkout dialog
  const openCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to your cart before checking out',
        variant: 'destructive'
      });
      return;
    }
    
    setCheckoutOpen(true);
  };
  
  // Filtered menu items based on active category
  const filteredMenuItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);
  
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
      setCheckoutLoading(true);
      
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
      setCheckoutLoading(false);
    }
  };
  
  const completeOrder = () => {
    // In a real app, this would update the order status
    setOrderStatus('completed');
    
    toast({
      title: 'Order Completed',
      description: 'Thank you for your order!',
    });
    
    // Close the checkout dialog and reset states
    setCheckoutOpen(false);
    setOrderPlaced(false);
    setCart([]);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 mb-4"></div>
          <div className="h-6 w-48 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Stall Header */}
      <AnimatedTransition>
        <div className="bg-white border-b shadow-sm pt-4 pb-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={stallDetails?.logoUrl || '/placeholder.svg'} 
                  alt={stallDetails?.name || 'Stall logo'} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold">{stallDetails?.name}</h1>
                <p className="text-muted-foreground">{stallDetails?.description}</p>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2 text-sm">
                  <span className="text-muted-foreground">{stallDetails?.address}</span>
                  <span className="text-muted-foreground">{stallDetails?.openingHours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedTransition>
      
      {/* Menu Categories */}
      <AnimatedTransition delay={0.1}>
        <div className="sticky top-16 md:top-20 z-10 bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 overflow-x-auto py-1">
            <Tabs 
              value={activeCategory} 
              onValueChange={setActiveCategory}
              className="w-full"
            >
              <TabsList className="w-full justify-start h-11">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="px-4 capitalize"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </AnimatedTransition>
      
      {/* Menu Items and Cart */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <AnimatedTransition delay={0.2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMenuItems.map((item) => (
                  <MenuItemCard 
                    key={item.id}
                    name={item.name}
                    description={item.description}
                    price={item.price}
                    image={item.image}
                    available={item.available}
                    onAddToCart={() => addToCart(item)}
                  />
                ))}
              </div>
            </AnimatedTransition>
          </div>
          
          {/* Cart */}
          <div className="lg:col-span-1">
            <AnimatedTransition delay={0.3}>
              <Card className="sticky top-36 lg:top-28">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Your Order
                  </CardTitle>
                  <CardDescription>
                    {cart.length === 0 
                      ? 'Your cart is empty' 
                      : `${cart.reduce((sum, item) => sum + item.quantity, 0)} items in cart`}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {cart.length === 0 ? (
                    <div className="text-center py-6">
                      <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                      <p className="text-muted-foreground">Add items from the menu to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.menuItemId} className="flex gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="font-medium">{item.name}</span>
                              <span>S${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            
                            <div className="flex items-center mt-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => updateCartItemQuantity(item.menuItemId, item.quantity - 1)}
                                className="h-8 w-8"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => updateCartItemQuantity(item.menuItemId, item.quantity + 1)}
                                className="h-8 w-8"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeFromCart(item.menuItemId)}
                                className="h-8 w-8 ml-1 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            
                            <Input
                              placeholder="Special instructions"
                              className="mt-2 text-xs"
                              value={item.specialInstructions || ''}
                              onChange={(e) => updateSpecialInstructions(item.menuItemId, e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex-col">
                  <Separator className="mb-4" />
                  
                  <div className="w-full flex justify-between mb-6">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">S${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={cart.length === 0}
                    onClick={openCheckout}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Checkout
                  </Button>
                </CardFooter>
              </Card>
            </AnimatedTransition>
          </div>
        </div>
      </div>
      
      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-3xl">
          {!orderPlaced ? (
            <>
              <DialogHeader>
                <DialogTitle>Checkout</DialogTitle>
                <DialogDescription>
                  Complete your order from {stallDetails?.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {/* Customer Information */}
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
                          disabled={checkoutLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact">Contact Number</Label>
                        <Input
                          id="contact"
                          placeholder="For order notifications"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          disabled={checkoutLoading}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Payment Method */}
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
                </div>
                
                {/* Order Summary */}
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
                        disabled={checkoutLoading}
                        onClick={handlePlaceOrder}
                      >
                        {checkoutLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {checkoutLoading ? 'Processing...' : 'Place Order'}
                      </Button>
                      
                      <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Estimated preparation time: {estimatedTime} minutes
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            /* Order Status */
            <div className="p-2">
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
                    : `Your order is being prepared by ${stallDetails?.name}. We'll notify you when it's ready.`
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
                      onClick={() => setCheckoutOpen(false)}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Return to Menu
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerMenu;
