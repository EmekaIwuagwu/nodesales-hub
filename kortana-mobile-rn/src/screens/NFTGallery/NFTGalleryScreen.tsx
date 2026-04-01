// src/screens/NFTGallery/NFTGalleryScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  TextInput,
  ScrollView
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme';
import { useNavigation } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - Spacing['2xl'] * 2 - Spacing.md) / 2;

const MOCK_NFTS = [
  {
    id: '1',
    name: 'Kortana Genesis #001',
    collection: 'Kortana Founders',
    image: require('@assets/images/nfts/featured.png'),
  },
  {
    id: '2',
    name: 'CyberViper #442',
    collection: 'Cyber Avatars',
    image: require('@assets/images/nfts/avatar.png'),
  },
  {
    id: '3',
    name: 'Liquid Flow #09',
    collection: 'Abstract Motion',
    image: require('@assets/images/nfts/abstract.png'),
  },
];

export const NFTGalleryScreen = () => {
  const navigation = useNavigation<any>();

  // Placeholder for search state and filters
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState(['All', 'Art', 'Gaming', 'Collectibles', 'Photography']);
  const [activeFilter, setActiveFilter] = React.useState('All');

  const renderFilter = (filter: string) => (
    <TouchableOpacity
      key={filter}
      style={[styles.filterBadge, activeFilter === filter && styles.activeFilterBadge]}
      onPress={() => {
        ReactNativeHapticFeedback.trigger('impactLight');
        setActiveFilter(filter);
      }}
    >
      <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
        {filter}
      </Text>
    </TouchableOpacity>
  );

  const renderNFTItem = ({ item }: { item: typeof MOCK_NFTS[0] }) => (
    <TouchableOpacity 
      style={styles.nftCard}
      activeOpacity={0.9}
      onPress={() => {
        ReactNativeHapticFeedback.trigger('impactLight');
        // Navigate to NFT Detail if we have one
      }}
    >
      <Image source={item.image} style={styles.nftImage} />
      <View style={styles.nftInfo}>
        <Text style={styles.collectionText}>{item.collection}</Text>
        <Text style={styles.nftName} numberOfLines={1}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Collectibles</Text>
        <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Search collections..."
                placeholderTextColor={Colors.grey400}
                value={search}
                onChangeText={setSearch}
            />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            {filters.map(renderFilter)}
        </ScrollView>
      </View>

      <FlatList
        data={MOCK_NFTS}
        renderItem={renderNFTItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🖼️</Text>
            <Text style={styles.emptyTitle}>No NFTs found</Text>
            <Text style={styles.emptySubtitle}>Your digital collectibles will appear here</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    color: Colors.grey900,
  },
  title: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: Colors.electricBlue,
    lineHeight: 28,
  },
  searchSection: {
    paddingHorizontal: Spacing['2xl'],
    marginBottom: Spacing.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    color: Colors.grey900,
    padding: 0,
  },
  filtersContainer: {
    flexDirection: 'row',
  },
  filterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.offWhite,
    marginRight: 8,
  },
  activeFilterBadge: {
    backgroundColor: Colors.electricBlue,
  },
  filterText: {
    fontFamily: Typography.fontPrimary,
    fontSize: 12,
    fontWeight: Typography.bold,
    color: Colors.grey500,
  },
  activeFilterText: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  nftCard: {
    width: COLUMN_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.md,
  },
  nftImage: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH,
  },
  nftInfo: {
    padding: Spacing.md,
  },
  collectionText: {
    fontFamily: Typography.fontPrimary,
    fontSize: 10,
    color: Colors.grey500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  nftName: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  emptySubtitle: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    color: Colors.grey500,
    marginTop: 8,
  },
});
