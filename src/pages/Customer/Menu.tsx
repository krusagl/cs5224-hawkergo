
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, Search, Filter, Plus, Minus, X, ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useOrders } from '@/hooks/useOrders';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedTransition from '@/components/ui/AnimatedTransition';

// Mock data for menu items
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

// Cart item
interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

// Mock stall details
interface StallDetails {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  address: string;
  openingHours: string;
}

// Sample menu items
const sampleMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Chicken Rice',
    description: 'Tender poached chicken served with fragrant rice, cucumber slices, and homemade chili sauce.',
    price: 5.5,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Main Dishes',
    available: true
  },
  {
    id: '2',
    name: 'Wanton Mee',
    description: 'Egg noodles with char siu (barbecued pork), leafy vegetables, and wonton dumplings.',
    price: 6.0,
    image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Main Dishes',
    available: true
  },
  {
    id: '3',
    name: 'Ice Kacang',
    description: 'Shaved ice dessert with sweet syrup, red beans, and various toppings.',
    price: 3.5,
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Desserts',
    available: true
  },
  {
    id: '4',
    name: 'Iced Teh Tarik',
    description: 'Pulled milk tea served cold.',
    price: 2.0,
    image: 'https://images.unsplash.com/photo-1561504809-b9c78594de7f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Beverages',
    available: true
  },
  {
    id: '5',
    name: 'Nasi Lemak',
    description: 'Coconut rice served with sambal, fried fish, egg, cucumber, and peanuts.',
    price: 5.0,
    image: 'https://images.unsplash.com/photo-1536183903938-ade9d5119c5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Main Dishes',
    available: true
  },
  {
    id: '6',
    name: 'Satay',
    description: 'Grilled skewered meat served with peanut sauce, rice cakes, cucumber, and onions.',
    price: 7.0,
    image: 'https://images.unsplash.com/photo-1475869743523-9bdf8a3a3f2a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Side Dishes',
    available: true
  },
  {
    id: '7',
    name: 'Bandung',
    description: 'Rose syrup with milk.',
    price: 1.8,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Beverages',
    available: true
  },
  {
    id: '8',
    name: 'Milo Dinosaur',
    description: 'Iced milo topped with milo powder.',
    price: 2.5,
    image: 'https://images.unsplash.com/photo-1550645612-83f5d594b671?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Beverages',
    available: true
  }
];

