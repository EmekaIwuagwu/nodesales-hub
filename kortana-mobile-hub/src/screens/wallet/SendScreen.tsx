import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { theme } from '../../theme';
import { Text } from '../../components/atoms/Typography';
import { Icon } from '../../components/atoms/Icon';
import { Button } from '../../components/atoms/Button';
import { GlassCard } from '../../components/atoms/GlassCard';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useWallet } from '../../hooks/useWallet';
import { useNavigation } from '@react-navigation/native';

export const SendScreen = () => {
    const { balance, activeNetwork, address: myAddress } = useWallet();
    const navigation = useNavigation<any>();
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState('0');
    const [loading, setLoading] = useState(false);

    const onNumberPress = (num: string) => {
        if (amount === '0') setAmount(num);
        else setAmount(amount + num);
    };

    const onDelete = () => {
        if (amount.length <= 1) setAmount('0');
        else setAmount(amount.slice(0, -1));
    };

    const onDecimal = () => {
        if (!amount.includes('.')) setAmount(amount + '.');
    };

    const handleSend = async () => {
        setLoading(true);
        // Transaction logic here
        setTimeout(() => {
            setLoading(false);
            navigation.goBack();
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.abyssNavy, '#010817']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <View style={{ transform: [{ rotate: '90deg' }] }}>
                            <Icon name="chevron-down" size={24} />
                        </View>
                    </TouchableOpacity>
                    <Text variant="headingLg">Send {activeNetwork.symbol}</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.inputSection}>
                        <Text variant="bodySm" color={theme.colors.slate400} style={styles.label}>
                            Recipient Address
                        </Text>
                        <View style={styles.addressInputRow}>
                            <TextInput
                                style={styles.addressInput}
                                placeholder="0x... or ENS name"
                                placeholderTextColor={theme.colors.slate600}
                                value={address}
                                onChangeText={setAddress}
                                autoCorrect={false}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity style={styles.scanBtn}>
                                <Icon name="scan" size={20} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.amountSection}>
                        <View style={styles.amountDisplay}>
                            <Text variant="displayXl" style={styles.amountText}>{amount}</Text>
                            <Text variant="headingLg" color={theme.colors.primary} style={styles.symbolText}>
                                {activeNetwork.symbol}
                            </Text>
                        </View>
                        <Text variant="bodyMd" color={theme.colors.slate400}>
                            Balance: {balance} {activeNetwork.symbol}
                        </Text>
                    </View>

                    <View style={styles.keypad}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <TouchableOpacity
                                key={num}
                                style={styles.key}
                                onPress={() => onNumberPress(num.toString())}
                            >
                                <Text variant="headingLg">{num}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.key} onPress={onDecimal}>
                            <Text variant="headingLg">.</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.key} onPress={() => onNumberPress('0')}>
                            <Text variant="headingLg">0</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.key} onPress={onDelete}>
                            <View style={{ transform: [{ rotate: '90deg' }] }}>
                                <Icon name="chevron-down" size={24} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Button
                        title={loading ? 'Sending...' : 'Continue'}
                        size="lg"
                        fullWidth
                        loading={loading}
                        onPress={handleSend}
                        disabled={amount === '0' || !address || loading}
                    />
                </ScrollView>
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.space5,
        paddingVertical: theme.spacing.space4,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.space5,
        paddingTop: theme.spacing.space6,
    },
    inputSection: {
        marginBottom: theme.spacing.space10,
    },
    label: {
        marginBottom: theme.spacing.space2,
        marginLeft: 4,
    },
    addressInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: theme.spacing.space4,
    },
    addressInput: {
        flex: 1,
        height: 56,
        color: 'white',
        fontFamily: theme.fonts.body,
        fontSize: 16,
    },
    scanBtn: {
        padding: theme.spacing.space2,
    },
    amountSection: {
        alignItems: 'center',
        marginBottom: theme.spacing.space10,
    },
    amountDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: theme.spacing.space3,
        marginBottom: theme.spacing.space2,
    },
    amountText: {
        fontSize: 64,
        letterSpacing: -2,
    },
    symbolText: {
        fontSize: 24,
    },
    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        marginBottom: theme.spacing.space10,
    },
    key: {
        width: '33%',
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueBtn: {
        marginBottom: theme.spacing.space10,
    }
});
