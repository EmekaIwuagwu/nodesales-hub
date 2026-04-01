// src/navigation/stacks/AuthStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OnboardingScreen } from '@screens/Onboarding/OnboardingScreen';
import { CreateWalletScreen } from '@screens/CreateWallet/CreateWalletScreen';
import { VerifyMnemonicScreen } from '@screens/CreateWallet/VerifyMnemonicScreen';
import { SetPinScreen } from '@screens/CreateWallet/SetPinScreen';
import { WalletReadyScreen } from '@screens/CreateWallet/WalletReadyScreen';
import { ImportWalletScreen } from '@screens/ImportWallet/ImportWalletScreen';

const Stack = createStackNavigator();

export const AuthStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
        cardOverlayEnabled: true,
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
      <Stack.Screen name="VerifyMnemonic" component={VerifyMnemonicScreen} />
      <Stack.Screen name="SetPin" component={SetPinScreen} />
      <Stack.Screen name="WalletReady" component={WalletReadyScreen} />
      <Stack.Screen name="ImportWallet" component={ImportWalletScreen} />
    </Stack.Navigator>
  );
};
