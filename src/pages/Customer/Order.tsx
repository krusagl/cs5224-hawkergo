
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, QrCode, Clock, CheckCircle, ShoppingBag } from 'lucide-react';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import { toast } from '@/hooks/use-toast';

// This would normally come from a cart context or state
const mockCartItems = [
  {
    menuItemId: '1',
    name: 'Chicken Rice',
    price: 5.5,
    quantity: 2,
  },
  {
    menuItemId: '3',
    name: 'Iced Teh Tarik',
    price: 2.0,
    quantity: 1,
  },
];

const Order = () => {
  const { stallId } = useParams<{ stallId: string }>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    specialInstructions: '',
    paymentMethod: 'card',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setForm(prev => ({ ...prev, paymentMethod: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.phone) {
      toast({
        title: 'Missing information',
        description: 'Please provide your name and phone number.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setOrderComplete(true);
      
      toast({
        title: 'Order placed successfully',
        description: 'You will receive a notification when your order is ready.',
      });
    }, 2000);
  };

  const subtotal = mockCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;
  const estimatedTime = 15; // minutes

  // Render order confirmation if order is complete
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <AnimatedTransition animation="slide" className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
              <CardDescription>
                Your order has been placed successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-md text-center space-y-2">
                <div className="flex items-center justify-center text-primary">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="font-medium">Estimated Ready Time</span>
                </div>
                <p className="text-xl font-bold">
                  {new Date(Date.now() + estimatedTime * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm text-muted-foreground">
                  (Approximately {estimatedTime} minutes from now)
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Order Summary</h3>
                <div className="space-y-2">
                  {mockCartItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>S${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>S${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-md text-center">
                <p className="text-sm text-muted-foreground">
                  You will receive a notification when your order is ready for collection.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                className="w-full" 
                onClick={() => navigate(`/stall/${stallId}`)}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Return to Menu
              </Button>
            </CardFooter>
          </Card>
        </AnimatedTransition>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="container mx-auto max-w-3xl">
        <AnimatedTransition>
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/stall/${stallId}`)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menu
          </Button>
          
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        </AnimatedTransition>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AnimatedTransition>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    We'll use this to notify you when your order is ready
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name*</Label>
                      <Input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number*</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      For sending receipt and order confirmation
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedTransition>
            
            <AnimatedTransition delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle>Special Instructions</CardTitle>
                  <CardDescription>
                    Any special requests for your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    placeholder="E.g., Less spicy, no coriander, etc."
                    value={form.specialInstructions}
                    onChange={handleChange}
                    rows={3}
                  />
                </CardContent>
              </Card>
            </AnimatedTransition>
            
            <AnimatedTransition delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>
                    Select how you want to pay
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={form.paymentMethod} 
                    onValueChange={handleRadioChange}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="card" id="payment-card" />
                      <Label 
                        htmlFor="payment-card" 
                        className="flex items-center flex-1 cursor-pointer"
                      >
                        <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-sm text-muted-foreground">
                            Pay securely using your card
                          </p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="qr" id="payment-qr" />
                      <Label 
                        htmlFor="payment-qr" 
                        className="flex items-center flex-1 cursor-pointer"
                      >
                        <QrCode className="h-5 w-5 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">QR Payment</p>
                          <p className="text-sm text-muted-foreground">
                            PayNow, GrabPay, FavePay, etc.
                          </p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </AnimatedTransition>
          </div>
          
          <div className="lg:sticky lg:top-6 h-fit">
            <AnimatedTransition delay={0.3}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {mockCartItems.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span>S${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>S${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>S${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-md text-sm flex items-center">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Estimated waiting time: ~{estimatedTime} mins</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isProcessing}
                  >
                    {isProcessing && (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    )}
                    {isProcessing ? 'Processing...' : `Pay S$${total.toFixed(2)}`}
                  </Button>
                </CardFooter>
              </Card>
            </AnimatedTransition>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
