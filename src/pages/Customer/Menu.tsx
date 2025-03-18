
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Search, AlertCircle, ChevronLeft, Store, Clock, Star } from 'lucide-react';
import { MenuItem } from '@/hooks/useOrders';
import MenuItemCard from '@/components/ui/MenuItemCard';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import { toast } from '@/hooks/use-toast';

// Mock data
const initialMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Chicken Rice',
    description: 'Tender poached chicken served with fragrant rice, cucumber slices, and a side of chili sauce.',
    price: 5.5,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'mains',
    available: true,
  },
  {
    id: '2',
    name: 'Hokkien Mee',
    description: 'Stir-fried noodles with prawns, squid, pork belly, and bean sprouts in a rich seafood broth.',
    price: 6.0,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'mains',
    available: true,
  },
  {
    id: '3',
    name: 'Char Kway Teow',
    description: 'Flat rice noodles stir-fried with light and dark soy sauce, chilli, prawns, cockles, bean sprouts and Chinese lap cheong sausage.',
    price: 5.0,
    image: 'https://images.unsplash.com/photo-1570275239925-4af0aa93a0dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'mains',
    available: true,
  },
  {
    id: '4',
    name: 'Laksa',
    description: 'Spicy coconut milk-based soup with thick rice noodles, prawns, fishcake, and bean sprouts.',
    price: 6.5,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'mains',
    available: true,
  },
  {
    id: '5',
    name: 'Iced Teh Tarik',
    description: 'Sweet milk tea served over ice, pulled to create a frothy top.',
    price: 2.0,
    image: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'drinks',
    available: true,
  },
  {
    id: '6',
    name: 'Milo Dinosaur',
    description: 'Iced milo topped with a mountain of milo powder.',
    price: 2.5,
    image: 'https://images.unsplash.com/photo-1569016832321-de4681f646b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'drinks',
    available: true,
  },
  {
    id: '7',
    name: 'Chendol',
    description: 'Shaved ice dessert with green rice flour jelly, red beans, and coconut milk, topped with palm sugar syrup.',
    price: 3.5,
    image: 'https://images.unsplash.com/photo-1625938145744-e6e9749d3397?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'desserts',
    available: true,
  },
];

const mockStallData = {
  id: '1',
  name: 'Delicious Food Stall',
  description: 'Serving authentic Singaporean hawker cuisine since 1995. We take pride in our traditional recipes and quality ingredients.',
  address: 'Smith Street, #01-123, Chinatown Complex',
  openingHours: '10:30 AM - 8:30 PM',
  image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
};

interface StallInfo {
  id: string;
  name: string;
  description: string;
  address: string;
  openingHours: string;
  image: string;
}

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

const Menu = () => {
  const { stallId } = useParams<{ stallId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stallInfo, setStallInfo] = useState<StallInfo | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    // In a real app, fetch stall data and menu items
    // For now, use mock data
    setTimeout(() => {
      setStallInfo(mockStallData);
      setMenuItems(initialMenuItems);
      setLoading(false);
    }, 1000);
  }, [stallId]);

  const handleAddToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.menuItemId === item.id);
      
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.menuItemId === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [
          ...prevCart,
          {
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
          },
        ];
      }
    });
    
    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart.`,
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Get unique categories
  const categories = Array.from(new Set(menuItems.map((item) => item.category)));

  // Filter items by search and category
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 mb-4"></div>
          <div className="h-4 w-40 bg-gray-200 rounded mb-3"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stallInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Stall Not Found</h1>
        <p className="text-muted-foreground mb-6 text-center">
          Sorry, we couldn't find the stall you're looking for.
        </p>
        <Button onClick={() => navigate('/')}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 z-10" />
        <img
          src={stallInfo.image}
          alt={stallInfo.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 text-white hover:bg-white/20 self-start"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <AnimatedTransition>
            <div className="space-y-2">
              <Badge className="bg-primary/90 backdrop-blur-sm">Hawker Stall</Badge>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                {stallInfo.name}
              </h1>
              <div className="flex flex-wrap gap-3 text-white/90 text-sm">
                <div className="flex items-center">
                  <Store className="h-4 w-4 mr-1" />
                  <span>{stallInfo.address}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{stallInfo.openingHours}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-400" />
                  <span>4.8 (128 reviews)</span>
                </div>
              </div>
            </div>
          </AnimatedTransition>
        </div>
      </div>

      <div className="container mx-auto p-4 sm:p-6 relative -mt-6">
        <AnimatedTransition>
          <Card className="mb-6 shadow-lg">
            <CardContent className="p-6">
              <p className="text-muted-foreground">{stallInfo.description}</p>
            </CardContent>
          </Card>
        </AnimatedTransition>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <AnimatedTransition>
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search menu items..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </AnimatedTransition>

            <AnimatedTransition delay={0.1}>
              <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="mb-6 w-full overflow-x-auto">
                  <TabsTrigger value="all">All Items</TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div>
                  {filteredItems.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                        <h3 className="font-medium text-lg mb-1">No items found</h3>
                        <p className="text-muted-foreground">
                          {searchQuery
                            ? `No menu items matching "${searchQuery}"`
                            : `No items in this category`}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
                      {filteredItems.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          onClick={handleAddToCart}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Tabs>
            </AnimatedTransition>
          </div>

          <div className="lg:w-1/3">
            <AnimatedTransition delay={0.2}>
              <div className="lg:sticky lg:top-6">
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Your Order
                    </h2>

                    {cart.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium mb-2">Your cart is empty</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Add items from the menu to get started
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4 mb-6">
                          {cart.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <div>
                                <div className="flex items-center">
                                  <span className="font-medium">{item.quantity}x</span>
                                  <span className="ml-2">{item.name}</span>
                                </div>
                              </div>
                              <span className="font-medium">S${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t pt-4 mb-6">
                          <div className="flex justify-between mb-2">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>S${totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>S${totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    )}

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => navigate(`/stall/${stallId}/order`)}
                      disabled={cart.length === 0}
                    >
                      {cart.length > 0
                        ? `Checkout (${totalItems} item${totalItems !== 1 ? 's' : ''})`
                        : 'Add items to order'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </AnimatedTransition>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
