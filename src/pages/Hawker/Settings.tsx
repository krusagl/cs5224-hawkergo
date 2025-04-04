import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
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
import { UserCog, Store, Wallet } from "lucide-react";

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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
                  <Input id="name" defaultValue={user.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() =>
                    toast({
                      title: "Not implemented",
                      description:
                        "Account update functionality is not yet implemented.",
                    })
                  }
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </AnimatedTransition>
        </TabsContent>

        <TabsContent value="stall">
          <AnimatedTransition>
            <StallProfile
              stallId="001"
              onProfileUpdated={() => {
                toast({
                  title: "Profile Updated",
                  description:
                    "Your stall profile has been updated successfully.",
                });
              }}
            />
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
