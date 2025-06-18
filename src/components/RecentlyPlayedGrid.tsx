import { Grid, ActionPanel, Action, Icon, List, useNavigation } from "@raycast/api";
import { Game } from "../types";
import { GameDetail } from "./GameDetail";

interface RecentlyPlayedGridProps {
  games: Game[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function RecentlyPlayedGrid({ games, isLoading, onRefresh }: RecentlyPlayedGridProps) {
  const { push } = useNavigation();
  
  // If not loading and no games, show empty state using List
  if (!isLoading && games.length === 0) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.GameController}
          title="No Recent Games"
          description="No recently played games found"
        />
      </List>
    );
  }
  
  return (
    <Grid 
      columns={5} 
      isLoading={isLoading}
      searchBarPlaceholder="Search recently played games..."
    >
      {games.map((game) => {
        return (
          <Grid.Item
            key={game.npCommunicationId}
            content={game.trophyTitleIconUrl || Icon.GameController}
            title={game.trophyTitleName}
            actions={
              <ActionPanel>
                <Action
                  title="View Game Details"
                  icon={Icon.Eye}
                  onAction={() => push(<GameDetail game={game} />)}
                />
                <Action.CopyToClipboard
                  title="Copy Game Name"
                  content={game.trophyTitleName}
                />
                <Action.CopyToClipboard
                  title="Copy Title ID"
                  content={game.npCommunicationId}
                />
                <Action
                  title="Refresh"
                  icon={Icon.ArrowClockwise}
                  onAction={onRefresh}
                  shortcut={{ modifiers: ["cmd"], key: "r" }}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </Grid>
  );
}