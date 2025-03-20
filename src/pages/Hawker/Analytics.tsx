
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  BarChart2, 
  Calendar, 
  HelpCircle, 
  Info,
  DollarSign,
  Clock,
  LayoutGrid,
  LayoutList,
  Lock,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { addDays, format } from 'date-fns';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AnimatedTransition from '@/components/ui/AnimatedTransition';

// Mock data for menu items
const menuItems = [
  { id: '1', name: 'Fishball Noodles', price: 5 },
  { id: '2', name: 'Bak Chor Mee', price: 5 },
  { id: '3', name: 'Fishball Soup', price: 4 },
  { id: '4', name: 'Laksa', price: 6 },
];

// Generate mock data for sales by day
const generateDailySalesData = (days: number = 7) => {
  const today = new Date();
  
  return Array.from({ length: days }).map((_, i) => {
    const date = addDays(today, i);
    
    // Generate random sales for each item
    const itemSales = menuItems.map(item => ({
      itemId: item.id,
      itemName: item.name,
      quantity: Math.floor(Math.random() * 15) + 1,
      sales: (Math.floor(Math.random() * 15) + 1) * item.price
    }));
    
    // Calculate totals
    const totalQuantity = itemSales.reduce((sum, item) => sum + item.quantity, 0);
    const totalSales = itemSales.reduce((sum, item) => sum + item.sales, 0);
    
    // Add some randomness to predictions
    const predictionModifier = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
    
    return {
      date: format(date, 'MMM dd'),
      fullDate: date,
      totalQuantity,
      totalSales,
      predicted: Math.round(totalSales * predictionModifier),
      items: itemSales
    };
  });
};

// Generate mock data for item performance
const generateItemPerformanceData = () => {
  return menuItems.map(item => {
    const totalQuantity = Math.floor(Math.random() * 100) + 20;
    const totalSales = totalQuantity * item.price;
    
    // Generate day by day data
    const dailyData = Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(new Date(), i);
      const quantity = Math.floor(Math.random() * 15) + 1;
      
      return {
        date: format(date, 'MMM dd'),
        quantity,
        sales: quantity * item.price
      };
    });
    
    return {
      id: item.id,
      name: item.name,
      price: item.price,
      totalQuantity,
      totalSales,
      averagePerDay: (totalQuantity / 7).toFixed(1),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      percentageChange: (Math.random() * 20).toFixed(1),
      dailyData
    };
  });
};

// Generate AI demand analysis data
const generateAIDemandAnalysisData = () => {
  return menuItems.map(item => {
    // Generate next 15 days of demand predictions (3 meals per day)
    const mealDemand = Array.from({ length: 45 }).map((_, i) => {
      const day = Math.floor(i / 3) + 1;
      const mealIndex = i % 3;
      const mealType = ['Breakfast', 'Lunch', 'Dinner'][mealIndex];
      const demand = Math.floor(Math.random() * 10) + 
                    (mealType === 'Lunch' ? 15 : mealType === 'Dinner' ? 12 : 8);
      
      return {
        day,
        meal: mealType,
        demand
      };
    });
    
    return {
      id: item.id,
      name: item.name,
      totalPredictedDemand: mealDemand.reduce((sum, meal) => sum + meal.demand, 0),
      averageDailyDemand: (mealDemand.reduce((sum, meal) => sum + meal.demand, 0) / 15).toFixed(1),
      mealDemand
    };
  });
};

