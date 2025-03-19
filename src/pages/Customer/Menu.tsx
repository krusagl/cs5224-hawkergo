import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import AnimatedTransition from '@/components/ui/AnimatedTransition';

// Types
interface MenuItem {
  menuItemId: string;
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

const initialMenuItems: MenuItem[] = [
  {
    menuItemId: '1',
    name: 'Fishball Noodles',
    description: 'Delicious noodles served with handmade fishballs in a savory broth.',
    price: 5,
    image: 'https://images.unsplash.com/photo-1573570095791-df66f86d5b58?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Noodle Dishes',
    available: true
  },
  {
    menuItemId: '2',
    name: 'Bak Chor Mee',
    description: 'Minced pork noodles with black vinegar, chili, and various toppings.',
    price: 5,
    image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Noodle Dishes',
    available: true
  },
  {
    menuItemId: '3',
    name: 'Fishball Soup',
    description: 'A light and tasty soup with handmade fishballs.',
    price: 4,
    image: 'https://images.unsplash.com/photo-1618866734754-033010aa4de0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Soup Dishes',
    available: true
  },
  {
    menuItemId: '4',
    name: 'Laksa',
    description: 'Spicy noodle soup with coconut milk, prawns, and fish cake.',
    price: 6,
    image: 'https://images.unsplash.com/photo-1583947582893-604451e5e3d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Noodle Dishes',
    available: true
  }
];

const CustomerMenu = () => {
  const { stallId } = useParams<{ stallId: string }>();
  const navigate = useNavigate();
  
  const [stallDetails, setStallDetails] = useState<StallDetails | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockStallDetails: StallDetails = {
          id: stallId || '1',
          name: 'Ah Ming Noodles',
          description: 'Traditional Chinese noodles with the best ingredients since 1980',
          logoUrl: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          address: 'Maxwell Food Centre, #01-23',
          openingHours: '10:00 AM - 8:00 PM'
        };
        
        setStallDetails(mockStallDetails);
        setMenuItems(initialMenuItems);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load menu data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [stallId]);
  
  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const handleAddToCart = (menuItem: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.menuItemId === menuItem.menuItemId);
      
      if (existingItem) {
        return prev.map(item => 
          item.menuItemId === menuItem.menuItemId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, {
          menuItemId: menuItem.menuItemId,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        }];
      }
    });
    
    toast({
      title: 'Added to cart',
      description: `${menuItem.name} added to your order.`
    });
  };
  
  const handleRemoveFromCart = (menuItemId: string) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.menuItemId === menuItemId);
      
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item => 
          item.menuItemId === menuItemId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } else {
        return prev.filter(item => item.menuItemId !== menuItemId);
      }
    });
  };
  
  const handleEmptyCart = () => {
    setCart([]);
    toast({
      title: 'Cart emptied',
      description: 'All items have been removed from your cart.'
    });
  };
  
  const getItemQuantityInCart = (menuItemId: string) => {
    const cartItem = cart.find(item => item.menuItemId === menuItemId);
    return cartItem ? cartItem.quantity : 0;
  };
  
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart before proceeding to checkout.',
        variant: 'destructive'
      });
      return;
    }
    
    setCheckoutOpen(true);
  };
  
  const handleProceedToCheckout = () => {
    setCheckoutOpen(false);
    
    navigate(`/stall/${stallId}/order`, {
      state: {
        cart,
        stallDetails,
        orderType
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 mb-4"></div>
          <div className="h-4 w-40 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stallDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Stall Not Found</h2>
          <p className="text-muted-foreground mb-4">The hawker stall you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-52 sm:h-64 bg-gradient-to-r from-gray-700 to-gray-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
          alt="Chinese Noodle Stall" 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 to-transparent">
          <AnimatedTransition>
            <h1 className="text-3xl font-bold text-white mb-1">{stallDetails.name}</h1>
            <p className="text-white/90">{stallDetails.address}</p>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className="bg-white/20 text-white border-white/20">
                {stallDetails.openingHours}
              </Badge>
            </div>
          </AnimatedTransition>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <AnimatedTransition>
          <div className="mb-6">
            <p className="text-muted-foreground">{stallDetails.description}</p>
          </div>
        </AnimatedTransition>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {menuItems.map((item) => (
            <AnimatedTransition key={item.menuItemId} delay={0.1}>
              <Card className="overflow-hidden">
                {item.image && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">{item.name}</h3>
                    <span className="font-bold">S${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveFromCart(item.menuItemId)}
                        disabled={getItemQuantityInCart(item.menuItemId) === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="w-8 text-center">
                        {getItemQuantityInCart(item.menuItemId)}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleAddToCart(item)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {getItemQuantityInCart(item.menuItemId) === 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </Button>
                    ) : (
                      <span className="text-sm font-medium">
                        S${(item.price * getItemQuantityInCart(item.menuItemId)).toFixed(2)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AnimatedTransition>
          ))}
        </div>
      </div>
      
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{cartQuantity} {cartQuantity === 1 ? 'item' : 'items'}</div>
                <div className="text-lg font-bold">S${cartTotal.toFixed(2)}</div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleEmptyCart}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Empty Cart
                </Button>
                <Button
                  onClick={handleCheckout}
                  className="px-8"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <AnimatedTransition animation="fade">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <h2 className="text-xl font-bold">Your Order</h2>
                <p className="text-sm text-muted-foreground">{stallDetails.name}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between">
                      <span>
                        {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                      </span>
                      <span className="font-medium">S${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>S${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <label className="text-sm font-medium mb-2 block">Order Type</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={orderType === 'dine-in' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setOrderType('dine-in')}
                    >
                      Dine-in
                    </Button>
                    <Button
                      type="button"
                      variant={orderType === 'takeaway' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setOrderType('takeaway')}
                    >
                      Takeaway
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCheckoutOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleProceedToCheckout}>
                  Proceed to Payment
                </Button>
              </CardFooter>
            </Card>
          </AnimatedTransition>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;

