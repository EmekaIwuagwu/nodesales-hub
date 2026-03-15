import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Text } from '../../components/atoms/Typography';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { useWalletStore } from '../../store/walletStore';
import { createWalletFromMnemonic } from '../../services/blockchain/wallet';
import { deriveKey, generateSalt, encrypt } from '../../services/keychain/encryption';
import { saveEncryptedMnemonic } from '../../services/keychain/storage';

export const SetPinScreen = () => {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [step, setStep] = useState<'set' | 'confirm'>('set');
    const [error, setError] = useState(false);

    const navigation = useNavigation<StackNavigationProp<OnboardingStackParamList>>();
    const route = useRoute<RouteProp<OnboardingStackParamList, 'SetPin'>>();
    const { mnemonic } = route.params;

    const { addAccount, setHasWallet, setLocked } = useWalletStore();

    const handlePress = (num: string) => {
        setError(false);
        const current = step === 'set' ? pin : confirmPin;
        if (current.length >= 6) return;

        const newVal = current + num;
        if (step === 'set') {
            setPin(newVal);
            if (newVal.length === 6) {
                setTimeout(() => setStep('confirm'), 500);
            }
        } else {
            setConfirmPin(newVal);
            if (newVal.length === 6) {
                if (newVal === pin) {
                    handleComplete(newVal);
                } else {
                    setError(true);
                    setConfirmPin('');
                    setTimeout(() => setError(false), 1000);
                }
            }
        }
    };

    const handleComplete = async (finalPin: string) => {
        try {
            // 1. Create initial account
            const walletData = createWalletFromMnemonic(mnemonic, 0);

            // 2. Encrypt and save mnemonic
            const salt = generateSalt();
            const encryptionKey = deriveKey(finalPin, salt);
            const encrypted = encrypt(mnemonic, encryptionKey);
            await saveEncryptedMnemonic(encrypted, salt);

            // 3. Update Store
            addAccount({
                address: walletData.address,
                name: 'Main Account',
                index: 0,
            });
            setHasWallet(true);
            setLocked(false);

            // 4. Navigate to Main Auth or Home
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                })
            );
        } catch (e) {
            console.error('Failed to setup wallet:', e);
        }
    };

    const renderDots = () => {
        const current = step === 'set' ? pin : confirmPin;
        return (
            <View style={styles.dotsRow}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            current.length > i && styles.filledDot,
                            error && styles.errorDot
                        ]}
                    />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text variant="headingLg" align="center" style={styles.title}>
                    {step === 'set' ? 'Create a PIN' : 'Confirm your PIN'}
                </Text>
                <Text variant="bodyMd" align="center" color={theme.colors.crystalBlue} style={styles.subtitle}>
                    Secure your wallet with a 6-digit PIN.
                </Text>

                {renderDots()}

                <View style={styles.numpad}>
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL'].map((val, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.key}
                            onPress={() => {
                                if (val === 'DEL') {
                                    step === 'set' ? setPin(pin.slice(0, -1)) : setConfirmPin(confirmPin.slice(0, -1));
                                } else if (val !== '') {
                                    handlePress(val);
                                }
                            }}
                        >
                            <Text variant="headingXl">{val}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.abyssNavy,
    },
    content: {
        flex: 1,
        padding: theme.spacing.space8,
        justifyContent: 'center',
    },
    title: {
        marginBottom: theme.spacing.space4,
    },
    subtitle: {
        marginBottom: theme.spacing.space12,
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: theme.spacing.space4,
        marginBottom: 60,
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(0, 102, 255, 0.2)',
    },
    filledDot: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    errorDot: {
        borderColor: theme.colors.error,
        backgroundColor: theme.colors.error,
    },
    numpad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 20,
    },
    key: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
