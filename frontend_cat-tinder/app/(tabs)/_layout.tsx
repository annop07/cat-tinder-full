//config about the icon, color
import { View, Text } from 'react-native'
import React from 'react'
import { Redirect, Tabs } from 'expo-router'
import { Feather } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context";


const TabsLayout = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#1DA1F2",
                tabBarInactiveTintColor: "#657786",
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderTopWidth: 1,
                    borderTopColor: "#E1E8ED",
                    height: 50 + insets.bottom,
                    paddingTop: 8,
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name='index'
                options={{
                    title: "",
                    tabBarIcon: ({ color, size }) =>
                        <Feather
                            name="home"
                            size={size}
                            color={color}
                        />
                }}
            />
            <Tabs.Screen
                name='like'
                options={{
                    title: "",
                    tabBarIcon: ({ color, size }) =>
                        <Feather
                            name="heart"
                            size={size}
                            color={color}
                        />
                }}
            />
            <Tabs.Screen
                name='messages'
                options={{
                    title: "",
                    tabBarIcon: ({ color, size }) =>
                        <Feather
                            name="mail"
                            size={size}
                            color={color}
                        />
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: "",
                    tabBarIcon: ({ color, size }) =>
                        <Feather
                            name="user"
                            size={size}
                            color={color}
                        />
                }}
            />
        </Tabs>
    )
}

export default TabsLayout