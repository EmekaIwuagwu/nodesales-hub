import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { theme } from '../../theme';
import { Text } from '../../components/atoms/Typography';
import { Icon, IconName } from '../../components/atoms/Icon';
import { GlassCard } from '../../components/atoms/GlassCard';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetworkStore } from '../../store/networkStore';

interface SettingItemProps {
    icon: IconName;
    label: string;
    value?: string;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (val: boolean) => void;
    color?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({
    icon, label, value, onPress, showSwitch, switchValue, onSwitchChange, color = theme.colors.white
}) => (
    <TouchableOpacity
        style={styles.item}
        onPress={onPress}
        disabled={showSwitch}
        activeOpacity={0.7}
    >
        <View style={styles.itemLeft}>
            <View style={styles.itemIcon}>
                <Icon name={icon} size={20} color={color} />
            </View>
            <Text variant="bodyMd" style={{ color }}>{label}</Text>
        </View>
        <View style={styles.itemRight}>
            {value && <Text variant="bodySm" color={theme.colors.slate400}>{value}</Text>}
            {showSwitch ? (
                <Switch
                    value={switchValue}
                    onValueChange={onSwitchChange}
                    trackColor={{ false: theme.colors.slate700, true: theme.colors.primary }}
                    thumbColor={theme.colors.white}
                />
            ) : (
                onPress && (
                    <View style={{ transform: [{ rotate: '-90deg' }] }}>
                        <Icon name="chevron-down" size={16} color={theme.colors.slate600} />
                    </View>
                )
            )}
        </View>
    </TouchableOpacity>
);

export const SettingsScreen = () => {
    const { activeNetwork } = useNetworkStore();
    const [biometricsEnabled, setBiometricsEnabled] = React.useState(true);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.abyssNavy, '#010817']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <Text variant="displayLg">Settings</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.section}>
                        <Text variant="headingSm" color={theme.colors.slate400} style={styles.sectionTitle}>
                            WALLET
                        </Text>
                        <GlassCard style={styles.card}>
                            <SettingItem icon="eye" label="Export Secret Phrase" onPress={() => { }} />
                            <SettingItem icon="copy" label="Export Private Key" onPress={() => { }} />
                            <SettingItem icon="plus" label="Manage Accounts" value="1 Account" onPress={() => { }} />
                        </GlassCard>
                    </View>

                    <View style={styles.section}>
                        <Text variant="headingSm" color={theme.colors.slate400} style={styles.sectionTitle}>
                            NETWORK
                        </Text>
                        <GlassCard style={styles.card}>
                            <SettingItem
                                icon="external-link"
                                label="Active Network"
                                value={activeNetwork.name}
                                onPress={() => { }}
                            />
                            <SettingItem icon="plus" label="Add Custom RPC" onPress={() => { }} />
                        </GlassCard>
                    </View>

                    <View style={styles.section}>
                        <Text variant="headingSm" color={theme.colors.slate400} style={styles.sectionTitle}>
                            SECURITY
                        </Text>
                        <GlassCard style={styles.card}>
                            <SettingItem
                                icon="scan"
                                label="Biometrics"
                                showSwitch
                                switchValue={biometricsEnabled}
                                onSwitchChange={setBiometricsEnabled}
                            />
                            <SettingItem icon="lock" label="Change PIN" onPress={() => { }} />
                        </GlassCard>
                    </View>

                    <View style={styles.section}>
                        <Text variant="headingSm" color={theme.colors.slate400} style={styles.sectionTitle}>
                            DANGER ZONE
                        </Text>
                        <GlassCard style={[styles.card, { borderColor: 'rgba(255, 59, 92, 0.2)' }]}>
                            <SettingItem
                                icon="alert-circle"
                                label="Reset Wallet"
                                color={theme.colors.error}
                                onPress={() => { }}
                            />
                        </GlassCard>
                    </View>

                    <View style={styles.footer}>
                        <Text variant="bodySm" color={theme.colors.slate600}>Kortana Wallet v1.0.0-genesis</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: theme.spacing.space5,
        paddingVertical: theme.spacing.space4,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.space5,
        paddingBottom: 150,
    },
    section: {
        marginTop: theme.spacing.space6,
    },
    sectionTitle: {
        marginBottom: theme.spacing.space3,
        marginLeft: theme.spacing.space2,
    },
    card: {
        padding: 0,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.space4,
        paddingHorizontal: theme.spacing.space4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.space3,
    },
    itemIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.space2,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    }
});
