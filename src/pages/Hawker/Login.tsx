import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import { LoginResponse } from '@/services/api';
import { userAPI } from '@/services/api';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [stallName, setStallName] = useState('');
  const [stallAddress, setStallAddress] = useState('');
  const [stallDescription, setStallDescription] = useState('');
  const [stallLogo, setStallLogo] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginWithPreset = async (preset: 'demo' | 'admin') => {
    try {
      setLoading(true);
      
      // Use preset credentials
      const presetEmail =  'demo@hawkergo.com';
      const presetPassword = '123456'; // This should match the mock password in the API
      
      console.log('Starting login process with preset account...');
      
      const response = (await login(presetEmail, presetPassword) as unknown) as LoginResponse;
      console.log('Login successful, response:', response);
      
      if (!response || !response.name) {
        throw new Error('Invalid response from server');
      }
      
      // Store user data in localStorage
      const user = {
        id: response.userID,
        email: presetEmail,
        name: response.userName,
        role: preset === 'admin' ? 'admin' : 'hawker',
      };
      localStorage.setItem('user', JSON.stringify(user));
      
      toast({
        title: 'Success',
        description: `Welcome back! Redirecting to dashboard...`,
      });
      
      // Navigate based on the role from the API response
      const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/hawker/dashboard';
      console.log('Redirecting to:', dashboardPath);
      navigate(dashboardPath);
    } catch (error) {
      console.error('Login error details:', error);
      let errorMessage = 'Invalid email or password. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('Unable to connect')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.message.includes('Internal server error')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setStallLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      console.log('Starting login process...');
      
      const response = (await login(email, password) as unknown) as LoginResponse;
      console.log('Login successful, response:', response);
      
      if (!response || !response.name) {
        throw new Error('Invalid response from server');
      }
      
      // Store user data in localStorage
      const user = {
        id: response.userID,
        email: email,
        name: response.userName,
        role: 'hawker',
      };
      localStorage.setItem('user', JSON.stringify(user));
      
      toast({
        title: 'Success',
        description: `Welcome back! Redirecting to dashboard...`,
      });
      
      // Navigate based on the role from the API response
      const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/hawker/dashboard';
      console.log('Redirecting to:', dashboardPath);
      navigate(dashboardPath);
    } catch (error) {
      console.error('Login error details:', error);
      let errorMessage = 'Invalid email or password. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('Unable to connect')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.message.includes('Internal server error')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStepOne = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Check if email already exists
      const result = await userAPI.checkEmailExists(email);
      
      if (result.exists) {
        toast({
          title: 'Error',
          description: 'This email is already registered. Please use a different email or try logging in.',
          variant: 'destructive',
        });
        return;
      }
      
      // If email doesn't exist, proceed to step 2
      setStep(2);
    } catch (error) {
      console.error('Email check error:', error);
      toast({
        title: 'Error',
        description: 'Unable to verify email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStepTwo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      // Call register function with all user data
      const user = await register({
        name,
        email,
        role: 'hawker',
        stallName,
        stallAddress,
        stallDescription,
        stallLogo,
      }, password);

      toast({
        title: 'Success',
        description: 'Account created successfully. Redirecting to dashboard...',
      });
      
      // Navigate to dashboard
      navigate('/hawker/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('Unable to connect')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.message.includes('Internal server error')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsRegistering(false);
    setStep(1);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setStallName('');
    setStallAddress('');
    setStallDescription('');
    setStallLogo('');
  };

  // Login Form
  if (!isRegistering) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AnimatedTransition animation="slide" className="w-full max-w-md">
          <Card className="w-full shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/')}
                  className="absolute left-4 top-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              </div>
              <CardDescription>
                Sign in to your Hawker account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  disabled={loading}
                  onClick={() => handleLoginWithPreset('demo')}
                >
                  Demo Account
                </Button>
                <div className="text-center w-full">
                  <span className="text-sm text-muted-foreground">Don't have an account? </span>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsRegistering(true)}
                    className="text-sm text-primary p-0 h-auto font-normal"
                  >
                    Register now
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </AnimatedTransition>
      </div>
    );
  }

  // Registration Form - Step 1
  if (isRegistering && step === 1) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AnimatedTransition animation="slide" className="w-full max-w-md">
          <Card className="w-full shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => resetForm()}
                  className="absolute left-4 top-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
              </div>
              <CardDescription>
                Sign up for a new hawker account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegisterStepOne}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <div className="text-center text-sm">
                  Already have an account?{' '}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => resetForm()}
                    className="p-0 h-auto font-normal text-primary"
                  >
                    Sign in
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </AnimatedTransition>
      </div>
    );
  }

  // Registration Form - Step 2
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <AnimatedTransition animation="slide" className="w-full max-w-md">
        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep(1)}
                className="absolute left-4 top-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl font-bold">Stall Information</CardTitle>
            </div>
            <CardDescription>
              Tell us about your hawker stall
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegisterStepTwo}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stallName">Stall Name</Label>
                <Input
                  id="stallName"
                  placeholder="Your Stall Name"
                  value={stallName}
                  onChange={(e) => setStallName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stallAddress">Stall Address</Label>
                <Input
                  id="stallAddress"
                  placeholder="Stall Location"
                  value={stallAddress}
                  onChange={(e) => setStallAddress(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stallDescription">Stall Description</Label>
                <Textarea
                  id="stallDescription"
                  placeholder="Tell customers about your stall and cuisine"
                  rows={3}
                  value={stallDescription}
                  onChange={(e) => setStallDescription(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stallLogo">Stall Logo or Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden"
                  >
                    {stallLogo ? (
                      <img 
                        src={stallLogo} 
                        alt="Stall Logo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="stallLogo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a logo or image of your stall
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Registration
              </Button>
            </CardFooter>
          </form>
        </Card>
      </AnimatedTransition>
    </div>
  );
};

export default Login;
