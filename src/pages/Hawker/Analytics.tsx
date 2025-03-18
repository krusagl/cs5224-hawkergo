
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, TrendingUp, HelpCircle, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import { toast } from '@/hooks/use-toast';

// Mock data for demand forecasting
const forecastData = [
  {
    name: 'Chicken Rice',
    today: 15,
    tomorrow: 18,
    day3: 14,
    day4: 20,
    day5: 25,
  },
  {
    name: 'Hokkien Mee',
    today: 12,
    tomorrow: 10,
    day3: 16,
    day4: 14,
    day5: 13,
  },
  {
    name: 'Laksa',
    today: 8,
    tomorrow: 13,
    day3: 9,
    day4: 7,
    day5: 12,
  },
  {
    name: 'Char Kway Teow',
    today: 6,
    tomorrow: 9,
    day3: 7,
    day4: 10,
    day5: 8,
  },
  {
    name: 'Carrot Cake',
    today: 10,
    tomorrow: 12,
    day3: 11,
    day4: 8,
    day5: 9,
  },
];

const salesData = [
  { name: 'Mon', sales: 350 },
  { name: 'Tue', sales: 420 },
  { name: 'Wed', sales: 380 },
  { name: 'Thu', sales: 290 },
  { name: 'Fri', sales: 510 },
  { name: 'Sat', sales: 620 },
  { name: 'Sun', sales: 580 },
];

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  const handleGenerateForecast = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowForecast(true);
      toast({
        title: 'Forecast Generated',
        description: 'Your demand forecast for the next 5 days is ready.',
      });
    }, 2500);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <AnimatedTransition>
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/hawker/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Data insights and demand forecasting</p>
          </div>
        </div>
      </AnimatedTransition>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AnimatedTransition>
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Demand Forecast</CardTitle>
                <CardDescription>
                  Get predictions for your top 5 dishes to optimize ingredient preparation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showForecast ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Estimated Orders', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="today" name="Today" fill="#4f46e5" />
                        <Bar dataKey="tomorrow" name="Tomorrow" fill="#8884d8" />
                        <Bar dataKey="day3" name="Day 3" fill="#82ca9d" />
                        <Bar dataKey="day4" name="Day 4" fill="#ffc658" />
                        <Bar dataKey="day5" name="Day 5" fill="#ff8042" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Generate Your Demand Forecast</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Our AI will analyze your order history and predict demand for your top 5 dishes
                      over the next 5 days.
                    </p>
                    <Button 
                      size="lg" 
                      onClick={handleGenerateForecast}
                      disabled={isGenerating}
                    >
                      {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isGenerating ? 'Generating Forecast...' : 'Generate Forecast'}
                    </Button>
                  </div>
                )}
              </CardContent>
              {showForecast && (
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>Last updated: {new Date().toLocaleString()}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    View More Days
                  </Button>
                </CardFooter>
              )}
            </Card>
          </AnimatedTransition>

          <AnimatedTransition delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle>Weekly Sales Overview</CardTitle>
                <CardDescription>
                  Track your sales performance over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Sales (S$)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`S$${value}`, 'Sales']} />
                      <Bar dataKey="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </AnimatedTransition>
        </div>

        <div className="space-y-6">
          <AnimatedTransition delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle>Demand Forecasting Credits</CardTitle>
                <CardDescription>Manage your AI forecasting usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-md">
                    <div className="text-sm font-medium mb-1">Current Pricing</div>
                    <div className="text-2xl font-bold mb-1">S$25</div>
                    <div className="text-sm text-muted-foreground">Per forecast generated</div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Forecasts Generated</span>
                      <span className="font-medium">1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Amount Billed</span>
                      <span className="font-medium">S$25.00</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Billing History
                </Button>
              </CardFooter>
            </Card>
          </AnimatedTransition>

          <AnimatedTransition delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle>Optimization Tips</CardTitle>
                <CardDescription>Get the most from your forecasts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Ingredient Planning</h4>
                    <p className="text-sm text-muted-foreground">
                      Use forecasts to calculate exact ingredient quantities needed.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Staff Scheduling</h4>
                    <p className="text-sm text-muted-foreground">
                      Plan your staff requirements based on predicted busy periods.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Promotion Planning</h4>
                    <p className="text-sm text-muted-foreground">
                      Run promotions on slow days to boost sales.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="w-full">
                  Read More Tips <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </AnimatedTransition>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
