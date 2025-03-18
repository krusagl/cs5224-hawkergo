
import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, QrCode, Image, ShoppingCart, BarChart } from 'lucide-react';
import AnimatedTransition from '@/components/ui/AnimatedTransition';

const Index = () => {
  const navigate = useNavigate();
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const features = [
    {
      icon: <Image className="h-6 w-6" />,
      title: "Digital Menu Creation",
      description: "Easily upload images and text to create a beautiful digital menu for your stall.",
    },
    {
      icon: <QrCode className="h-6 w-6" />,
      title: "Custom QR Code",
      description: "Generate a unique QR code and URL to display at your stall for easy customer access.",
    },
    {
      icon: <ShoppingCart className="h-6 w-6" />,
      title: "Digital Ordering",
      description: "Accept orders and payments digitally, streamlining your operations.",
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "AI Demand Forecasting",
      description: "Get AI-powered demand forecasts to optimize ingredient preparation and reduce waste.",
    },
  ];

  const testimonials = [
    {
      text: "HawkerGo has revolutionized how I run my stall. I've increased orders by 30% and reduced food waste significantly.",
      author: "Lee Mei Ling",
      role: "Chicken Rice Stall Owner"
    },
    {
      text: "The digital menu and QR ordering system has been a game-changer. My customers love being able to order ahead of time.",
      author: "Ahmad Bin Hassan",
      role: "Nasi Padang Stall Owner"
    },
    {
      text: "The AI forecasting helps me prepare the right amount of ingredients every day. No more guesswork!",
      author: "Tan Wei Ming",
      role: "Fishball Noodle Stall Owner"
    }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <div ref={targetRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ opacity, scale, y }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background/80" />
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80" 
            alt="Hawker stall"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-3 py-1 text-sm font-medium bg-white/90 backdrop-blur-sm">
              Digitizing Hawker Food Experiences
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white drop-shadow-sm">
              The Digital Solution for Hawker Stalls
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90 drop-shadow-sm">
              Create digital menus, generate QR codes, accept online orders, and get AI-powered demand forecasts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/hawker/register')}
                className="text-base font-medium"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/pricing')}
                className="text-base font-medium bg-white/90 backdrop-blur-sm"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedTransition>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Features</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need To Digitize Your Stall
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform offers a comprehensive suite of tools designed specifically for hawker stall owners.
              </p>
            </div>
          </AnimatedTransition>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <AnimatedTransition key={index} animation="slide" delay={index * 0.1}>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </AnimatedTransition>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedTransition>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Process</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get your hawker stall online in just a few simple steps
              </p>
            </div>
          </AnimatedTransition>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <AnimatedTransition animation="slide" delay={0.1}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
                <p className="text-muted-foreground">
                  Create your account and provide basic information about your hawker stall.
                </p>
              </div>
            </AnimatedTransition>

            <AnimatedTransition animation="slide" delay={0.2}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Your Menu</h3>
                <p className="text-muted-foreground">
                  Upload photos and add descriptions for your menu items through our easy-to-use interface.
                </p>
              </div>
            </AnimatedTransition>

            <AnimatedTransition animation="slide" delay={0.3}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Go Live</h3>
                <p className="text-muted-foreground">
                  Display your QR code at your stall and start accepting digital orders immediately.
                </p>
              </div>
            </AnimatedTransition>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedTransition>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Pricing</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Affordable Plans for Every Hawker
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our tier-based pay-per-use model keeps costs affordable for smaller hawkers.
              </p>
            </div>
          </AnimatedTransition>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <AnimatedTransition animation="slide" delay={0.1}>
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <h3 className="text-xl font-semibold mb-4">Transaction Fees</h3>
                <div className="mb-6">
                  <p className="text-4xl font-bold mb-2">Free<span className="text-base font-normal text-muted-foreground"> for first S$2,000</span></p>
                  <p className="text-lg">0.5% for amounts exceeding S$2,000 per month</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>No monthly subscription fees</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Only pay when you receive orders</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Unlimited menu items and QR code generation</span>
                  </li>
                </ul>
              </div>
            </AnimatedTransition>

            <AnimatedTransition animation="slide" delay={0.2}>
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <h3 className="text-xl font-semibold mb-4">AI-Powered Demand Analysis</h3>
                <div className="mb-6">
                  <p className="text-4xl font-bold mb-2">S$25<span className="text-base font-normal text-muted-foreground"> per analysis</span></p>
                  <p className="text-lg">Pay only when you need it</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Forecast 5 dishes' demands for the next 15 days</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Optimize ingredient purchasing and preparation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Reduce food waste and maximize profits</span>
                  </li>
                </ul>
              </div>
            </AnimatedTransition>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/hawker/register')}
              className="text-base font-medium"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedTransition>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Testimonials</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Hawkers Are Saying
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Don't just take our word for it - hear from hawkers who are already using our platform.
              </p>
            </div>
          </AnimatedTransition>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedTransition key={index} animation="slide" delay={index * 0.1}>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <p className="text-lg mb-4 italic">{testimonial.text}</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </AnimatedTransition>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Digitize Your Hawker Stall?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join hundreds of hawkers who have already transformed their business with HawkerGo.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/hawker/register')}
              className="text-base font-medium"
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
