import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Text } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { ActionButtons } from '../molecules/ActionButtons';
import { Sparkline } from '../molecules/Sparkline';
import { GlassCard } from '../atoms/GlassCard';

interface Props {
    totalBalance: string;
    cryptoBalance: string;
    changePercent: number;
    onSend: () => void;
    onReceive: () => void;
    onSwap: () => void;
    onBuy: () => void;
    sparklineData: number[];
}

export const BalanceCard: React.FC<Props> = ({
    totalBalance,
    cryptoBalance,
    changePercent,
    onSend,
    onReceive,
    onSwap,
    onBuy,
    sparklineData,
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const isPositive = changePercent >= 0;

    const actions = [
        { icon: 'send', label: 'SEND', onPress: onSend },
        { icon: 'receive', label: 'RECEIVE', onPress: onReceive },
        { icon: 'swap', label: 'SWAP', onPress: onSwap },
        { icon: 'buy', label: 'BUY', onPress: onBuy },
    ];

    return (
        <GlassCard style={styles.card}>
            <View style={styles.header}>
                <View>
                    <Text variant="bodySm" color={theme.colors.crystalBlue} style={styles.label}>
                        Total Balance
                    </Text>
                    <View style={styles.balanceRow}>
                        <Text variant="displayXl" style={styles.balance}>
                            {isVisible ? totalBalance : '••••••••'}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setIsVisible(!isVisible)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Icon
                                name={isVisible ? 'eye' : 'eye-off'}
                                size={20}
                                color={theme.colors.crystalBlue}
                                strokeWidth={1.5}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text variant="bodyLg" color={theme.colors.crystalBlue}>
                        {isVisible ? cryptoBalance : '•••• KRTN'}
                    </Text>
                </View>

                <View style={[
                    styles.changeBadge,
                    { backgroundColor: isPositive ? 'rgba(0, 212, 163, 0.1)' : 'rgba(255, 59, 92, 0.1)' }
                ]}>
                    <Text variant="bodySm" color={isPositive ? theme.colors.success : theme.colors.error}>
                        {isPositive ? '▲' : '▼'} {Math.abs(changePercent)}%
                    </Text>
                </View>
            </View>

            <View style={styles.chartWrapper}>
                <Sparkline
                    data={sparklineData}
                    width={320}
                    height={60}
                    color={isPositive ? theme.colors.success : theme.colors.error}
                />
            </View>

            <View style={styles.actionsWrapper}>
                <ActionButtons actions={actions} />
            </View>
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: theme.spacing.space5,
        marginVertical: theme.spacing.space4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.space4,
    },
    label: {
        marginBottom: theme.spacing.space1,
        opacity: 0.8,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.space3,
        marginBottom: theme.spacing.space1,
    },
    balance: {
        letterSpacing: -1,
    },
    changeBadge: {
        paddingHorizontal: theme.spacing.space3,
        paddingVertical: theme.spacing.space1,
        borderRadius: theme.radius.full,
    },
    chartWrapper: {
        alignItems: 'center',
        marginVertical: theme.spacing.space4,
    },
    actionsWrapper: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        marginTop: theme.spacing.space2,
    },
});
