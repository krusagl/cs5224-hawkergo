import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { stallAPI, orderAPI } from "@/services/api";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  QrCode,
  Clock,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import MenuItemCard from "@/components/ui/MenuItemCard";
import AnimatedTransition from "@/components/ui/AnimatedTransition";

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

  const [activeCategory, setActiveCategory] = useState("all");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [stallDetails, setStallDetails] = useState<StallDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "card" | "qr"
  >("card");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // Add new state for polling
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Add new state for order details
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string;
    customerName: string;
    amount: number;
    paymentMethod: string;
    status: string;
  } | null>(null);

  const cartTotal = React.useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const estimatedTime = React.useMemo(() => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    return 5 + totalItems * 2;
  }, [cart]);

  useEffect(() => {
    const fetchStallData = async () => {
      try {
        setLoading(true);

        // Fetch real stall data from API
        let realStallDetails: StallDetails | null = null;

        try {
          if (stallId) {
            const stallData = await stallAPI.getStallProfile(stallId);

            // Map the API response to our StallDetails interface
            realStallDetails = {
              id: stallData.stallID,
              name: stallData.stallName,
              description: stallData.stallDescription,
              logoUrl: stallData.stallLogo || "/placeholder.svg",
              address: stallData.stallAddress,
              openingHours: "10:00 AM - 8:00 PM", // This isn't in the API yet
            };
          }
        } catch (error) {
          console.error("Failed to fetch stall data from API:", error);
          // If API fails, we'll fall back to mock data
        }

        if (realStallDetails) {
          setStallDetails(realStallDetails);
        } else {
          // Fallback to mock data if API fails or stallId isn't available
          const mockStallDetails: StallDetails = {
            id: stallId || "1",
            name: "Delicious Food Stall",
            description: "Serving the best local cuisine",
            logoUrl: "/placeholder.svg",
            address: "Maxwell Food Centre #01-23",
            openingHours: "10:00 AM - 8:00 PM",
          };
          setStallDetails(mockStallDetails);
        }

        // Fetch menu items from API
        if (stallId) {
          try {
            const response = await stallAPI.getMenuItems(stallId);
            const apiMenuItems = response.menuItems.map((item: any) => ({
              id: item.menuItemID,
              name: item.menuItemName,
              description: item.menuItemDescription || "",
              price: item.menuItemPrice,
              image: item.menuItemImage || "/placeholder.svg",
              category: item.menuItemCategory || "Uncategorized",
              available: item.menuAvailability,
            }));
            setMenuItems(apiMenuItems);
            setCategories([...new Set(apiMenuItems.map((item) => item.category))]);
          } catch (error) {
            console.error("Failed to fetch menu items:", error);
            toast({
              title: "Error",
              description: "Failed to load menu items",
              variant: "destructive",
            });
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error in fetchStallData:", error);
        setLoading(false);
      }
    };

    fetchStallData();
  }, [stallId]);

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.menuItemId === item.id
      );

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
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  const updateCartItemQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prevCart) =>
        prevCart.filter((item) => item.menuItemId !== menuItemId)
      );
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.menuItemId !== menuItemId)
    );
  };

  const updateSpecialInstructions = (
    menuItemId: string,
    instructions: string
  ) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.menuItemId === menuItemId
          ? { ...item, specialInstructions: instructions }
          : item
      )
    );
  };

  const openCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checking out",
        variant: "destructive",
      });
      return;
    }

    // Reset order states when starting a new order
    setOrderPlaced(false);
    setOrderId(null);
    setOrderDetails(null);
    setCheckoutOpen(true);
  };

  const filteredMenuItems =
    activeCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  // Modify the fetchOrderStatus function to use orderAPI.getOrderDetail
  const fetchOrderStatus = async (orderId: string) => {
    try {
      const orderData = await orderAPI.getOrderDetail(orderId);
      setOrderDetails({
        orderId: orderData.orderID,
        customerName: orderData.customerName,
        amount: orderData.orderTotalCost,
        paymentMethod: orderData.paymentMethod,
        status: orderData.orderStatus
      });
      
      // If order is completed or cancelled, stop polling
      if (orderData.orderStatus === 'completed' || orderData.orderStatus === 'cancelled') {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
    } catch (error) {
      console.error('Error fetching order status:', error);
    }
  };

  // Modify useEffect to use polling
  useEffect(() => {
    if (!orderId) return;

    // Start polling when order is placed
    const interval = setInterval(() => {
      fetchOrderStatus(orderId);
    }, 5000); // Poll every 5 seconds

    setPollingInterval(interval);

    // Cleanup interval on component unmount or when order is completed
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [orderId]);

  // Modify the searchOrderStatus function
  const searchOrderStatus = async () => {
    if (!searchOrderId.trim()) {
      toast({
        title: "Error",
        description: "Please enter an order ID",
        variant: "destructive",
      });
      return;
    }

    setSearchLoading(true);
    try {
      const orderData = await orderAPI.getOrderDetail(searchOrderId);
      setOrderDetails({
        orderId: orderData.orderID,
        customerName: orderData.customerName,
        amount: orderData.orderTotalCost,
        paymentMethod: orderData.paymentMethod,
        status: orderData.orderStatus
      });
      setOrderPlaced(true);
      setCheckoutOpen(true);
      
      toast({
        title: "Order Found",
        description: `Order status: ${orderData.orderStatus}`,
      });
    } catch (error) {
      console.error('Error searching order:', error);
      toast({
        title: "Error",
        description: "Order not found. Please check the order ID.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Update the handleCheckout function
  const handleCheckout = async () => {
    if (!stallId) return;

    setCheckoutLoading(true);
    try {
      const orderData = {
        customerName,
        customerContact: contactNumber,
        orderDetails: cart.map(item => ({
          menuItemName: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        orderTotalCost: cartTotal,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: "paid"
      };

      const response = await fetch(`https://xatcwdmrsg.execute-api.ap-southeast-1.amazonaws.com/api/stalls/${stallId}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();
      setOrderId(result.orderID);
      setOrderPlaced(true);
      setCart([]);
      
      // Fetch the initial order details
      const orderDetails = await orderAPI.getOrderDetail(result.orderID);
      setOrderDetails({
        orderId: orderDetails.orderID,
        customerName: orderDetails.customerName,
        amount: orderDetails.orderTotalCost,
        paymentMethod: orderDetails.paymentMethod,
        status: orderDetails.orderStatus
      });
      
      toast({
        title: "Order Placed!",
        description: "Your order has been placed successfully.",
      });
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const completeOrder = async () => {
    if (!orderId) return;

    try {
      // Update the order status to completed via API
      await orderAPI.updateOrderStatus(orderId, 'completed');

      // Update local state
      setOrderDetails(prev => prev ? {
        ...prev,
        status: 'completed'
      } : null);

      toast({
        title: "Order Completed",
        description: "Thank you for your order!",
      });

      // Close the dialog and reset states
      setCheckoutOpen(false);
      setOrderPlaced(false);
      setOrderId(null);
      setOrderDetails(null);
      setCart([]);
    } catch (error) {
      console.error('Error completing order:', error);
      toast({
        title: "Error",
        description: "Failed to complete order. Please try again.",
        variant: "destructive",
      });
    }
  };

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
      <AnimatedTransition>
        <div className="bg-white border-b shadow-sm pt-4 pb-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={stallDetails?.logoUrl || "/placeholder.svg"}
                  alt={stallDetails?.name || "Stall logo"}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold">{stallDetails?.name}</h1>
                <p className="text-muted-foreground">
                  {stallDetails?.description}
                </p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2 text-sm">
                  <span className="text-muted-foreground">
                    {stallDetails?.address}
                  </span>
                  <span className="text-muted-foreground">
                    {stallDetails?.openingHours}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedTransition>

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

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AnimatedTransition delay={0.2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMenuItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onClick={() => addToCart(item)}
                  />
                ))}
              </div>
            </AnimatedTransition>
          </div>

          <div className="lg:col-span-1">
            <AnimatedTransition delay={0.3}>
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Check Order Status
                  </CardTitle>
                  <CardDescription>
                    Enter your order ID to check the status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter order ID"
                      value={searchOrderId}
                      onChange={(e) => setSearchOrderId(e.target.value)}
                      disabled={searchLoading}
                    />
                    <Button
                      onClick={searchOrderStatus}
                      disabled={searchLoading}
                    >
                      {searchLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="sticky top-36 lg:top-28">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Your Order
                  </CardTitle>
                  <CardDescription>
                    {cart.length === 0
                      ? "Your cart is empty"
                      : `${cart.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )} items in cart`}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {cart.length === 0 ? (
                    <div className="text-center py-6">
                      <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                      <p className="text-muted-foreground">
                        Add items from the menu to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.menuItemId} className="flex gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="font-medium">{item.name}</span>
                              <span>
                                S${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>

                            <div className="flex items-center mt-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateCartItemQuantity(
                                    item.menuItemId,
                                    item.quantity - 1
                                  )
                                }
                                className="h-8 w-8"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateCartItemQuantity(
                                    item.menuItemId,
                                    item.quantity + 1
                                  )
                                }
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
                              value={item.specialInstructions || ""}
                              onChange={(e) =>
                                updateSpecialInstructions(
                                  item.menuItemId,
                                  e.target.value
                                )
                              }
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
                    <span className="font-semibold">
                      S${cartTotal.toFixed(2)}
                    </span>
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Customer Information
                      </CardTitle>
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

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4">
                        <div
                          className={`flex-1 border rounded-lg p-4 cursor-pointer ${
                            selectedPaymentMethod === "card"
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                          onClick={() => setSelectedPaymentMethod("card")}
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
                          className={`flex-1 border rounded-lg p-4 cursor-pointer ${
                            selectedPaymentMethod === "qr"
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                          onClick={() => setSelectedPaymentMethod("qr")}
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

                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.menuItemId}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                          <span>
                            S${(item.price * item.quantity).toFixed(2)}
                          </span>
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
                        onClick={handleCheckout}
                      >
                        {checkoutLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {checkoutLoading ? "Processing..." : "Place Order"}
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
            <div className="p-2">
              <div className="flex flex-col items-center text-center">
                {orderDetails?.status === "ready" ? (
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                )}

                <h2 className="text-2xl font-bold mb-2">
                  {orderDetails?.status === "pending" && "Order Received"}
                  {orderDetails?.status === "preparing" && "Order Being Prepared"}
                  {orderDetails?.status === "ready" && "Order Ready for Collection!"}
                  {orderDetails?.status === "completed" && "Order Completed"}
                </h2>

                <p className="text-muted-foreground mb-6">
                  {orderDetails?.status === "ready"
                    ? "Your order is ready. Please proceed to the stall for collection."
                    : orderDetails?.status === "completed"
                    ? "Thank you for your order!"
                    : `Your order is being prepared by ${stallDetails?.name}. We'll notify you when it's ready.`}
                </p>

                <div className="space-y-4 w-full">
                  <div className="text-sm bg-muted/50 p-4 rounded-lg">
                    <div className="font-medium mb-2">Order Details</div>
                    <p>Order #: {orderDetails?.orderId}</p>
                    <p>Customer: {orderDetails?.customerName}</p>
                    <p>Amount: S${orderDetails?.amount.toFixed(2)}</p>
                    <p>
                      Payment:{" "}
                      {orderDetails?.paymentMethod === "card"
                        ? "Credit Card"
                        : "QR Payment"}
                    </p>
                  </div>

                  {orderDetails?.status === "ready" ? (
                    <Button className="w-full" onClick={completeOrder}>
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
