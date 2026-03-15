import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Text } from '../../components/atoms/Typography';
import { BalanceCard } from '../../components/organisms/BalanceCard';
import { TokenRow } from '../../components/molecules/TokenRow';
import { Icon } from '../../components/atoms/Icon';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWallet } from '../../hooks/useWallet';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Mock data for initial view
const MOCK_TOKENS = [
    {
        id: '1',
        symbol: 'KRTN',
        name: 'Kortana',
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', // Replace with KRTN icon
        balance: '1,250.00',
        valueUsd: '2,845.50',
        priceUsd: '2.27',
        change24h: 5.24,
    },
    {
        id: '2',
        symbol: 'BNB',
        name: 'BNB',
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png',
        balance: '0.45',
        valueUsd: '272.15',
        priceUsd: '604.78',
        change24h: -1.12,
    },
    {
        id: '3',
        symbol: 'USDT',
        name: 'Tether',
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
        balance: '500.00',
        valueUsd: '500.00',
        priceUsd: '1.00',
        change24h: 0.01,
    },
];

const MOCK_CHART_DATA = [10, 15, 8, 12, 18, 14, 25, 20, 35, 30, 45, 40, 55];

export const HomeScreen = () => {
    const { balance, address, refresh, loading, activeNetwork } = useWallet();
    const navigation = useNavigation<any>();

    const onRefresh = React.useCallback(() => {
        refresh();
    }, [refresh]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.abyssNavy, '#010817']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.profileBtn}>
                        <View style={styles.avatar}>
                            <Text variant="bodySm" style={styles.avatarText}>
                                {address ? address.slice(2, 4).toUpperCase() : 'W'}
                            </Text>
                        </View>
                        <View>
                            <Text variant="monoSm" color={theme.colors.slate400}>
                                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Loading...'}
                            </Text>
                            <Text variant="headingSm" style={styles.walletName}>Kortana Wallet</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconBtn}>
                        <Icon name="bell" size={24} color={theme.colors.white} />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
            >
                <BalanceCard
                    totalBalance={`$${(Number(balance) * 2.27).toFixed(2)}`}
                    cryptoBalance={`${balance} ${activeNetwork.symbol}`}
                    changePercent={4.8}
                    sparklineData={MOCK_CHART_DATA}
                    onSend={() => navigation.navigate('Send')}
                    onReceive={() => navigation.navigate('Receive')}
                    onSwap={() => navigation.navigate('Swap')}
                    onBuy={() => { }}
                />

                <View style={styles.sectionHeader}>
                    <Text variant="headingMd">Assets</Text>
                    <TouchableOpacity>
                        <Text variant="bodySm" color={theme.colors.primary}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tokenList}>
                    {MOCK_TOKENS.map((token) => (
                        <TokenRow
                            key={token.id}
                            token={token}
                            onPress={() => { }}
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.addTokenBtn}>
                    <Icon name="plus" size={20} color={theme.colors.primary} />
                    <Text variant="bodyMd" color={theme.colors.primary} style={{ marginLeft: 8 }}>
                        Add Custom Token
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.space5,
        paddingVertical: theme.spacing.space3,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.space5,
    },
    profileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.space3,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontWeight: theme.weights.bold as any,
        color: 'white',
    },
    walletName: {
        fontWeight: theme.weights.bold as any,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.error,
        borderWidth: 2,
        borderColor: theme.colors.abyssNavy,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.space6,
        marginBottom: theme.spacing.space2,
    },
    tokenList: {
        marginTop: theme.spacing.space2,
    },
    addTokenBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.space4,
        marginTop: theme.spacing.space6,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: 'rgba(0, 102, 255, 0.2)',
        borderStyle: 'dashed',
    }
});
