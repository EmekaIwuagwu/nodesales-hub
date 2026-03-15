import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { theme } from '../../theme';
import { Text } from '../atoms/Typography';
import { Token } from '../../types/token.types';

interface Props {
    token: Token;
    onPress: () => void;
}

export const TokenRow: React.FC<Props> = ({ token, onPress }) => {
    const isPositive = token.change24h >= 0;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.left}>
                <View style={styles.iconWrapper}>
                    <FastImage
                        source={{ uri: token.icon }}
                        style={styles.icon}
                        defaultSource={require('../../assets/images/token_placeholder.png')}
                    />
                </View>
                <View>
                    <Text variant="headingSm" style={styles.name}>{token.name}</Text>
                    <Text variant="bodySm" color={theme.colors.slate400}>
                        {token.balance} {token.symbol}
                    </Text>
                </View>
            </View>

            <View style={styles.right}>
                <Text variant="headingSm" align="right" style={styles.value}>
                    ${token.valueUsd}
                </Text>
                <Text variant="bodySm" align="right" color={isPositive ? theme.colors.success : theme.colors.error}>
                    {isPositive ? '+' : ''}{token.change24h}%
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
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    icon: {
        width: '100%',
        height: '100%',
    },
    name: {
        fontWeight: theme.weights.semibold as any,
        marginBottom: 2,
    },
    value: {
        fontWeight: theme.weights.semibold as any,
        marginBottom: 2,
    },
});
