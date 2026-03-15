import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { OnboardingNavigator } from './OnboardingNavigator';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { AuthScreen } from '../screens/onboarding/AuthScreen';
import { MainNavigator } from './MainNavigator';
import { useWalletStore } from '../store/walletStore';
import { View } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
    const { hasWallet, isLocked } = useWalletStore();
    const [showSplash, setShowSplash] = React.useState(true);

    if (showSplash) {
        return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!hasWallet ? (
                    <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
                ) : isLocked ? (
                    <Stack.Screen name="Auth" component={AuthScreen} />
                ) : (
                    <Stack.Screen name="Main" component={MainNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
