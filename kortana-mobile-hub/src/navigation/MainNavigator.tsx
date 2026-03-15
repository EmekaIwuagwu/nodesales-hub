import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { HomeScreen } from '../screens/dashboard/HomeScreen';
import { ActivityScreen } from '../screens/wallet/ActivityScreen';
import { SettingsScreen } from '../screens/wallet/SettingsScreen';
import { Text } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';
import { theme } from '../theme';
import { BlurView } from '@react-native-community/blur';

const Tab = createBottomTabNavigator();

// Placeholder screens
const Placeholder = ({ name }: { name: string }) => (
    <View style={styles.placeholder}>
        <Text variant="headingLg">{name} Screen</Text>
        <Text color={theme.colors.slate400}>Coming Soon</Text>
    </View>
);

export const MainNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarBackground: () => (
                    Platform.OS === 'ios' ? (
                        <BlurView blurType="dark" blurAmount={20} style={StyleSheet.absoluteFill} />
                    ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(1, 8, 23, 0.95)' }]} />
                    )
                ),
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.slate400,
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName;
                    if (route.name === 'Dashboard') iconName = 'scan';
                    else if (route.name === 'Swap') iconName = 'swap';
                    else if (route.name === 'History') iconName = 'bell';
                    else if (route.name === 'Settings') iconName = 'lock';

                    return (
                        <View style={focused ? styles.activeIcon : null}>
                            <Icon name={iconName as any} size={24} color={color} />
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={HomeScreen} />
            <Tab.Screen name="Swap" component={() => <Placeholder name="Swap" />} />
            <Tab.Screen name="History" component={ActivityScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        elevation: 0,
        backgroundColor: 'transparent',
        borderRadius: 24,
        height: 70,
        borderTopWidth: 0,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.abyssNavy,
    },
    activeIcon: {
        // Optional glow effect for active tab
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    }
});
