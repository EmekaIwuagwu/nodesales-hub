import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Linking } from 'react-native';
import { theme } from '../../theme';
import { Text } from '../atoms/Typography';
import { Icon, IconName } from '../atoms/Icon';
import { GlassCard } from '../atoms/GlassCard';
import { Transaction } from '../../types/transaction.types';
import { Button } from '../atoms/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
    visible: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

export const TransactionDetail: React.FC<Props> = ({ visible, onClose, transaction }) => {
    if (!transaction) return null;

    const isReceive = transaction.type === 'receive';
    const explorerUrl = `https://kortanascan.io/tx/${transaction.hash}`;

    const InfoRow = ({ label, value, isCopyable = false }: { label: string, value: string, isCopyable?: boolean }) => (
        <View style={styles.infoRow}>
            <Text variant="bodySm" color={theme.colors.slate400}>{label}</Text>
            <View style={styles.valueRow}>
                <Text variant="monoSm" style={styles.valueText} numberOfLines={1}>{value}</Text>
                {isCopyable && (
                    <TouchableOpacity style={styles.copyBtn}>
                        <Icon name="copy" size={14} color={theme.colors.primary} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <SafeAreaView style={styles.safeArea}>
                    <GlassCard style={styles.content}>
                        <View style={styles.header}>
                            <Text variant="headingLg">Transaction Details</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <View style={{ transform: [{ rotate: '45deg' }] }}>
                                    <Icon name="plus" size={24} color={theme.colors.slate400} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.amountSection}>
                            <View style={[
                                styles.iconCircle,
                                { backgroundColor: isReceive ? 'rgba(0, 212, 163, 0.1)' : 'rgba(255, 255, 255, 0.05)' }
                            ]}>
                                <Icon
                                    name={isReceive ? 'receive' : 'send'}
                                    size={32}
                                    color={isReceive ? theme.colors.success : theme.colors.white}
                                />
                            </View>
                            <Text variant="displayLg" style={styles.amount}>
                                {isReceive ? '+' : '-'}{transaction.amount} {transaction.symbol}
                            </Text>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: transaction.status === 'confirmed' ? 'rgba(0, 212, 163, 0.1)' : 'rgba(255, 59, 92, 0.1)' }
                            ]}>
                                <Text variant="bodySm" color={transaction.status === 'confirmed' ? theme.colors.success : theme.colors.error}>
                                    {transaction.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.detailsList}>
                            <InfoRow label="From" value={transaction.from} isCopyable />
                            <InfoRow label="To" value={transaction.to} isCopyable />
                            <InfoRow label="Transaction Hash" value={transaction.hash} isCopyable />
                            <InfoRow label="Date" value={new Date(transaction.timestamp).toLocaleString()} />
                            <InfoRow label="Network Fee" value={transaction.fee || '0.00042 KRTN'} />
                        </View>

                        <View style={styles.footer}>
                            <Button
                                title="View on Explorer"
                                variant="secondary"
                                size="md"
                                fullWidth
                                onPress={() => Linking.openURL(explorerUrl)}
                            />
                            <Button
                                title="Close"
                                variant="ghost"
                                size="md"
                                fullWidth
                                onPress={onClose}
                            />
                        </View>
                    </GlassCard>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(1, 8, 23, 0.95)',
    },
    safeArea: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    content: {
        height: '80%',
        padding: theme.spacing.space5,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.space8,
    },
    closeBtn: {
        padding: theme.spacing.space2,
    },
    amountSection: {
        alignItems: 'center',
        marginBottom: theme.spacing.space10,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.space4,
    },
    amount: {
        marginBottom: theme.spacing.space2,
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.space3,
        paddingVertical: theme.spacing.space1,
        borderRadius: theme.radius.full,
    },
    detailsList: {
        gap: theme.spacing.space5,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: '65%',
    },
    valueText: {
        flex: 1,
        marginRight: theme.spacing.space2,
    },
    copyBtn: {
        padding: 4,
    },
    footer: {
        marginTop: 'auto',
        gap: theme.spacing.space3,
        paddingBottom: theme.spacing.space4,
    }
});
