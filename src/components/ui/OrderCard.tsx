
import React from 'react';
import { Clock, CheckCircle, AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/hooks/useOrders';
import AnimatedTransition from './AnimatedTransition';

interface OrderCardProps {
  order: Order;
  onUpdateStatus?: (orderId: string, status: Order['status']) => void;
  isCustomerView?: boolean;
  showStartPreparingButton?: boolean;
  showMarkReadyButton?: boolean;
  showMarkCompletedButton?: boolean;
  showCancelButton?: boolean;
  startPreparingButtonColor?: string;
  markReadyButtonColor?: string;
  markCompletedButtonColor?: string;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onUpdateStatus,
  isCustomerView = false,
  showStartPreparingButton = true,
  showMarkReadyButton = true,
  showMarkCompletedButton = true,
  showCancelButton = true,
  startPreparingButtonColor = "default",
  markReadyButtonColor = "default",
  markCompletedButtonColor = "default",
}) => {
  const getStatusDetails = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: 'New Order',
          color: 'bg-blue-100 text-blue-800',
          icon: <ShoppingBag className="h-4 w-4 mr-1" />,
        };
      case 'preparing':
        return {
          label: 'Preparing',
          color: 'bg-amber-100 text-amber-800',
          icon: <RefreshCw className="h-4 w-4 mr-1 animate-spin" />,
        };
      case 'ready':
        return {
          label: 'Ready for Collection',
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'bg-gray-100 text-gray-800',
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'bg-red-100 text-red-800',
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800',
          icon: null,
        };
    }
  };

  const getPaymentStatusBadge = (status: 'paid' | 'pending') => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Payment Pending</Badge>;
      default:
        return null;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const statusDetails = getStatusDetails(order.status);

  return (
    <AnimatedTransition animation="slide" className="h-full">
      <Card className="h-full overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="font-medium text-base">Order #{order.id.slice(-4)}</h3>
              <p className="text-sm text-muted-foreground">
                {isCustomerView ? order.hawkerId : order.customerName}
              </p>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="font-semibold">S${order.totalAmount.toFixed(2)}</span>
              {getPaymentStatusBadge(order.paymentStatus)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="flex justify-between text-sm mb-3">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">{formatTime(order.createdAt)}</span>
            </div>
            <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
          </div>
          
          <Badge className={`mb-4 ${statusDetails.color} flex items-center w-fit`}>
            {statusDetails.icon}
            {statusDetails.label}
          </Badge>
          
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={`${item.menuItemId}-${index}`} className="flex justify-between">
                <div className="flex">
                  <span className="text-sm font-medium">{item.quantity}x</span>
                  <span className="text-sm ml-2">{item.name}</span>
                </div>
                <span className="text-sm">S${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          {order.estimatedReadyTime && order.status !== 'completed' && order.status !== 'cancelled' && (
            <div className="mt-4 text-sm flex items-center text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              Ready by approximately {formatTime(order.estimatedReadyTime)}
            </div>
          )}
        </CardContent>
        
        {onUpdateStatus && !isCustomerView && order.status !== 'completed' && order.status !== 'cancelled' && (
          <>
            <Separator />
            <CardFooter className="p-4 flex-col space-y-2">
              {order.status === 'pending' && showStartPreparingButton && (
                <Button 
                  variant={startPreparingButtonColor as "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined}
                  className="w-full"
                  onClick={() => onUpdateStatus(order.id, 'preparing')}
                >
                  Start Preparing
                </Button>
              )}
              
              {order.status === 'preparing' && showMarkReadyButton && (
                <Button 
                  variant={markReadyButtonColor as "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined}
                  className="w-full"
                  onClick={() => onUpdateStatus(order.id, 'ready')}
                >
                  Mark as Ready
                </Button>
              )}
              
              {order.status === 'ready' && showMarkCompletedButton && (
                <Button 
                  variant={markCompletedButtonColor as "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined}
                  className="w-full"
                  onClick={() => onUpdateStatus(order.id, 'completed')}
                >
                  Mark as Completed
                </Button>
              )}
              
              {(order.status === 'pending' || order.status === 'preparing' || order.status === 'ready' || order.status === 'scheduled') && showCancelButton && (
                <Button 
                  variant="outline" 
                  className="w-full text-destructive hover:bg-destructive/10"
                  onClick={() => onUpdateStatus(order.id, 'cancelled')}
                >
                  Cancel & Refund Order
                </Button>
              )}
            </CardFooter>
          </>
        )}
      </Card>
    </AnimatedTransition>
  );
};

export default OrderCard;
