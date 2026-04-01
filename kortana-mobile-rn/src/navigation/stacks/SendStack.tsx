// src/navigation/stacks/SendStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SelectRecipientScreen } from '@screens/Send/SelectRecipientScreen';
import { SendAmountScreen } from '@screens/Send/SendAmountScreen';
import { ConfirmTransactionScreen } from '@screens/Send/ConfirmTransactionScreen';
import { ScannerScreen } from '@screens/Scanner/ScannerScreen';

const Stack = createStackNavigator();

export const SendStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SelectRecipient" component={SelectRecipientScreen} />
      <Stack.Screen name="SendAmount" component={SendAmountScreen} />
      <Stack.Screen name="ConfirmTransaction" component={ConfirmTransactionScreen} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
    </Stack.Navigator>
  );
};
