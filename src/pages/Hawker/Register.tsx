
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

const Register = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    stallName: '',
    stallAddress: '',
    stallDescription: '',
    stallLogo: '',
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For a real app, this would upload the file to storage
    // For now, we'll just use a FileReader to get a data URL
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, stallLogo: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitStepOne = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    setStep(2);
  };

  const handleSubmitStepTwo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      await register({
        name: formData.name,
        email: formData.email,
        role: 'hawker',
        stallName: formData.stallName,
        stallAddress: formData.stallAddress,
        stallDescription: formData.stallDescription,
        stallLogo: formData.stallLogo,
      }, formData.password);

      toast({
        title: 'Success',
        description: 'Account created successfully. Redirecting to dashboard...',
      });
      navigate('/hawker/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <AnimatedTransition animation="slide" key={`step-${step}`} className="w-full max-w-md">
        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => step === 1 ? navigate('/') : setStep(1)}
                className="absolute left-4 top-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl font-bold">
                {step === 1 ? 'Create an Account' : 'Stall Information'}
              </CardTitle>
            </div>
            <CardDescription>
              {step === 1 
                ? 'Sign up for a new hawker account' 
                : 'Tell us about your hawker stall'}
            </CardDescription>
          </CardHeader>

          {step === 1 ? (
            <form onSubmit={handleSubmitStepOne}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                  <Link
                    to="/hawker/login"
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleSubmitStepTwo}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stallName">Stall Name</Label>
                  <Input
                    id="stallName"
                    name="stallName"
                    placeholder="Your Stall Name"
                    value={formData.stallName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stallAddress">Stall Address</Label>
                  <Input
                    id="stallAddress"
                    name="stallAddress"
                    placeholder="Stall Location"
                    value={formData.stallAddress}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stallDescription">Stall Description</Label>
                  <Textarea
                    id="stallDescription"
                    name="stallDescription"
                    placeholder="Tell customers about your stall and cuisine"
                    rows={3}
                    value={formData.stallDescription}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stallLogo">Stall Logo or Image (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden"
                    >
                      {formData.stallLogo ? (
                        <img 
                          src={formData.stallLogo} 
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
          )}
        </Card>
      </AnimatedTransition>
    </div>
  );
};

export default Register;
