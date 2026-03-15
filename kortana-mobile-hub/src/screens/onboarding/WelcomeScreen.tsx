import React from 'react';
import { View, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../theme';
import { Text } from '../../components/atoms/Typography';
import { Button } from '../../components/atoms/Button';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/types';

const { height } = Dimensions.get('window');

export const WelcomeScreen = () => {
    const navigation = useNavigation<StackNavigationProp<OnboardingStackParamList>>();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={theme.gradients.hero}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.content}>
                <View style={styles.heroSection}>
                    {/* Orbital sphere placeholder */}
                    <View style={styles.orbitalPlaceholder}>
                        <LinearGradient
                            colors={['#00AAFF', '#0066FF']}
                            style={styles.orb}
                        />
                    </View>
                </View>

                <View style={styles.card}>
                    <Text variant="displayLg" align="center" style={styles.title}>
                        Your Keys. Your Coins. Your Future.
                    </Text>
                    <Text variant="bodyMd" align="center" color={theme.colors.crystalBlue} style={styles.subtitle}>
                        The most beautiful non-custodial wallet on the Kortana Network.
                    </Text>

                    <View style={styles.actions}>
                        <Button
                            title="Create New Wallet"
                            variant="primary"
                            size="lg"
                            onPress={() => navigation.navigate('CreateWallet')}
                            style={styles.button}
                        />
                        <Button
                            title="Import Existing Wallet"
                            variant="ghost"
                            size="lg"
                            onPress={() => navigation.navigate('ImportWallet')}
                            style={styles.button}
                        />
                    </View>

                    <Text variant="bodySm" align="center" color="#4A7DAA" style={styles.footer}>
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </Text>
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
    heroSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orbitalPlaceholder: {
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: 'rgba(0, 102, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    orb: {
        width: 200,
        height: 200,
        borderRadius: 100,
        shadowColor: theme.colors.neonBlue,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 30,
        elevation: 20,
    },
    card: {
        backgroundColor: 'rgba(13, 31, 60, 0.92)',
        borderTopLeftRadius: theme.radius['2xl'],
        borderTopRightRadius: theme.radius['2xl'],
        borderWidth: 1,
        borderColor: 'rgba(0, 102, 255, 0.18)',
        padding: theme.spacing.space8,
        paddingBottom: theme.spacing.space12,
    },
    title: {
        marginBottom: theme.spacing.space4,
    },
    subtitle: {
        marginBottom: theme.spacing.space8,
    },
    actions: {
        gap: theme.spacing.space4,
        marginBottom: theme.spacing.space8,
    },
    button: {
        width: '100%',
    },
    footer: {
        marginTop: theme.spacing.space4,
    },
});
