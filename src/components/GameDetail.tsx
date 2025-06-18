import { List, ActionPanel, Action, Icon, useNavigation } from "@raycast/api";
import { useState, useEffect } from "react";
import { getTitleTrophies, getUserTrophiesEarnedForTitle } from "psn-api";
import { getValidAuthorization } from "../utils/auth";
import { Game, Trophy } from "../types";
import { Color } from "@raycast/api";

interface GameDetailProps {
  game: Game;
}

export function GameDetail({ game }: GameDetailProps) {
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { pop } = useNavigation();

  useEffect(() => {
    loadTrophies();
  }, []);

  async function loadTrophies() {
    try {
      const authorization = await getValidAuthorization();
      const trophyData = await getTitleTrophies(authorization, game.npCommunicationId, 'all');
      const userTrophyData = await getUserTrophiesEarnedForTitle(authorization, 'me', game.npCommunicationId, 'all');
      
      if (trophyData && trophyData.trophies) {
        const trophiesData: Trophy[] = trophyData.trophies.map((trophy: any) => {
          // Find corresponding user trophy data
          const userTrophy = userTrophyData?.trophies?.find(
            (userTrophy: any) => userTrophy.trophyId === trophy.trophyId
          );
          
          return {
            trophyId: trophy.trophyId,
            trophyHidden: trophy.trophyHidden,
            earned: userTrophy?.earned || false,
            earnedDateTime: userTrophy?.earnedDateTime,
            trophyType: trophy.trophyType,
            trophyName: trophy.trophyName,
            trophyDetail: trophy.trophyDetail,
            trophyIconUrl: trophy.trophyIconUrl,
            trophyRare: trophy.trophyRare,
            trophyEarnedRate: trophy.trophyEarnedRate,
          };
        });

        setTrophies(trophiesData);
      }
    } catch (error) {
      console.error("Error fetching trophies:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function getTrophyIcon(trophyType: string): string {
    switch (trophyType.toLowerCase()) {
      case 'platinum':
        return '../assets/platinum.png';
      case 'gold':
        return '../assets/gold.png';
      case 'silver':
        return '../assets/silver.png';
      case 'bronze':
        return '../assets/bronze.png';
      default:
        return Icon.Trophy;
    }
  }

  function getTrophyCount(type: string): number {
    return trophies.filter(trophy => trophy.trophyType.toLowerCase() === type.toLowerCase() && trophy.earned).length;
  }

  function getTotalTrophyCount(type: string): number {
    return trophies.filter(trophy => trophy.trophyType.toLowerCase() === type.toLowerCase()).length;
  }

  const platinumCount = getTrophyCount('platinum');
  const goldCount = getTrophyCount('gold');
  const silverCount = getTrophyCount('silver');
  const bronzeCount = getTrophyCount('bronze');
  const totalEarned = platinumCount + goldCount + silverCount + bronzeCount;
  const totalTrophies = trophies.length;
  const progress = totalTrophies > 0 ? Math.round((totalEarned / totalTrophies) * 100) : 0;

  return (
    <List isLoading={isLoading} navigationTitle={game.trophyTitleName}>
      <List.Section title="Game Information">
        <List.Item
          icon={game.trophyTitleIconUrl || Icon.GameController}
          title={game.trophyTitleName}
          subtitle={`${game.trophyTitlePlatform} • ${game.progress}% Complete`}
          accessories={[
            { text: `${game.earnedTrophies.platinum}`, icon: "platinum.png" },
            { text: `${game.earnedTrophies.gold}`, icon: "gold.png" },
            { text: `${game.earnedTrophies.silver}`, icon: "silver.png" },
            { text: `${game.earnedTrophies.bronze}`, icon: "bronze.png" },
          ]}
          actions={
            <ActionPanel>
              <Action title="Back" icon={Icon.ArrowLeft} onAction={pop} />
            </ActionPanel>
          }
        />
      </List.Section>
      
      <List.Section title="Trophies">
        {trophies.map((trophy) => (
          <List.Item
            key={trophy.trophyId}
            icon={getTrophyIcon(trophy.trophyType)}
            title={trophy.trophyName}
            subtitle={trophy.trophyDetail}
            accessories={[
              { 
                icon: {
                  source: trophy.earned ? Icon.CheckCircle : Icon.Circle,
                  tintColor: trophy.earned ? Color.Green : Color.SecondaryText
                }
              },
            ]}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard
                  title="Copy Trophy Name"
                  content={trophy.trophyName}
                />
                <Action title="Back" icon={Icon.ArrowLeft} onAction={pop} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}