import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, TextInput, Modal } from 'react-native';
import { theme } from '../../theme';
import { Text } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { GlassCard } from '../atoms/GlassCard';
import { Token } from '../../types/token.types';
import FastImage from 'react-native-fast-image';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (token: Token) => void;
    tokens: Token[];
}

export const TokenSelector: React.FC<Props> = ({ visible, onClose, onSelect, tokens }) => {
    const [search, setSearch] = useState('');

    const filteredTokens = tokens.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.symbol.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <SafeAreaView style={styles.container}>
                    <GlassCard style={styles.content}>
                        <View style={styles.header}>
                            <Text variant="headingLg">Select Token</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <View style={{ transform: [{ rotate: '45deg' }] }}>
                                    <Icon name="plus" size={24} color={theme.colors.slate400} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchRow}>
                            <Icon name="scan" size={20} color={theme.colors.slate400} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search name or address"
                                placeholderTextColor={theme.colors.slate600}
                                value={search}
                                onChangeText={setSearch}
                                autoCorrect={false}
                            />
                        </View>

                        <FlatList
                            data={filteredTokens}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.tokenItem}
                                    onPress={() => {
                                        onSelect(item);
                                        onClose();
                                    }}
                                >
                                    <View style={styles.tokenLeft}>
                                        <View style={styles.iconWrapper}>
                                            <FastImage
                                                source={{ uri: item.icon }}
                                                style={styles.icon}
                                                defaultSource={require('../../assets/images/token_placeholder.png')}
                                            />
                                        </View>
                                        <View>
                                            <Text variant="headingSm">{item.name}</Text>
                                            <Text variant="bodySm" color={theme.colors.slate400}>{item.symbol}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.tokenRight}>
                                        <Text variant="headingSm" align="right">{item.balance}</Text>
                                        <Text variant="bodySm" color={theme.colors.slate400} align="right">${item.valueUsd}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </GlassCard>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(1, 8, 23, 0.95)',
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    content: {
        height: '90%',
        padding: theme.spacing.space5,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.space5,
    },
    closeBtn: {
        padding: theme.spacing.space2,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: theme.radius.md,
        paddingHorizontal: theme.spacing.space4,
        marginBottom: theme.spacing.space6,
    },
    searchInput: {
        flex: 1,
        height: 50,
        color: 'white',
        fontFamily: theme.fonts.body,
        marginLeft: theme.spacing.space3,
    },
    tokenItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.space4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    tokenLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.space4,
    },
    tokenRight: {
        alignItems: 'flex-end',
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    icon: {
        width: '100%',
        height: '100%',
    }
});
