import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OnboardingStackParamList } from './types';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { CreateWalletScreen } from '../screens/onboarding/CreateWalletScreen';
import { SeedPhraseVerifyScreen } from '../screens/onboarding/SeedPhraseVerifyScreen';
import { SetPinScreen } from '../screens/onboarding/SetPinScreen';
import { theme } from '../theme';

const Stack = createStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: theme.colors.abyssNavy },
            }}
        >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
            <Stack.Screen name="SeedPhraseVerify" component={SeedPhraseVerifyScreen} />
            <Stack.Screen name="SetPin" component={SetPinScreen} />
        </Stack.Navigator>
    );
};
