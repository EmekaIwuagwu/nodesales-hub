// src/screens/Onboarding/OnboardingScreen.tsx
import React, { useState } from 'react';
import { 
  View,
  Text, 
  StyleSheet, 
  Dimensions, 
  FlatList, 
  NativeSyntheticEvent, 
  NativeScrollEvent 
} from 'react-native';
import { Colors, Typography, Spacing } from '@theme';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from '@components/atoms/Button';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Focus on Performance.',
    subtitle: 'Kortana Wallet is optimized for lightning-fast transactions on the Kortana Blockchain.',
    image: '⚡',
  },
  {
    id: '2',
    title: 'Full Self-Custody.',
    subtitle: 'You own your keys. You own your crypto. Safe, secure, and decentralized.',
    image: '🏦',
  },
  {
    id: '3',
    title: 'Infinite Ecosystem.',
    subtitle: 'Access DApps, NFTs, and cross-chain bridges from a single dashboard.',
    image: '🌌',
  },
];

export const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation<any>();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Text style={styles.emoji}>{item.image}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={Colors.gradientDark} style={styles.gradient}>
        <FlatList
          data={SLIDES}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          keyExtractor={(item) => item.id}
        />
        
        <View style={styles.footer}>
          <View style={styles.pagination}>
            {SLIDES.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.dot, 
                  currentIndex === index && styles.activeDot
                ]} 
              />
            ))}
          </View>

          <Button 
            title="Create New Wallet" 
            onPress={() => navigation.navigate('CreateWallet')}
            style={styles.button}
          />
          <Button 
            title="Import Existing Wallet" 
            variant="outline"
            onPress={() => navigation.navigate('ImportWallet')}
            style={styles.button}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  imageContainer: {
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 100,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  title: {
    color: Colors.white,
    fontFamily: Typography.fontDisplay,
    fontSize: Typography['3xl'],
    fontWeight: Typography.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: Colors.grey300,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 60,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing['3xl'],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.grey700,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.electricBlue,
    width: 24,
  },
  button: {
    marginBottom: Spacing.md,
  },
});