const Analytics = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'day' | 'item'>('day');
  const [isPremium, setIsPremium] = useState(false);
  const [showAIAnalysisPreview, setShowAIAnalysisPreview] = useState(false);
  
  // Generate mock data
  const dailySalesData = generateDailySalesData(14); // Next 7 days
  const itemPerformanceData = generateItemPerformanceData();
  const aiDemandAnalysisData = generateAIDemandAnalysisData();
  
  // Usage statistics - for billing/free tier visualization
  const totalSalesThisMonth = 1850;
  const freeTransactionLimit = 2000;
  const percentageUsed = Math.round((totalSalesThisMonth / freeTransactionLimit) * 100);
  const daysRemaining = 15;

  if (authLoading || !user) {
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <AnimatedTransition>
          <div>
            <Button
              variant="ghost"
              className="-ml-3 mb-2"
              onClick={() => navigate('/hawker/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Analytics & Billing</h1>
            <p className="text-muted-foreground mt-1">Track your sales performance and forecast demand</p>
          </div>
        </AnimatedTransition>
        
        <AnimatedTransition className="mt-4 md:mt-0">
          <div className="flex gap-2 bg-muted/50 p-1 rounded-md">
            <Button 
              variant={viewMode === 'day' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('day')}
              className="flex gap-2"
            >
              <Calendar className="h-4 w-4" />
              By Day
            </Button>
            <Button 
              variant={viewMode === 'item' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('item')}
              className="flex gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              By Menu Item
            </Button>
          </div>
        </AnimatedTransition>
      </div>
      
      {/* Usage Stats */}
      <AnimatedTransition delay={0.1}>
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Free Tier Usage</CardTitle>
                <CardDescription>
                  Your current usage and limits for the free tier
                </CardDescription>
              </div>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setIsPremium(!isPremium)}
              >
                Upgrade to Premium
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Transactions this month:</span>
                  <span className="font-medium">S${totalSalesThisMonth} / S${freeTransactionLimit}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${percentageUsed}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {daysRemaining} days remaining in billing cycle
                </p>
              </div>
              <div className="bg-muted/30 p-3 rounded-md text-sm flex items-start">
                <Info className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground flex-shrink-0" />
                <p>
                  You're on the Free Tier plan with no transaction fees for the first S$2,000 per month. 
                  A 0.5% transaction fee applies for amounts exceeding S$2,000. 
                  Upgrade to Premium for AI-powered demand analysis and additional features.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedTransition>
      
      {/* AI-Powered Demand Analysis */}
      <AnimatedTransition delay={0.2}>
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center">
                  AI-Powered Demand Analysis
                  {!isPremium && <Lock className="ml-2 h-4 w-4 text-muted-foreground" />}
                </CardTitle>
                <CardDescription>
                  Forecasts of 5 dishes' demands for the next 45 meals (15 days)
                </CardDescription>
              </div>
              {!isPremium && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => setIsPremium(true)}
                >
                  Unlock with Premium
                </Button>
              )}
              {isPremium && (
                <TooltipProvider>
                  <TooltipUI>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">
                        Each summary costs S$25. The AI model analyzes your historical data, 
                        seasonal patterns, and upcoming events to predict dish-specific demand.
                      </p>
                    </TooltipContent>
                  </TooltipUI>
                </TooltipProvider>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!isPremium ? (
              <div className="relative bg-muted/20 rounded-md p-6 overflow-hidden">
                <div className="flex flex-col items-center justify-center text-center">
                  <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Premium Feature</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Unlock AI-powered demand forecasting to predict which dishes will be popular 
                    and how many of each to prepare for the next 15 days.
                  </p>
                  <Button 
                    onClick={() => setIsPremium(true)}
                    className="mb-2"
                  >
                    Upgrade to Premium
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAIAnalysisPreview(!showAIAnalysisPreview)}
                  >
                    {showAIAnalysisPreview ? 'Hide Preview' : 'See Preview'}
                  </Button>
                </div>
                
                {showAIAnalysisPreview && (
                  <div className="mt-6 blur-sm pointer-events-none">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        {aiDemandAnalysisData.slice(0, 3).map(item => (
                          <Card key={item.id} className="bg-card/80">
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2">{item.name}</h4>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Total demand:</span>
                                <span className="font-medium">{item.totalPredictedDemand} orders</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Daily average:</span>
                                <span className="font-medium">{item.averageDailyDemand} orders</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="h-[200px] bg-muted/30 rounded-md"></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiDemandAnalysisData.slice(0, 5).map(item => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">{item.name}</h4>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Total 15-day demand:</span>
                          <span className="font-medium">{item.totalPredictedDemand} orders</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Daily average:</span>
                          <span className="font-medium">{item.averageDailyDemand} orders</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-muted">
                          <Button variant="outline" size="sm" className="w-full">
                            View Detailed Forecast
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Meal-by-Meal Demand Forecast</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={aiDemandAnalysisData[0].mealDemand.slice(0, 15)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis 
                        dataKey="meal" 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="demand" 
                        name="Predicted Demand" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  <div className="text-center text-sm text-muted-foreground mt-3">
                    Showing first 15 meals (5 days) for {aiDemandAnalysisData[0].name}
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">AI Summary Services</h4>
                    <span className="text-sm font-medium">S$25 per summary</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Each AI-powered demand analysis summary forecasts 5 dishes' demands for 
                    the next 45 meals (15 days). The summary is generated using advanced machine 
                    learning models trained on historical data.
                  </p>
                  <Button className="w-full">
                    Generate New Summary
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </AnimatedTransition>
      
      {viewMode === 'day' ? (
        <AnimatedTransition delay={0.3}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Sales Forecast by Day</CardTitle>
                  <CardDescription>
                    Predicted sales for the next 7 days based on historical data
                  </CardDescription>
                </div>
                <TooltipProvider>
                  <TooltipUI>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">
                        Sales forecasts are generated using an AI model that analyzes your historical sales data, 
                        seasonal patterns, weather forecasts, and local events to predict future demand.
                      </p>
                    </TooltipContent>
                  </TooltipUI>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Tabs defaultValue="chart">
                  <TabsList className="mb-4">
                    <TabsTrigger value="chart">Chart View</TabsTrigger>
                    <TabsTrigger value="table">Table View</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="chart" className="m-0">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={dailySalesData.slice(0, 7)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis 
                          dataKey="date" 
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                          formatter={(value) => [`$${value}`, 'Revenue']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        <Bar 
                          yAxisId="left"
                          dataKey="totalSales" 
                          name="Projected Sales" 
                          fill="#8884d8" 
                          radius={[4, 4, 0, 0]}
                          barSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </TabsContent>
                  
                  <TabsContent value="table" className="m-0">
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-muted/50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Projected Orders
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Projected Revenue
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dailySalesData.slice(0, 7).map((day, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {day.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {day.totalQuantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                ${day.predicted.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Projected Revenue</p>
                          <p className="text-lg font-bold">
                            ${dailySalesData.slice(0, 7).reduce((acc, day) => acc + day.predicted, 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Projected Orders</p>
                          <p className="text-lg font-bold">
                            {dailySalesData.slice(0, 7).reduce((acc, day) => acc + day.totalQuantity, 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <BarChart2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Avg. Daily Revenue</p>
                          <p className="text-lg font-bold">
                            ${(dailySalesData.slice(0, 7).reduce((acc, day) => acc + day.predicted, 0) / 7).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </AnimatedTransition>
      ) : (
        <AnimatedTransition delay={0.3}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Menu Item Performance</CardTitle>
                    <CardDescription>
                      Sales forecast by menu item for the next 7 days
                    </CardDescription>
                  </div>
                  <TooltipProvider>
                    <TooltipUI>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-sm">
                          These forecasts analyze which menu items are trending. Consider preparing 
                          more inventory for items with positive trends.
                        </p>
                      </TooltipContent>
                    </TooltipUI>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={menuItems.map(item => {
                        const itemData = itemPerformanceData.find(i => i.id === item.id);
                        return {
                          name: item.name,
                          value: itemData?.totalQuantity || 0,
                          revenue: itemData?.totalSales || 0
                        };
                      })}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis 
                        dataKey="name" 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="value" 
                        name="Projected Quantity" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="revenue" 
                        name="Projected Revenue" 
                        stroke="#82ca9d" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-muted/50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Menu Item
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Projected Orders
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Projected Revenue
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Daily Average
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Trend
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {itemPerformanceData.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.totalQuantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            ${item.totalSales.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.averagePerDay} per day
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.trend === 'up' ? '+' : '-'}{item.percentageChange}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedTransition>
      )}
    </div>
  );
};

export default Analytics;
