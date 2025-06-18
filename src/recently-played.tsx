import { useState, useEffect } from "react";
import { showToast, Toast } from "@raycast/api";
import { getUserTitles } from "psn-api";
import { getValidAuthorization } from "./utils/auth";
import { RecentlyPlayedGrid } from "./components/RecentlyPlayedGrid";
import { GameTitle } from "./types";

export default function RecentlyPlayed() {
  const [games, setGames] = useState<GameTitle[]>([]);
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
      
      if (userTitles && userTitles.trophyTitles) {
        setGames(userTitles.trophyTitles.map(game => ({
          titleId: game.npCommunicationId || '',
          name: game.trophyTitleName || '',
          imageUrl: game.trophyTitleIconUrl || '',
        })));
      }
      
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