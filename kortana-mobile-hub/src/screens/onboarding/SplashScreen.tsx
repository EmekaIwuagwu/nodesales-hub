import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../theme';
import { Text } from '../../components/atoms/Typography';

const { width } = Dimensions.get('window');

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);
    const textAnim = new Animated.Value(20);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
            Animated.timing(textAnim, {
                toValue: 0,
                duration: 800,
                delay: 500,
                useNativeDriver: true,
            })
        ]).start();

        const timer = setTimeout(onFinish, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={theme.gradients.hero}
                style={StyleSheet.absoluteFill}
            />

            <Animated.View style={[
                styles.logoContainer,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}>
                {/* Logo Placeholder - would be a LottieView in production */}
                <View style={styles.logoCircle}>
                    <Text variant="display2xl" style={styles.logoText}>K</Text>
                </View>
            </Animated.View>

            <Animated.View style={[
                styles.textContainer,
                { opacity: fadeAnim, transform: [{ translateY: textAnim }] }
            ]}>
                <Text variant="displayLg" style={styles.brandName}>KORTANA</Text>
                <Text variant="bodySm" color={theme.colors.neonBlue} style={styles.tagline}>
                    THE FUTURE OF FINANCE
                </Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 40,
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 40,
        elevation: 20,
    },
    logoText: {
        color: 'white',
        fontSize: 60,
    },
    textContainer: {
        alignItems: 'center',
    },
    brandName: {
        letterSpacing: 4,
        marginBottom: 8,
    },
    tagline: {
        letterSpacing: 8,
        opacity: 0.8,
    },
});
