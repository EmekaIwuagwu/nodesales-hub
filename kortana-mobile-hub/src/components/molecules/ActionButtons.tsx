import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Text } from '../atoms/Typography';
import { Icon, IconName } from '../atoms/Icon';

interface ActionItem {
    icon: IconName;
    label: string;
    onPress: () => void;
}

interface Props {
    actions: ActionItem[];
}

export const ActionButtons: React.FC<Props> = ({ actions }) => {
    return (
        <View style={styles.container}>
            {actions.map((action, index) => (
                <View key={index} style={styles.actionWrapper}>
                    <TouchableOpacity
                        style={styles.circle}
                        onPress={action.onPress}
                        activeOpacity={0.7}
                    >
                        <Icon name={action.icon} size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text variant="bodySm" align="center" style={styles.label}>
                        {action.label}
                    </Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.space4,
        width: '100%',
    },
    actionWrapper: {
        alignItems: 'center',
        gap: theme.spacing.space2,
    },
    circle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0, 102, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 102, 255, 0.2)',
    },
    label: {
        fontWeight: theme.weights.medium as any,
    },
});