const Menu = () => {
  const { stallId } = useParams<{ stallId: string }>();
  const navigate = useNavigate();
  const { createOrder } = useOrders(stallId);
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>(sampleMenuItems);
  const [stallDetails, setStallDetails] = useState<StallDetails | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Categories derived from menu items
  const categories = React.useMemo(() => {
    const cats = new Set(menuItems.map(item => item.category));
    return ['All', ...Array.from(cats)];
  }, [menuItems]);
  
  // Filtered menu items based on search and category
  const filteredMenuItems = React.useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = searchQuery 
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
        
      const matchesCategory = selectedCategory && selectedCategory !== 'All'
        ? item.category === selectedCategory
        : true;
        
      return matchesSearch && matchesCategory && item.available;
    });
  }, [menuItems, searchQuery, selectedCategory]);
  
  // Fetch stall details and menu items
  useEffect(() => {
    const fetchStallData = async () => {
      try {
        setLoading(true);
        // In a real app, this would fetch data from the API
        // For now, let's use mock data
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        setStallDetails({
          id: stallId || '1',
          name: 'Delicious Food Stall',
          description: 'Serving the best local delicacies since 1995',
          logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          address: 'Smith Street, #01-123, Chinatown Complex',
          openingHours: '10:00 AM - 8:00 PM',
        });
        
        setMenuItems(sampleMenuItems);
      } catch (error) {
        console.error('Failed to fetch stall data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load menu data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStallData();
  }, [stallId]);
  
  // Calculate cart total
  const cartTotal = React.useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);
  
  // Add item to cart
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.menuItemId === item.id);
      
      if (existingItem) {
        return prev.map(cartItem => 
          cartItem.menuItemId === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      } else {
        return [...prev, {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1
        }];
      }
    });
    
    toast({
      title: 'Added to Cart',
      description: `${item.name} added to your order`,
    });
  };
  
  // Update cart item quantity
  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prev => prev.map(item => 
      item.menuItemId === itemId 
        ? { ...item, quantity } 
        : item
    ));
  };
  
  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.menuItemId !== itemId));
  };
  
  // Update special instructions
  const updateSpecialInstructions = (itemId: string, instructions: string) => {
    setCart(prev => prev.map(item => 
      item.menuItemId === itemId 
        ? { ...item, specialInstructions: instructions } 
        : item
    ));
  };
  
  // Clear the entire cart
  const clearCart = () => {
    setCart([]);
  };
  
  // Proceed to checkout
  const proceedToCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to your cart before checking out',
        variant: 'destructive',
      });
      return;
    }
    
    // Navigate to order page with cart data
    navigate(`/stall/${stallId}/order`, { 
      state: { 
        cart,
        stallDetails
      } 
    });
  };
  
  // Toggle cart sidebar
  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-200 mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stallDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Stall Not Found</h2>
          <p className="text-muted-foreground">The hawker stall you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Stall Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <AnimatedTransition>
            <div className="flex items-center">
              <div className="mr-4">
                {stallDetails.logoUrl ? (
                  <img 
                    src={stallDetails.logoUrl} 
                    alt={stallDetails.name} 
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {stallDetails.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-xl font-bold">{stallDetails.name}</h1>
                <p className="text-sm text-muted-foreground">{stallDetails.description}</p>
              </div>
              
              <Button
                onClick={toggleCart}
                className="relative ml-4"
                size="icon"
              >
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </div>
          </AnimatedTransition>
        </div>
      </div>
      
      {/* Search and Categories */}
      <div className="container mx-auto px-4 py-4">
        <AnimatedTransition delay={0.1}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex overflow-x-auto py-1 gap-2 no-scrollbar">
              {categories.map((category, index) => (
                <Button
                  key={index}
                  variant={selectedCategory === category || (category === 'All' && !selectedCategory) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category === 'All' ? null : category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </AnimatedTransition>
        
        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {filteredMenuItems.length === 0 ? (
            <div className="col-span-full py-8 text-center">
              <h3 className="text-lg font-medium mb-2">No items found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            filteredMenuItems.map((item, index) => (
              <AnimatedTransition key={item.id} delay={index * 0.05} animation="slide">
                <Card className="overflow-hidden h-full flex flex-col">
                  <div 
                    className="h-48 bg-muted"
                    style={{ 
                      backgroundImage: `url(${item.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  ></div>
                  
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      {item.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-bold">S${item.price.toFixed(2)}</span>
                      <Button
                        onClick={() => addToCart(item)}
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedTransition>
            ))
          )}
        </div>
      </div>
      
      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-20"
              onClick={toggleCart}
            ></motion.div>
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white shadow-lg z-30 flex flex-col"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Your Order</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCart}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-auto p-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                    <p className="text-muted-foreground mb-4">
                      Add items from the menu to start your order
                    </p>
                    <Button
                      variant="outline"
                      onClick={toggleCart}
                    >
                      Browse Menu
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.menuItemId} className="border rounded-lg p-3">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{item.name}</span>
                          <span>S${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-r-none"
                              onClick={() => updateCartItemQuantity(item.menuItemId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-l-none"
                              onClick={() => updateCartItemQuantity(item.menuItemId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(item.menuItemId)}
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <input
                          type="text"
                          placeholder="Special instructions..."
                          className="w-full p-2 text-sm border rounded-md"
                          value={item.specialInstructions || ''}
                          onChange={(e) => updateSpecialInstructions(item.menuItemId, e.target.value)}
                        />
                      </div>
                    ))}
                    
                    {cart.length > 0 && (
                      <Button
                        variant="ghost"
                        className="w-full text-muted-foreground"
                        onClick={clearCart}
                      >
                        Clear Cart
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t">
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">S${cartTotal.toFixed(2)}</span>
                </div>
                
                <Button
                  className="w-full"
                  disabled={cart.length === 0}
                  onClick={proceedToCheckout}
                >
                  Proceed to Checkout
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Mobile Cart Button */}
      {!isCartOpen && cart.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10"
        >
          <Button
            onClick={toggleCart}
            className="px-6 py-6 rounded-full shadow-lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            <span className="mr-2">View Cart</span>
            <span className="bg-white text-primary rounded-full px-2 py-0.5 text-sm font-bold">
              S${cartTotal.toFixed(2)}
            </span>
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Menu;
