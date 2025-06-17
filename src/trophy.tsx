import { updateCommandMetadata, showToast, Toast } from "@raycast/api";
import { getProfileFromUserName } from "psn-api";
import { getValidAuthorization } from "./utils/auth";

interface TrophySummary {
  level: number;
  progress: number;
  earnedTrophies: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
}

export default async function Trophy() {
  try {
    // Show loading toast at bottom
    const loadingToast = await showToast({
      style: Toast.Style.Animated,
      title: "Refreshing Trophy..."
    });
    
    // Get valid authorization with automatic token refresh
    const authorization = await getValidAuthorization();
    
    // Get user profile with trophy summary
    const profile = await getProfileFromUserName(authorization, 'me');
    
    if (!profile.profile.trophySummary) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No trophy data found",
        message: "Unable to retrieve trophy information"
      });
      return;
    }
    
    const trophySummary: TrophySummary = profile.profile.trophySummary;
    
    // Format trophy information for command bar display
    const subtitle = `Platinum: ${trophySummary.earnedTrophies.platinum}   Gold: ${trophySummary.earnedTrophies.gold}   Silver: ${trophySummary.earnedTrophies.silver}   Bronze: ${trophySummary.earnedTrophies.bronze}`;
    
    // Update command metadata with final trophy information only
    await updateCommandMetadata({
      subtitle: subtitle
    });
    
    // Show success toast at bottom
    await showToast({
      style: Toast.Style.Success,
      title: "Refreshed Trophy"
    });
    
  } catch (error) {
    console.error("Error fetching trophy data:", error);
    
    // Show error toast at bottom
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to refresh trophy",
      message: "Please check your configuration and try again"
    });
  }
}