import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShoppingCart, Plus, Minus, Loader2, CheckCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
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

const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Fishball Noodles',
    description: 'Delicious noodles served with handmade fishballs in a savory broth.',
    price: 5,
    image: 'https://images.unsplash.com/photo-1573570095791-df66f86d5b58?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Noodle Dishes',
    available: true
  },
  {
    id: '2',
    name: 'Bak Chor Mee',
    description: 'Minced pork noodles with black vinegar, chili, and various toppings.',
    price: 5,
    image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Noodle Dishes',
    available: true
  },
  {
    id: '3',
    name: 'Fishball Soup',
    description: 'A light and tasty soup with handmade fishballs.',
    price: 4,
    image: 'https://images.unsplash.com/photo-1618866734754-033010aa4de0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Soup Dishes',
    available: true
  },
  {
    id: '4',
    name: 'Laksa',
    description: 'Spicy noodle soup with coconut milk, prawns, and fish cake.',
    price: 6,
    image: 'https://images.unsplash.com/photo-1583947582893-604451e5e3d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Noodle Dishes',
    available: true
  }
];

const CustomerMenu = () => {
  const { stallId } = useParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const { cartItems, addToCart, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [stallId]);

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item);
    toast({
      title: "Item added to cart",
      description: `${item.name} has been added to your cart.`,
    })
  };

  const handleRemoveFromCart = (item: MenuItem) => {
    removeFromCart(item.id);
    toast({
      title: "Item removed from cart",
      description: `${item.name} has been removed from your cart.`,
    })
  };

  const getItemQuantityInCart = (itemId: string) => {
    const item = cartItems.find((item) => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        <h1 className="text-2xl font-bold">
          {stallId ? `Stall #${stallId} Menu` : 'Menu'}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Menu Items */}
        <div className="md:col-span-2">
          <ScrollArea className="h-[650px] rounded-md border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
              {menuItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="relative w-full h-40 overflow-hidden mb-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                      {item.category && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary">{item.category}</Badge>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">S${item.price.toFixed(2)}</span>
                      {item.available ? (
                        <div className="flex items-center space-x-2">
                          {getItemQuantityInCart(item.id) > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFromCart(item)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                          <span>{getItemQuantityInCart(item.id)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAddToCart(item)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="outline">Unavailable</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Cart */}
        <div>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-4">
                <ShoppingCart className="inline-block h-5 w-5 mr-2" />
                Your Cart
              </h2>
              <Separator className="mb-4" />
              <ScrollArea className="h-[450px]">
                {cartItems.length === 0 ? (
                  <p className="text-muted-foreground">Your cart is empty.</p>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">{item.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm">S${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <Separator className="my-4" />
              <div className="font-semibold">
                Total: S${calculateTotalPrice().toFixed(2)}
              </div>
              <Button className="w-full mt-4">
                Proceed to Order
              </Button>
              {cartItems.length > 0 && (
                <Button
                  variant="ghost"
                  className="w-full mt-2"
                  onClick={() => {
                    clearCart();
                    toast({
                      title: "Cart cleared",
                      description: "Your cart has been cleared.",
                    })
                  }}
                >
                  Clear Cart
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <AnimatedTransition animation="fade" className="fixed bottom-4 right-4 z-50">
        <Toaster />
      </AnimatedTransition>
    </div>
  );
};

export default CustomerMenu;
