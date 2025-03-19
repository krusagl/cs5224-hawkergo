
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import AnimatedTransition from '@/components/ui/AnimatedTransition';

const features = [
  {
    title: 'Digital Menu Management',
    description: 'Easily update your menu items, prices, and availability in real-time.',
  },
  {
    title: 'Order Processing',
    description: 'Receive and manage customer orders efficiently without crowding at your stall.',
  },
  {
    title: 'QR Code Ordering',
    description: 'Customers can scan a QR code to view your menu and place orders.',
  },
  {
    title: 'Sales Analytics',
    description: 'Get insights into your sales trends and popular items to optimize your business.',
  },
  {
    title: 'Customer Notifications',
    description: 'Automatically notify customers when their orders are ready for collection.',
  },
  {
    title: 'Demand Forecasting',
    description: 'AI-powered predictions to help you prepare for busy periods.',
  },
];

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for new hawkers trying out digital solutions',
    features: [
      'Digital menu with up to 10 items',
      'Basic order management',
      'QR code generation',
      'Up to 50 orders per month',
      'Basic sales reports',
    ],
    action: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Standard',
    price: '$29',
    period: '/month',
    description: 'For established hawkers looking to grow',
    features: [
      'Unlimited menu items',
      'Advanced order management',
      'Custom QR code design',
      'Unlimited orders',
      'Advanced analytics',
      'Priority support',
      'Demand forecasting',
    ],
    action: 'Subscribe',
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '$59',
    period: '/month',
    description: 'For multiple stalls and advanced needs',
    features: [
      'Everything in Standard',
      'Multiple stall management',
      'Loyalty program tools',
      'Integration with delivery services',
      'White-label mobile app',
      '24/7 Priority support',
      'Advanced AI analytics',
    ],
    action: 'Contact Sales',
    highlighted: false,
  },
];

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/20 to-background pt-16">
        <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedTransition>
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  Digitize Your <span className="text-primary">Hawker Stall</span> Business
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Streamline orders, reduce queues, and gain valuable insights with our digital hawker stall management platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/hawker/login">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/hawker/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      View Demo
                    </Button>
                  </Link>
                </div>
              </div>
            </AnimatedTransition>
            
            <AnimatedTransition delay={0.2}>
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1567647753830-de3fe7ce9f28?q=80&w=1300&auto=format&fit=crop"
                  alt="Lau Pat Sat Hawker Centre" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </AnimatedTransition>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedTransition>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">All-in-One Solution for Hawkers</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Everything you need to manage your hawker stall efficiently in one simple platform.
              </p>
            </div>
          </AnimatedTransition>
          
          <AnimatedTransition delay={0.1}>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="border hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mt-2">{feature.title}</h3>
                    <p className="text-muted-foreground mt-2">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AnimatedTransition>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <AnimatedTransition>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Getting Started Is Easy</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Follow these simple steps to bring your hawker stall into the digital age.
              </p>
            </div>
          </AnimatedTransition>
          
          <AnimatedTransition delay={0.1}>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mb-4">
                  1
                </div>
                <h3 className="font-semibold text-lg mb-2">Create Your Account</h3>
                <p className="text-muted-foreground">
                  Sign up in minutes and add your stall information and menu items.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mb-4">
                  2
                </div>
                <h3 className="font-semibold text-lg mb-2">Display Your QR Code</h3>
                <p className="text-muted-foreground">
                  Print and display your unique QR code at your stall for customers to scan.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mb-4">
                  3
                </div>
                <h3 className="font-semibold text-lg mb-2">Manage Orders & Grow</h3>
                <p className="text-muted-foreground">
                  Receive orders digitally, analyze sales data, and optimize your business.
                </p>
              </div>
            </div>
          </AnimatedTransition>
        </div>
      </section>
      
      {/* Pricing */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedTransition>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Choose the plan that works best for your business needs.
              </p>
            </div>
          </AnimatedTransition>
          
          <AnimatedTransition delay={0.1}>
            <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <div 
                  key={index}
                  className={`border rounded-lg overflow-hidden ${
                    tier.highlighted 
                      ? 'border-primary bg-primary/5 shadow-lg relative' 
                      : 'bg-card'
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                      Popular
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-lg font-semibold">{tier.name}</h3>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-3xl font-bold">{tier.price}</span>
                      {tier.period && (
                        <span className="ml-1 text-sm text-muted-foreground">{tier.period}</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {tier.description}
                    </p>
                  </div>
                  
                  <div className="px-6 pb-6">
                    <ul className="mt-4 space-y-3">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-primary shrink-0 mr-2" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-6">
                      <Link to="/hawker/login">
                        <Button
                          variant={tier.highlighted ? 'default' : 'outline'}
                          className="w-full"
                        >
                          {tier.action}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedTransition>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <AnimatedTransition>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to Modernize Your Hawker Business?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of hawkers who are already using our platform to streamline their operations and grow their business.
            </p>
            <Link to="/hawker/login">
              <Button size="lg">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </AnimatedTransition>
        </div>
      </section>
    </div>
  );
};

export default Index;
