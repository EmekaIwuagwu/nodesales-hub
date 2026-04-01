// src/navigation/stacks/AssetStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardScreen } from '@screens/Dashboard/DashboardScreen';
import { TokenDetailScreen } from '@screens/TokenDetail/TokenDetailScreen';
import { AddTokenScreen } from '@screens/AddToken/AddTokenScreen';
import { NetworkScreen } from '@screens/Network/NetworkScreen';
import { SwapScreen } from '@screens/Swap/SwapScreen';
import { BridgeScreen } from '@screens/Bridge/BridgeScreen';
import { NFTGalleryScreen } from '@screens/NFTGallery/NFTGalleryScreen';

const Stack = createStackNavigator();

export const AssetStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="TokenDetail" component={TokenDetailScreen} />
            <Stack.Screen name="AddToken" component={AddTokenScreen} />
            <Stack.Screen name="NetworkSelect" component={NetworkScreen} />
            <Stack.Screen name="Swap" component={SwapScreen} />
            <Stack.Screen name="Bridge" component={BridgeScreen} />
            <Stack.Screen name="NFTGallery" component={NFTGalleryScreen} />
        </Stack.Navigator>
    );
};
