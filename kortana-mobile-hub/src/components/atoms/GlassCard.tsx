import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { theme } from '../../theme';

interface Props {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
    variant?: 'dark' | 'light';
    blurAmount?: number;
}

export const GlassCard: React.FC<Props> = ({
    children,
    style,
    variant = 'dark',
    blurAmount = 20
}) => {
    const isDark = variant === 'dark';

    return (
        <View style={[
            styles.container,
            isDark ? styles.darkBorder : styles.lightBorder,
            style
        ]}>
            {Platform.OS === 'ios' ? (
                <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType={isDark ? 'dark' : 'light'}
                    blurAmount={blurAmount}
                    reducedTransparencyFallbackColor={isDark ? theme.colors.abyssNavy : theme.colors.white}
                />
            ) : (
                <View style={[
                    StyleSheet.absoluteFill,
                    {
                        backgroundColor: isDark ? theme.colors.glassBackground : theme.colors.glassLightBackground,
                        borderRadius: theme.radius.lg
                    }
                ]} />
            )}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: theme.radius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        ...theme.shadows.soft,
    },
    darkBorder: {
        borderColor: theme.colors.glassBorder,
    },
    lightBorder: {
        borderColor: theme.colors.glassLightBorder,
    },
    content: {
        padding: theme.spacing.space4,
    },
});
