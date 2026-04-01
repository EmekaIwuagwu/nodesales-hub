// src/screens/Backup/BackupMnemonicScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme';
import { useNavigation } from '@react-navigation/native';
import { KeychainService } from '@services/keychain.service';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export const BackupMnemonicScreen = () => {
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const navigation = useNavigation<any>();

  useEffect(() => {
    loadMnemonic();
  }, []);

  const loadMnemonic = async () => {
    const rawMnemonic = await KeychainService.getMnemonic();
    if (rawMnemonic) {
      setMnemonic(rawMnemonic.split(' '));
    }
  };

  const handleReveal = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy');
    setRevealed(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Recovery Phrase</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Never share your phrase!</Text>
          <Text style={styles.warningText}>
            Anyone with these 12 words can take your assets. Keep them in a safe, offline place.
          </Text>
        </View>

        {!revealed ? (
          <View style={styles.revealOverlay}>
            <Text style={styles.revealTitle}>Tap to reveal phrase</Text>
            <Text style={styles.revealText}>Make sure no one is watching your screen</Text>
            <TouchableOpacity style={styles.revealButton} onPress={handleReveal}>
              <Text style={styles.revealButtonText}>Show Phrase</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {mnemonic.map((word, index) => (
              <View key={index} style={styles.wordBadge}>
                <Text style={styles.wordIndex}>{index + 1}</Text>
                <Text style={styles.wordText}>{word}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.md,
  },
  warningCard: {
    backgroundColor: '#FFF5F5',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#FED7D7',
    marginBottom: Spacing['3xl'],
  },
  warningTitle: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.danger,
    marginBottom: 4,
  },
  warningText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    color: '#C53030',
    lineHeight: 18,
  },
  revealOverlay: {
    height: 300,
    backgroundColor: Colors.offWhite,
    borderRadius: Radius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
    ...Shadow.md,
  },
  revealTitle: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  revealText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    color: Colors.grey500,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: Spacing.xl,
  },
  revealButton: {
    backgroundColor: Colors.electricBlue,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  revealButtonText: {
    color: Colors.white,
    fontFamily: Typography.fontPrimary,
    fontWeight: Typography.bold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wordBadge: {
    width: '48%',
    backgroundColor: Colors.offWhite,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  wordIndex: {
    fontFamily: Typography.fontPrimary,
    fontSize: 10,
    color: Colors.grey400,
    marginRight: 8,
    width: 14,
  },
  wordText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  footer: {
    padding: Spacing['2xl'],
    paddingBottom: 40,
  },
  doneButton: {
    backgroundColor: Colors.offWhite,
    height: 56,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    color: Colors.grey900,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
});
