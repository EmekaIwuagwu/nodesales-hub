import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { theme } from '../../theme';
import { Text } from '../../components/atoms/Typography';
import { Icon } from '../../components/atoms/Icon';
import { useWalletStore } from '../../store/walletStore';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { verifyPin } from '../../services/encryption';

export const AuthScreen = () => {
    const [pin, setPin] = useState('');
    const { unlockWallet } = useWalletStore();
    const [error, setError] = useState(false);
    const shakeAnimation = React.useRef(new Animated.Value(0)).current;

    const onNumberPress = (num: string) => {
        if (pin.length < 6) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 6) {
                handleAuth(newPin);
            }
        }
    };

    const handleAuth = async (enteredPin: string) => {
        const success = await unlockWallet(enteredPin);
        if (!success) {
            setError(true);
            shake();
            setTimeout(() => {
                setPin('');
                setError(false);
            }, 1000);
        }
    };

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const onDelete = () => {
        setPin(pin.slice(0, -1));
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.abyssNavy, '#010817']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.content}>
                <View style={styles.header}>
                    <Icon name="lock" size={48} color={theme.colors.primary} />
                    <Text variant="headingXl" style={styles.title}>Welcome back</Text>
                    <Text variant="bodyMd" color={theme.colors.slate400}>Enter your PIN to unlock</Text>
                </View>

                <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnimation }] }]}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                pin.length >= i ? styles.dotActive : null,
                                error ? styles.dotError : null
                            ]}
                        />
                    ))}
                </Animated.View>

                <View style={styles.keypad}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <TouchableOpacity
                            key={num}
                            style={styles.key}
                            onPress={() => onNumberPress(num.toString())}
                        >
                            <Text variant="displayLg">{num}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.key} onPress={() => { }}>
                        <Icon name="scan" size={28} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.key} onPress={() => onNumberPress('0')}>
                        <Text variant="displayLg">0</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.key} onPress={onDelete}>
                        <Icon name="chevron-down" size={24} style={{ transform: [{ rotate: '90deg' }] }} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.forgotBtn}>
                    <Text variant="bodySm" color={theme.colors.primary}>Forgot PIN?</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.space10,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.space10,
    },
    title: {
        marginTop: theme.spacing.space4,
        marginBottom: theme.spacing.space2,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: theme.spacing.space4,
        marginBottom: theme.spacing.space12,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    dotActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    dotError: {
        backgroundColor: theme.colors.error,
        borderColor: theme.colors.error,
    },
    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
    },
    key: {
        width: '33%',
        height: 90,
        justifyContent: 'center',
        alignItems: 'center',
    },
    forgotBtn: {
        marginTop: theme.spacing.space10,
        alignItems: 'center',
    }
});
