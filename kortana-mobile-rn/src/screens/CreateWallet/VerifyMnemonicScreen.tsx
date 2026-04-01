// src/screens/CreateWallet/VerifyMnemonicScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@theme';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from '@components/atoms/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export const VerifyMnemonicScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { mnemonic } = route.params;
  const mnemonicList = mnemonic.split(' ');

  const [shuffledMnemonic, setShuffledMnemonic] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Shuffle the mnemonic words
    const shuffled = [...mnemonicList].sort(() => Math.random() - 0.5);
    setShuffledMnemonic(shuffled);
  }, []);

  const handleWordPress = (word: string) => {
    // If word is already selected, remove it
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      // Otherwise add it
      setSelectedWords([...selectedWords, word]);
    }
    ReactNativeHapticFeedback.trigger('impactLight');
  };

  useEffect(() => {
    // Check if the selected words match the original mnemonic in order
    if (selectedWords.length === mnemonicList.length) {
      const isCorrect = selectedWords.every((word, index) => word === mnemonicList[index]);
      setIsValid(isCorrect);
      if (!isCorrect) {
          // Alert.alert('Verification Failed', 'The words are not in the correct order. Please try again.');
          // Resetting selection if wrong sequence? Or just let user try to fix. 
          // For now just show error state.
      }
    } else {
      setIsValid(false);
    }
  }, [selectedWords]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={Colors.gradientDark} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Confirm Seed Phrase</Text>
          <Text style={styles.subtitle}>
            Select each word in the correct order to prove you have backed them up correctly.
          </Text>

          <View style={styles.selectedBox}>
            {selectedWords.length === 0 && (
                <Text style={styles.placeholderText}>Tap words below in order...</Text>
            )}
            <View style={styles.selectedGrid}>
              {selectedWords.map((word, index) => (
                <View key={index} style={styles.selectedCell}>
                  <Text style={styles.wordText}>{word}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.shuffledGrid}>
            {shuffledMnemonic.map((word, index) => {
              const isSelected = selectedWords.includes(word);
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.wordChip, isSelected && styles.wordChipSelected]}
                  onPress={() => handleWordPress(word)}
                  disabled={isSelected}
                >
                  <Text style={[styles.wordChipText, isSelected && styles.wordChipTextSelected]}>
                    {word}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button 
            title="Confirm & Continue" 
            disabled={!isValid}
            onPress={() => navigation.navigate('SetPin', { mnemonic })}
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
  scrollContent: {
    padding: Spacing['2xl'],
    paddingTop: 80,
  },
  title: {
    color: Colors.white,
    fontFamily: Typography.fontDisplay,
    fontSize: Typography['3xl'],
    fontWeight: Typography.bold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.grey300,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  selectedBox: {
    minHeight: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: Spacing.md,
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  placeholderText: {
    color: Colors.grey500,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    textAlign: 'center',
  },
  selectedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedCell: {
    backgroundColor: Colors.electricBlue,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    margin: 4,
  },
  wordText: {
    color: Colors.white,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  shuffledGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  wordChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    margin: 6,
  },
  wordChipSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  wordChipText: {
    color: Colors.white,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
  },
  wordChipTextSelected: {
    color: Colors.grey600,
  },
  footer: {
    padding: Spacing['2xl'],
    paddingBottom: 40,
  },
});
