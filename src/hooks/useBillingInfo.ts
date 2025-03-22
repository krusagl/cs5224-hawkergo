
import { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, isWithinInterval, startOfDay } from 'date-fns';
import { Order } from './useOrders';

interface BillingInfo {
  currentMonthTransactions: number;
  freeThreshold: number;
  percentageUsed: number;
  remainingFree: number;
  transactionFee: number;
  todayRevenue: number;
}

export const useBillingInfo = (orders: Order[]) => {
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    currentMonthTransactions: 0,
    freeThreshold: 2000, // S$2,000 free threshold
    percentageUsed: 0,
    remainingFree: 2000,
    transactionFee: 0,
    todayRevenue: 0
  });

  useEffect(() => {
    const calculateBillingInfo = () => {
      // Define current month date range
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const todayStart = startOfDay(now);

      // Filter completed/ready paid orders for the current month and calculate total amount
      const completedOrdersThisMonth = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return (
          (order.status === 'completed' || order.status === 'ready') && 
          order.paymentStatus === 'paid' &&
          isWithinInterval(orderDate, { start: monthStart, end: monthEnd })
        );
      });

      // Calculate today's revenue from completed/ready paid orders
      const todayCompletedOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return (
          (order.status === 'completed' || order.status === 'ready') && 
          order.paymentStatus === 'paid' &&
          orderDate >= todayStart
        );
      });

      const totalAmount = completedOrdersThisMonth.reduce(
        (sum, order) => sum + order.totalAmount, 
        0
      );

      const todayRevenue = todayCompletedOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );

      // Calculate billing metrics
      const freeThreshold = 2000;
      const percentageUsed = (totalAmount / freeThreshold) * 100;
      const remainingFree = Math.max(0, freeThreshold - totalAmount);
      
      // Calculate transaction fee (0.5% for transactions exceeding S$2,000)
      const transactionFee = totalAmount > freeThreshold 
        ? (totalAmount - freeThreshold) * 0.005 
        : 0;

      setBillingInfo({
        currentMonthTransactions: totalAmount,
        freeThreshold,
        percentageUsed: Math.min(100, percentageUsed),
        remainingFree,
        transactionFee,
        todayRevenue
      });
    };

    calculateBillingInfo();
  }, [orders]);

  return billingInfo;
};
