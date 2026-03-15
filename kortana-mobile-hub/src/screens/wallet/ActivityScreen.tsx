import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, SectionList } from 'react-native';
import { theme } from '../../theme';
import { Text } from '../../components/atoms/Typography';
import { TransactionRow } from '../../components/molecules/TransactionRow';
import { TransactionDetail } from '../../components/molecules/TransactionDetail';
import { GlassCard } from '../../components/atoms/GlassCard';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Transaction } from '../../types/transaction.types';

// Mock transactions
const MOCK_HISTORY: { title: string; data: Transaction[] }[] = [
    {
        title: 'Today',
        data: [
            {
                id: '1',
                hash: '0xabc...',
                type: 'send',
                status: 'confirmed',
                from: '0x123...',
                to: '0x456...',
                amount: '50.00',
                symbol: 'KRTN',
                timestamp: Date.now() - 3600000,
                chainId: 1234,
            },
            {
                id: '2',
                hash: '0xdef...',
                type: 'receive',
                status: 'confirmed',
                from: '0x789...',
                to: '0x123...',
                amount: '1,200.00',
                symbol: 'KRTN',
                timestamp: Date.now() - 7200000,
                chainId: 1234,
            },
        ]
    },
    {
        title: 'Yesterday',
        data: [
            {
                id: '3',
                hash: '0xghi...',
                type: 'swap',
                status: 'confirmed',
                from: '0x123...',
                to: '0x000...',
                amount: '0.15',
                symbol: 'BNB',
                timestamp: Date.now() - 90000000,
                chainId: 56,
            },
        ]
    },
];

export const ActivityScreen = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 2000);
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.abyssNavy, '#010817']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <Text variant="displayLg">Activity</Text>
                </View>

                <SectionList
                    sections={MOCK_HISTORY}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TransactionRow
                            transaction={item}
                            onPress={() => setSelectedTx(item)}
                        />
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text variant="headingSm" color={theme.colors.slate400} style={styles.sectionTitle}>
                            {title}
                        </Text>
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text color={theme.colors.slate600}>No recent activity</Text>
                        </View>
                    }
                />
            </SafeAreaView>

            <TransactionDetail
                visible={!!selectedTx}
                transaction={selectedTx}
                onClose={() => setSelectedTx(null)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: theme.spacing.space5,
        paddingVertical: theme.spacing.space4,
        marginBottom: theme.spacing.space2,
    },
    sectionTitle: {
        backgroundColor: 'rgba(1, 8, 23, 0.9)',
        paddingHorizontal: theme.spacing.space5,
        paddingVertical: theme.spacing.space3,
        marginTop: theme.spacing.space2,
    },
    listContent: {
        paddingHorizontal: theme.spacing.space5,
        paddingBottom: 120, // Tab bar space
    },
    empty: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
