import { List, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { 
  exchangeAccessCodeForAuthTokens,
  exchangeNpssoForAccessCode,
  getUserTitles,
  getTitleTrophies,
  getProfileFromUserName
} from "psn-api";

interface Trophy {
  trophyId: number;
  trophyHidden: boolean;
  earned: boolean;
  earnedDateTime?: string;
  trophyType: string;
  trophyName: string;
  trophyDetail: string;
  trophyIconUrl: string;
  trophyRare: number;
  trophyEarnedRate: string;
}

interface Game {
  npCommunicationId: string;
  trophyTitleName: string;
  trophyTitleIconUrl: string;
  trophyTitlePlatform: string;
  hasTrophyGroups: boolean;
  definedTrophies: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  earnedTrophies: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  hiddenFlag: boolean;
  progress: number;
  earnedDateTime: string;
  lastUpdatedDateTime: string;
}

export default function GetTrophy() {
  const [games, setGames] = useState<Game[]>([]);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string>("");

  // Real access token - replace with your actual token
  const ACCESS_TOKEN = "333k7AX61G3C9gyZzKQu0RixsDTIBbaDdfQzZZSmTqlOUaAjS4Vi0e1KCq68EnI4";

  useEffect(() => {
    loadUserGames();
  }, []);

  const loadUserGames = async () => {
    try {
      setIsLoading(true);
      
      // Use real PSN API call
      const accessCode = await exchangeNpssoForAccessCode(ACCESS_TOKEN);
      const authorization = await exchangeAccessCodeForAuthTokens(accessCode);

      // Get user profile for basic info (optional)
      const profile = await getProfileFromUserName(authorization, 'me');
      console.log("User Profile:", profile);

      // Get user games data using getUserTitles
      const userTitlesResponse = await getUserTitles(authorization, "me");
      console.log("Games Data:", userTitlesResponse);
      
      // Map API response to our Game interface
      const gamesData: Game[] = userTitlesResponse.trophyTitles.map((title: any) => ({
        npCommunicationId: title.npCommunicationId,
        trophyTitleName: title.trophyTitleName,
        trophyTitleIconUrl: title.trophyTitleIconUrl,
        trophyTitlePlatform: title.trophyTitlePlatform,
        hasTrophyGroups: title.hasTrophyGroups,
        definedTrophies: {
          bronze: title.definedTrophies.bronze,
          silver: title.definedTrophies.silver,
          gold: title.definedTrophies.gold,
          platinum: title.definedTrophies.platinum
        },
        earnedTrophies: {
          bronze: title.earnedTrophies.bronze,
          silver: title.earnedTrophies.silver,
          gold: title.earnedTrophies.gold,
          platinum: title.earnedTrophies.platinum
        },
        hiddenFlag: title.hiddenFlag,
        progress: title.progress,
        earnedDateTime: title.earnedDateTime,
        lastUpdatedDateTime: title.lastUpdatedDateTime
      }));
      
      setGames(gamesData);
      setAccessToken(authorization.accessToken);
      
    } catch (error) {
      console.error("Error loading games:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load PSN games. Please check your access token."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadGameTrophies = async (gameId: string, gameName: string) => {
    try {
      setIsLoading(true);
      setSelectedGame(gameId);
      
      // Use real PSN API call
      const accessCode = await exchangeNpssoForAccessCode(ACCESS_TOKEN);
      const authorization = await exchangeAccessCodeForAuthTokens(accessCode);
      
      const response = await getTitleTrophies(
        authorization, 
        gameId,
        "all",
      );
      console.log("Trophies Data:", response);
      
      // Map API response to our Trophy interface
      const trophiesData: Trophy[] = response.trophies.map((trophy: any) => ({
        trophyId: trophy.trophyId,
        trophyHidden: trophy.trophyHidden,
        earned: trophy.earned,
        earnedDateTime: trophy.earnedDateTime,
        trophyType: trophy.trophyType,
        trophyName: trophy.trophyName,
        trophyDetail: trophy.trophyDetail,
        trophyIconUrl: trophy.trophyIconUrl,
        trophyRare: trophy.trophyRare,
        trophyEarnedRate: trophy.trophyEarnedRate
      }));
      
      setTrophies(trophiesData);
      
    } catch (error) {
      console.error("Error loading trophies:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: `Failed to load trophies for ${gameName}. Please check your access token.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTrophyIcon = (trophyType: string) => {
    switch (trophyType) {
      case "platinum": return "platinum.png";
      case "gold": return "gold.png";
      case "silver": return "silver.png";
      case "bronze": return "bronze.png";
      default: return "gold.png";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not earned";
    return new Date(dateString).toLocaleDateString();
  };

  if (selectedGame && trophies.length > 0) {
    return (
      <List isLoading={isLoading} navigationTitle="Trophies">
        {trophies.map((trophy) => (
          <List.Item
            key={trophy.trophyId}
            icon={getTrophyIcon(trophy.trophyType)}
            title={trophy.trophyName}
            subtitle={trophy.trophyDetail}
            accessories={[
              { text: trophy.earned ? "✅ Earned" : "⏳ Not Earned" },
              { text: trophy.trophyEarnedRate }
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="Back to Games"
                  onAction={() => {
                    setSelectedGame(null);
                    setTrophies([]);
                  }}
                />
              </ActionPanel>
            }
          />
        ))}
      </List>
    );
  }

  return (
    <List isLoading={isLoading} navigationTitle="PSN Games">
      {games.map((game) => (
        <List.Item
          key={game.npCommunicationId}
          icon={game.trophyTitleIconUrl}
          title={game.trophyTitleName}
          subtitle={`${game.trophyTitlePlatform} • ${game.progress}% Complete`}
          accessories={[
            {text:`${game.earnedTrophies.platinum}`, icon:"platinum.png"},
            {text:`${game.earnedTrophies.gold}`, icon:"gold.png"},
            {text:`${game.earnedTrophies.silver}`, icon:"silver.png"},
            {text:`${game.earnedTrophies.bronze}`, icon:"bronze.png"},
          ]}
          actions={
            <ActionPanel>
              <Action
                title="View Trophies"
                onAction={() => loadGameTrophies(game.npCommunicationId, game.trophyTitleName)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}