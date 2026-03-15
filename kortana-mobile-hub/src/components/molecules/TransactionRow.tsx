import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Text } from '../atoms/Typography';
import { Icon, IconName } from '../atoms/Icon';
import { Transaction } from '../../types/transaction.types';

interface Props {
    transaction: Transaction;
    onPress: () => void;
}

export const TransactionRow: React.FC<Props> = ({ transaction, onPress }) => {
    const isReceive = transaction.type === 'receive';
    const isFailed = transaction.status === 'failed';
    const isPending = transaction.status === 'pending';

    const getIcon = (): IconName => {
        switch (transaction.type) {
            case 'receive': return 'receive';
            case 'send': return 'send';
            case 'swap': return 'swap';
            default: return 'external-link';
        }
    };

    const getRelativeTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.left}>
                <View style={[
                    styles.iconWrapper,
                    { backgroundColor: isReceive ? 'rgba(0, 212, 163, 0.1)' : 'rgba(255, 255, 255, 0.05)' }
                ]}>
                    <Icon
                        name={getIcon()}
                        size={20}
                        color={isReceive ? theme.colors.success : theme.colors.white}
                        strokeWidth={1.5}
                    />
                </View>
                <View>
                    <Text variant="headingSm" style={styles.type}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Text>
                    <Text variant="bodySm" color={theme.colors.slate400}>
                        {isPending ? 'Pending...' : getRelativeTime(transaction.timestamp)}
                    </Text>
                </View>
            </View>

            <View style={styles.right}>
                <Text variant="headingSm" align="right" style={[
                    styles.amount,
                    { color: isReceive ? theme.colors.success : theme.colors.white }
                ]}>
                    {isReceive ? '+' : '-'}{transaction.amount} {transaction.symbol}
                </Text>
                <Text variant="bodySm" align="right" color={isFailed ? theme.colors.error : theme.colors.slate400}>
                    {isFailed ? 'Failed' : isReceive ? 'From Wallet' : 'To ' + transaction.to.slice(0, 6) + '...'}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.space4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.space4,
    },
    right: {
        alignItems: 'flex-end',
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    type: {
        fontWeight: theme.weights.semiBold as any,
        marginBottom: 2,
    },
    amount: {
        fontWeight: theme.weights.semiBold as any,
        marginBottom: 2,
    }
});
