import React from 'react';
import { View, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import { theme } from '../../theme';
import { Text } from '../../components/atoms/Typography';
import { Icon } from '../../components/atoms/Icon';
import { GlassCard } from '../../components/atoms/GlassCard';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ReceiveScreen = ({
    address = '0x1234...5678',
    symbol = 'KRTN',
    name = 'Kortana'
}) => {

    const onCopy = () => {
        Clipboard.setString(address);
        // Add haptic feedback or toast here
    };

    const onShare = async () => {
        try {
            await Share.share({
                message: `My ${name} (${symbol}) Address: ${address}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.abyssNavy, '#010817']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn}>
                        <Icon name="chevron-down" size={24} style={{ transform: [{ rotate: '90deg' }] }} />
                    </TouchableOpacity>
                    <Text variant="headingLg">Receive {symbol}</Text>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.body}>
                    <GlassCard style={styles.qrCard}>
                        <View style={styles.qrWrapper}>
                            <QRCode
                                value={address}
                                size={220}
                                color={theme.colors.white}
                                backgroundColor="transparent"
                            />
                        </View>

                        <View style={styles.addressWrapper}>
                            <Text variant="bodySm" color={theme.colors.slate400} align="center">
                                Your wallet address
                            </Text>
                            <TouchableOpacity style={styles.addressContainer} onPress={onCopy}>
                                <Text variant="monoSm" color={theme.colors.white} style={styles.addressText}>
                                    {address}
                                </Text>
                                <Icon name="copy" size={20} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </GlassCard>

                    <View style={styles.infoBox}>
                        <View style={styles.infoIcon}>
                            <Icon name="alert-circle" size={20} color={theme.colors.primary} />
                        </View>
                        <Text variant="bodySm" color={theme.colors.slate400} style={styles.infoText}>
                            Only send <Text color={theme.colors.primary} variant="bodySm">{symbol}</Text> assets to this address. Sending other tokens may result in permanent loss.
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionBtn} onPress={onCopy}>
                            <View style={styles.actionIcon}>
                                <Icon name="copy" size={24} color={theme.colors.white} />
                            </View>
                            <Text variant="bodyMd">Copy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
                            <View style={styles.actionIcon}>
                                <Icon name="share" size={24} color={theme.colors.white} />
                            </View>
                            <Text variant="bodyMd">Share</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    body: {
        flex: 1,
        paddingHorizontal: theme.spacing.space5,
        paddingTop: theme.spacing.space10,
        alignItems: 'center',
    },
    qrCard: {
        width: '100%',
        padding: theme.spacing.space8,
        alignItems: 'center',
        marginBottom: theme.spacing.space8,
    },
    qrWrapper: {
        padding: theme.spacing.space4,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    addressWrapper: {
        marginTop: theme.spacing.space6,
        width: '100%',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.space3,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: theme.spacing.space4,
        paddingVertical: theme.spacing.space3,
        borderRadius: theme.radius.md,
        marginTop: theme.spacing.space2,
    },
    addressText: {
        letterSpacing: 1,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 102, 255, 0.05)',
        padding: theme.spacing.space4,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: 'rgba(0, 102, 255, 0.1)',
        marginBottom: theme.spacing.space10,
    },
    infoIcon: {
        marginRight: theme.spacing.space3,
        marginTop: 2,
    },
    infoText: {
        flex: 1,
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.space10,
    },
    actionBtn: {
        alignItems: 'center',
        gap: theme.spacing.space2,
    },
    actionIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    }
});
