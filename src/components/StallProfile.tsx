import React, { useState, useEffect } from "react";
import { useStallProfile } from "@/hooks/useStallProfile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, X, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface StallProfileProps {
  stallId: string;
  editable?: boolean;
  onProfileUpdated?: () => void;
}

const StallProfile: React.FC<StallProfileProps> = ({
  stallId,
  editable = true,
  onProfileUpdated,
}) => {
  const { stall, loading, error, updateStallProfile } =
    useStallProfile(stallId);

  const [editMode, setEditMode] = useState(false);
  const [stallName, setStallName] = useState("");
  const [stallAddress, setStallAddress] = useState("");
  const [stallDescription, setStallDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (stall) {
      setStallName(stall.stallName || "");
      setStallAddress(stall.stallAddress || "");
      setStallDescription(stall.stallDescription || "");
    }
  }, [stall]);

  const handleSave = async () => {
    if (!stallName.trim()) {
      toast({
        title: "Error",
        description: "Stall name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const success = await updateStallProfile({
        stallName,
        stallAddress,
        stallDescription,
      });

      if (success) {
        toast({
          title: "Success",
          description: "Stall profile updated successfully",
        });
        setEditMode(false);
        if (onProfileUpdated) {
          onProfileUpdated();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to update stall profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stall profile",
        variant: "destructive",
      });
      console.error("Failed to update stall profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setStallName(stall?.stallName || "");
    setStallAddress(stall?.stallAddress || "");
    setStallDescription(stall?.stallDescription || "");
    setEditMode(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive p-4">
            <p>Error loading stall profile</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Stall Profile</CardTitle>
          {editable && !editMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
        <CardDescription>
          {editMode
            ? "Edit your stall information"
            : "Manage your stall's public information"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {editMode ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stallName">Stall Name</Label>
              <Input
                id="stallName"
                value={stallName}
                onChange={(e) => setStallName(e.target.value)}
                placeholder="Enter stall name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stallAddress">Stall Address</Label>
              <Input
                id="stallAddress"
                value={stallAddress}
                onChange={(e) => setStallAddress(e.target.value)}
                placeholder="Enter stall address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stallDescription">Stall Description</Label>
              <Textarea
                id="stallDescription"
                value={stallDescription}
                onChange={(e) => setStallDescription(e.target.value)}
                placeholder="Enter a brief description of your stall"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Stall Name
              </h3>
              <p className="mt-1">{stall?.stallName || "Not set"}</p>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Stall Address
              </h3>
              <p className="mt-1">{stall?.stallAddress || "Not set"}</p>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Stall Description
              </h3>
              <p className="mt-1">{stall?.stallDescription || "Not set"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StallProfile;
