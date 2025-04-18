import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import StallProfile from "@/components/StallProfile";
import AnimatedTransition from "@/components/ui/AnimatedTransition";
import { UserCog, Store, Wallet, Edit, Save, X, ArrowLeft } from "lucide-react";
import { Textarea } from '@/components/ui/textarea';

const Settings = () => {
  const { user, loading: authLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [stallName, setStallName] = useState('');
  const [stallAddress, setStallAddress] = useState('');
  const [stallDescription, setStallDescription] = useState('');

  // 账户设置状态
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);

  // Initialize state with user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      console.log('Setting initial values from user:', user);
      setUserName(user.name || '');
      setUserEmail(user.email || '');
      setStallName(user.stallName || '');
      setStallAddress(user.stallAddress || '');
      setStallDescription(user.stallDescription || '');
    }
  }, [user]);

  // 更新账户信息
  const handleUpdateAccount = async () => {
    try {
      setAccountLoading(true);
      console.log('Updating account with:', { name: userName, email: userEmail });
      
      await updateProfile({
        name: userName,
        email: userEmail,
      });
      
      toast({
        title: "Success",
        description: "Account information updated successfully.",
      });
    } catch (error) {
      console.error('Account update error:', error);
      toast({
        title: "Error",
        description: "Failed to update account information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAccountLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        stallName,
        stallAddress,
        stallDescription,
      });
      
      toast({
        title: 'Success',
        description: 'Stall information updated successfully',
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update stall information. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    if (user) {
      setStallName(user.stallName || '');
      setStallAddress(user.stallAddress || '');
      setStallDescription(user.stallDescription || '');
    }
    setIsEditing(false);
  };

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate("/hawker/login");
    }
  }, [authLoading, user, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-200 mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>

      <Tabs defaultValue="stall">
        <TabsList className="mb-6">
          <TabsTrigger value="account">
            <UserCog className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="stall">
            <Store className="h-4 w-4 mr-2" />
            Stall Profile
          </TabsTrigger>
          <TabsTrigger value="billing">
            <Wallet className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AnimatedTransition>
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleUpdateAccount}
                  disabled={accountLoading}
                >
                  {accountLoading && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </AnimatedTransition>
        </TabsContent>

        <TabsContent value="stall">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/hawker/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Stall Settings</h1>
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="ml-auto"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Information
              </Button>
            ) : (
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <AnimatedTransition>
            <Card>
              <CardHeader>
                <CardTitle>Stall Information</CardTitle>
                <CardDescription>
                  Manage your stall's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Stall Name</h3>
                  {isEditing ? (
                    <Input
                      value={stallName}
                      onChange={(e) => setStallName(e.target.value)}
                      placeholder="Enter your stall name"
                    />
                  ) : (
                    <p className="text-lg">{stallName || 'No stall name set'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Stall Address</h3>
                  {isEditing ? (
                    <Input
                      value={stallAddress}
                      onChange={(e) => setStallAddress(e.target.value)}
                      placeholder="Enter your stall address"
                    />
                  ) : (
                    <p className="text-lg">{stallAddress || 'No stall address set'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Stall Description</h3>
                  {isEditing ? (
                    <Textarea
                      value={stallDescription}
                      onChange={(e) => setStallDescription(e.target.value)}
                      placeholder="Describe your stall and cuisine"
                      rows={4}
                    />
                  ) : (
                    <p className="text-lg whitespace-pre-wrap">{stallDescription || 'No stall description set'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </AnimatedTransition>
        </TabsContent>

        <TabsContent value="billing">
          <AnimatedTransition>
            <Card>
              <CardHeader>
                <CardTitle>Billing Settings</CardTitle>
                <CardDescription>
                  Manage your payment methods and billing history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Billing functionality is coming soon. You can continue using
                  the free tier for now.
                </p>
              </CardContent>
            </Card>
          </AnimatedTransition>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
