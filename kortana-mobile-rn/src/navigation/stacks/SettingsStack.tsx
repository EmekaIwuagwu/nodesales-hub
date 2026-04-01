// src/navigation/stacks/SettingsStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SettingsScreen } from '@screens/Settings/SettingsScreen';
import { BackupMnemonicScreen } from '@screens/Backup/BackupMnemonicScreen';
import { WalletConnectScreen } from '@screens/WalletConnect/WalletConnectScreen';
import { ScannerScreen } from '@screens/Scanner/ScannerScreen';

const Stack = createStackNavigator();

export const SettingsStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SettingsMain" component={SettingsScreen} />
            <Stack.Screen name="BackupMnemonic" component={BackupMnemonicScreen} />
            <Stack.Screen name="WalletConnect" component={WalletConnectScreen} />
            <Stack.Screen name="Scanner" component={ScannerScreen} />
        </Stack.Navigator>
    );
};
