import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../theme';
import { Text } from '../../components/atoms/Typography';
import { Button } from '../../components/atoms/Button';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/types';

export const SeedPhraseVerifyScreen = () => {
    const navigation = useNavigation<StackNavigationProp<OnboardingStackParamList>>();
    const route = useRoute<RouteProp<OnboardingStackParamList, 'SeedPhraseVerify'>>();
    const { mnemonic } = route.params;

    const originalWords = mnemonic.split(' ');
    const [shuffledWords, setShuffledWords] = useState<string[]>([]);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [errorIndex, setErrorIndex] = useState<number | null>(null);

    useEffect(() => {
        setShuffledWords([...originalWords].sort(() => Math.random() - 0.5));
    }, []);

    const handleSelectWord = (word: string) => {
        const nextIndex = selectedWords.length;
        if (originalWords[nextIndex] === word) {
            setSelectedWords([...selectedWords, word]);
            setShuffledWords(shuffledWords.filter((w, i) => i !== shuffledWords.indexOf(word)));
            setErrorIndex(null);
        } else {
            setErrorIndex(nextIndex);
            setTimeout(() => setErrorIndex(null), 1000);
        }
    };

    const isComplete = selectedWords.length === originalWords.length;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text variant="headingLg">Verify Phrase</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progress, { width: '66%' }]} />
                    </View>
                </View>

                <Text variant="bodyMd" style={styles.instruction}>
                    Select each word in the correct order.
                </Text>

                <View style={[styles.grid, errorIndex !== null && styles.errorGrid]}>
                    {Array.from({ length: 12 }).map((_, index) => (
                        <View key={index} style={[
                            styles.wordCell,
                            selectedWords[index] && styles.filledCell,
                            errorIndex === index && styles.errorCell
                        ]}>
                            <Text variant="monoSm" style={styles.wordNumber}>{index + 1}</Text>
                            <Text variant="monoMd" style={styles.wordText}>
                                {selectedWords[index] || ''}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.chipsContainer}>
                    {shuffledWords.map((word, index) => (
                        <TouchableOpacity
                            key={`${word}-${index}`}
                            style={styles.chip}
                            onPress={() => handleSelectWord(word)}
                        >
                            <Text variant="bodyMd">{word}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Complete Setup"
                        variant="primary"
                        size="lg"
                        onPress={() => navigation.navigate('SetPin', { mnemonic, isImport: false })}
                        disabled={!isComplete}
                    />
                    <Button
                        title="Reset"
                        variant="ghost"
                        size="md"
                        onPress={() => {
                            setSelectedWords([]);
                            setShuffledWords([...originalWords].sort(() => Math.random() - 0.5));
                        }}
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
    instruction: {
        marginBottom: theme.spacing.space6,
        color: theme.colors.crystalBlue,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.space3,
        justifyContent: 'center',
        marginBottom: theme.spacing.space8,
    },
    errorGrid: {
        // Shaking would be better with Reanimated
    },
    wordCell: {
        width: '30%',
        height: 48,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: theme.radius.sm,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.space3,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderStyle: 'dashed',
    },
    filledCell: {
        backgroundColor: 'rgba(0, 102, 255, 0.1)',
        borderColor: theme.colors.primary,
        borderStyle: 'solid',
    },
    errorCell: {
        borderColor: theme.colors.error,
        backgroundColor: 'rgba(255, 59, 92, 0.1)',
    },
    wordNumber: {
        color: 'rgba(255, 255, 255, 0.3)',
        marginRight: theme.spacing.space2,
    },
    wordText: {
        color: theme.colors.white,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.space2,
        justifyContent: 'center',
        marginBottom: theme.spacing.space10,
    },
    chip: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: theme.spacing.space4,
        paddingVertical: theme.spacing.space2,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    footer: {
        gap: theme.spacing.space4,
    },
});
