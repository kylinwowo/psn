import { useState, useEffect } from "react";
import { showToast, Toast } from "@raycast/api";
import { getUserTitles } from "psn-api";
import { getValidAuthorization } from "./utils/auth";
import { RecentlyPlayedGrid } from "./components/RecentlyPlayedGrid";
import { Game } from "./types";

export default function RecentlyPlayed() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentlyPlayedGames();
  }, []);

  async function loadRecentlyPlayedGames() {
    let authorization;
    
    try {
      authorization = await getValidAuthorization();
    } catch (authError) {
      // Auth errors are handled in the auth utility, just log here
      console.error("Authentication failed:", authError);
      setIsLoading(false);
      return;
    }
    
    try {
      const userTitles = await getUserTitles(authorization, 'me', {
        offset: 0
      });

      const gamesData: Game[] = userTitles.trophyTitles.map((title: any) => ({
        npCommunicationId: title.npCommunicationId,
        trophyTitleName: title.trophyTitleName,
        trophyTitleIconUrl: title.trophyTitleIconUrl,
        trophyTitlePlatform: title.trophyTitlePlatform,
        hasTrophyGroups: title.hasTrophyGroups,
        definedTrophies: {
          bronze: title.definedTrophies.bronze,
          silver: title.definedTrophies.silver,
          gold: title.definedTrophies.gold,
          platinum: title.definedTrophies.platinum,
        },
        earnedTrophies: {
          bronze: title.earnedTrophies.bronze,
          silver: title.earnedTrophies.silver,
          gold: title.earnedTrophies.gold,
          platinum: title.earnedTrophies.platinum,
        },
        hiddenFlag: title.hiddenFlag,
        progress: title.progress,
        earnedDateTime: title.earnedDateTime,
        lastUpdatedDateTime: title.lastUpdatedDateTime,
      }));
      setGames(gamesData);
      
      setIsLoading(false);
      
    } catch (profileError) {
      console.error("Error fetching recently played games:", profileError);
      
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to fetch games",
        message: "Unable to retrieve your recently played games. Please try again later."
      });
      
      setIsLoading(false);
    }
  }

  return (
    <RecentlyPlayedGrid
      games={games} 
      isLoading={isLoading} 
      onRefresh={loadRecentlyPlayedGames}
    />
  );
}