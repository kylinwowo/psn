import { Grid, ActionPanel, Action, Icon, List } from "@raycast/api";
import { GameTitle } from "../types";

interface RecentlyPlayedGridProps {
  games: GameTitle[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function RecentlyPlayedGrid({ games, isLoading, onRefresh }: RecentlyPlayedGridProps) {
  
  // If not loading and no games, show empty state
  if (!isLoading && games.length === 0) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.GameController}
          title="No Recent Games"
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
            key={game.titleId}
            content={game.imageUrl || Icon.GameController}
            title={game.name}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard
                  title="Copy Game Name"
                  content={game.name}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </Grid>
  );
}