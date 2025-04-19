import { useState, useEffect } from "react";
import { stallAPI, Stall } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface StallProfileState {
  loading: boolean;
  error: string | null;
  stall: Stall | null;
}

export const useStallProfile = (stallID?: string) => {
  const { user } = useAuth();
  const [state, setState] = useState<StallProfileState>({
    loading: true,
    error: null,
    stall: null,
  });

  // Use the provided stallID, then user's stallId, then user's id, then default to "001"
  const effectiveStallID = stallID || user?.stallId || user?.id || "001";

  useEffect(() => {
    const fetchStallProfile = async () => {
      if (!effectiveStallID) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
       
        const stallData = await stallAPI.getStallProfile(effectiveStallID);
  
        setState({
          loading: false,
          error: null,
          stall: stallData,
        });
      } catch (error) {
        console.error("Error fetching stall profile:", error);
        setState({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch stall profile",
          stall: null,
        });
      }
    };

    fetchStallProfile();
  }, [effectiveStallID]);

  const updateStallProfile = async (updateData: {
    stallName?: string;
    stallAddress?: string;
    stallDescription?: string;
  }) => {
    if (!effectiveStallID) {
      throw new Error("No stall ID available");
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await stallAPI.updateStallProfile(effectiveStallID, updateData);

      // Refetch the stall profile to get updated data
      const updatedStall = await stallAPI.getStallProfile(effectiveStallID);

      setState({
        loading: false,
        error: null,
        stall: updatedStall,
      });

      return true;
    } catch (error) {
      console.error("Error updating stall profile:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update stall profile",
      }));

      return false;
    }
  };

  return {
    ...state,
    updateStallProfile,
  };
};
