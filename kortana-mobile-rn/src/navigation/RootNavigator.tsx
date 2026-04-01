// src/navigation/RootNavigator.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useWalletStore } from '@store/wallet.store';
import { KeychainService } from '@services/keychain.service';
import { AuthStack } from './stacks/AuthStack';
import { AppTabs } from './AppTabs';
import { SplashScreen } from '@screens/Splash/SplashScreen';
import { LockScreen } from '@screens/Lock/LockScreen';

const RootStack = createStackNavigator();

export const RootNavigator = () => {
  const { isOnboarded, isLocked } = useWalletStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      const mnemonic = await KeychainService.getMnemonic();
      if (mnemonic) {
        useWalletStore.getState().setOnboarded(true);
        // useWalletStore.getState().setLocked(true); // Enable this for auto-lock on start
      }
      setIsLoading(false);
    };
    checkOnboarding();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboarded ? (
          <RootStack.Screen name="Auth" component={AuthStack} />
        ) : isLocked ? (
          <RootStack.Screen name="Lock" component={LockScreen} />
        ) : (
          <RootStack.Screen name="App" component={AppTabs} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
