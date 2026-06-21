import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { View } from 'react-native';
import { SavedProfileLink } from '../../types/profile';
import { spacing } from '../../theme';
import { ProfileSavedLinkRow } from './ProfileSavedLinkRow';

type Props = {
  links: SavedProfileLink[];
  onReorder: (links: SavedProfileLink[]) => void;
  onToggle: (link: SavedProfileLink, enabled: boolean) => void;
};

export function ProfileSavedLinksList({ links, onReorder, onToggle }: Props) {
  return (
    <DraggableFlatList
      data={links}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      onDragEnd={({ data }) => onReorder(data)}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      renderItem={({ item, drag, isActive }: RenderItemParams<SavedProfileLink>) => (
        <ScaleDecorator>
          <ProfileSavedLinkRow
            link={item}
            onToggle={(enabled) => onToggle(item, enabled)}
            onDrag={drag}
            isDragging={isActive}
          />
        </ScaleDecorator>
      )}
    />
  );
}
