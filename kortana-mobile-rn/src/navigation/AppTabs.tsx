// src/navigation/AppTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AssetStack } from './stacks/AssetStack';
import { SendStack } from './stacks/SendStack';
import { ReceiveScreen } from '@screens/Receive/ReceiveScreen';
import { HistoryScreen } from '@screens/History/HistoryScreen';
import { SettingsStack } from './stacks/SettingsStack';
import { Colors, Typography, Radius } from '@theme';
import { BlurView } from '@react-native-community/blur';

const Tab = createBottomTabNavigator();

const TabBarBackground = () => (
    <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={20}
    />
);

export const AppTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarBackground: TabBarBackground,
                tabBarActiveTintColor: Colors.electricBlue,
                tabBarInactiveTintColor: Colors.grey500,
                tabBarLabelStyle: styles.label,
                tabBarIcon: ({ color, focused }) => {
                    let icon = '';
                    if (route.name === 'Home') icon = '🏠';
                    if (route.name === 'Send') icon = '↑';
                    if (route.name === 'Receive') icon = '↓';
                    if (route.name === 'History') icon = '📜';
                    if (route.name === 'Settings') icon = '⚙️';

                    return (
                        <View style={styles.iconContainer}>
                            <Text style={[styles.icon, { color, opacity: focused ? 1 : 0.6 }]}>
                                {icon}
                            </Text>
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={AssetStack} />
            <Tab.Screen name="Send" component={SendStack} />
            <Tab.Screen 
                name="Receive" 
                component={ReceiveScreen} 
                options={{
                    tabBarButton: (navProps: any) => (
                        <TouchableOpacity 
                            style={styles.centerTabContainer}
                            onPress={navProps.onPress}
                            activeOpacity={0.8}
                        >
                            <View style={styles.centerTabButton}>
                                <Text style={styles.centerTabIcon}>↓</Text>
                            </View>
                            <Text style={styles.centerTabLabel}>Receive</Text>
                        </TouchableOpacity>
                    )
                }}
            />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Settings" component={SettingsStack} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        borderTopWidth: 0,
        backgroundColor: 'transparent',
        elevation: 0,
    },
    label: {
        fontFamily: Typography.fontPrimary,
        fontSize: Typography.xs,
        fontWeight: Typography.medium,
        marginBottom: 10,
    },
    iconContainer: {
        marginTop: 10,
    },
    icon: {
        fontSize: 24,
    },
    centerTabContainer: {
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerTabButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.electricBlue,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
        shadowColor: Colors.electricBlue,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 15,
    },
    centerTabIcon: {
        fontSize: 30,
        color: Colors.white,
    },
    centerTabLabel: {
        fontFamily: Typography.fontPrimary,
        fontSize: Typography.xs,
        fontWeight: Typography.bold,
        color: Colors.electricBlue,
    }
});
