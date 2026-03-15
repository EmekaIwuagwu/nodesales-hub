import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../theme';
import { Text } from '../../components/atoms/Typography';
import { Button } from '../../components/atoms/Button';
import { generateMnemonic } from '../../services/blockchain/wallet';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/types';

export const CreateWalletScreen = () => {
    const [mnemonic, setMnemonic] = useState('');
    const [isRevealed, setIsRevealed] = useState(false);
    const navigation = useNavigation<StackNavigationProp<OnboardingStackParamList>>();

    useEffect(() => {
        setMnemonic(generateMnemonic());
    }, []);

    const words = mnemonic.split(' ');

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text variant="headingLg">Create Wallet</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progress, { width: '33%' }]} />
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <Text variant="bodyMd" color={theme.colors.warning}>
                        ⚠️ Your Secret Recovery Phrase is the ONLY way to recover your wallet. Store it offline.
                    </Text>
                </View>

                <View style={styles.grid}>
                    {words.map((word, index) => (
                        <View key={index} style={styles.wordCell}>
                            <Text variant="monoSm" style={styles.wordNumber}>{index + 1}</Text>
                            <Text variant="monoMd" style={[styles.wordText, !isRevealed ? styles.blurred : {}]}>
                                {isRevealed ? word : '•••••'}
                            </Text>
                        </View>
                    ))}

                    {!isRevealed && (
                        <TouchableOpacity
                            style={styles.revealOverlay}
                            onPress={() => setIsRevealed(true)}
                        >
                            <Text variant="bodyMd" style={styles.revealText}>Tap to Reveal</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.footer}>
                    <Button
                        title="I've Saved My Phrase. Continue"
                        variant="primary"
                        size="lg"
                        onPress={() => navigation.navigate('SeedPhraseVerify', { mnemonic })}
                        disabled={!isRevealed}
                    />
                    <Button
                        title="Refresh Phrase"
                        variant="ghost"
                        size="md"
                        onPress={() => {
                            setMnemonic(generateMnemonic());
                            setIsRevealed(false);
                        }}
                        style={styles.refreshBtn}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.abyssNavy,
    },
    content: {
        padding: theme.spacing.space6,
    },
    header: {
        marginBottom: theme.spacing.space8,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        marginTop: theme.spacing.space4,
    },
    progress: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 2,
    },
    infoCard: {
        backgroundColor: 'rgba(255, 184, 0, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 184, 0, 0.2)',
        padding: theme.spacing.space4,
        borderRadius: theme.radius.md,
        marginBottom: theme.spacing.space8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.space3,
        justifyContent: 'center',
        marginBottom: theme.spacing.space10,
        position: 'relative',
    },
    wordCell: {
        width: '30%',
        height: 48,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: theme.radius.sm,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.space3,
        borderWidth: 1,
        borderColor: 'rgba(0, 102, 255, 0.1)',
    },
    wordNumber: {
        color: 'rgba(255, 255, 255, 0.3)',
        marginRight: theme.spacing.space2,
    },
    wordText: {
        color: theme.colors.white,
    },
    blurred: {
        opacity: 0.5,
    },
    revealOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(1, 8, 23, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.radius.md,
        backdropFilter: 'blur(10px)',
    } as any,
    revealText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    footer: {
        gap: theme.spacing.space4,
    },
    refreshBtn: {
        marginTop: theme.spacing.space2,
    },
});
