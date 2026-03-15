import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../theme';
import { Text } from './Typography';

interface Props {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'ghost' | 'error';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle | ViewStyle[];
}

export const Button: React.FC<Props> = ({
    onPress,
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    style,
}) => {
    const isGhost = variant === 'ghost';
    const isPrimary = variant === 'primary';

    const containerStyle: any[] = [
        styles.base,
        styles[size],
        fullWidth ? styles.fullWidth : null,
        isGhost ? styles.ghost : null,
        variant === 'secondary' ? styles.secondary : null,
        variant === 'error' ? styles.error : null,
        disabled ? styles.disabled : null,
        style,
    ];

    const renderContent = () => (
        loading ? (
            <ActivityIndicator color={isGhost ? theme.colors.primary : theme.colors.white} />
        ) : (
            <Text
                variant={size === 'lg' ? 'bodyLg' : 'bodyMd'}
                style={[
                    styles.text,
                    isGhost ? { color: theme.colors.primary } : null,
                    variant === 'secondary' ? { color: theme.colors.primary } : null,
                    style as any,
                ]}
            >
                {title}
            </Text>
        )
    );

    if (isPrimary && !disabled) {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                activeOpacity={0.8}
                style={style}
            >
                <LinearGradient
                    colors={theme.gradients.cta}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                        styles.base,
                        styles[size],
                        styles.primaryShadow,
                        fullWidth ? styles.fullWidth : null
                    ]}
                >
                    {renderContent()}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            style={containerStyle}
        >
            {renderContent()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: theme.radius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullWidth: {
        width: '100%',
    },
    sm: {
        height: 36,
        paddingHorizontal: theme.spacing.space4,
    },
    md: {
        height: 48,
        paddingHorizontal: theme.spacing.space6,
    },
    lg: {
        height: 56,
        paddingHorizontal: theme.spacing.space8,
    },
    ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    secondary: {
        backgroundColor: 'rgba(0, 102, 255, 0.1)',
    },
    error: {
        backgroundColor: theme.colors.error,
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: theme.colors.charcoalBlue,
    },
    text: {
        fontWeight: theme.weights.bold as any,
        color: theme.colors.white,
    },
    primaryShadow: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
});
