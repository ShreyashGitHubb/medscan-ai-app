
import { Stack } from 'expo-router';

import { useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '../context/LanguageContext';
import { View } from 'react-native';
import { COLORS } from '../constants/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
    return (
        <LanguageProvider>
            <SafeAreaProvider>
                <View style={{ flex: 1, backgroundColor: COLORS.background }}>
                    <StatusBar style="dark" backgroundColor={COLORS.background} />
                    <Stack
                        screenOptions={{
                            headerStyle: {
                                backgroundColor: COLORS.background,
                            },
                            headerTintColor: COLORS.foreground,
                            headerTitleStyle: {
                                fontWeight: 'bold',
                            },
                            headerShadowVisible: false, // Cleaner look
                            contentStyle: { backgroundColor: COLORS.background },
                        }}
                    >
                        <Stack.Screen
                            name="index"
                            options={{
                                title: 'MedScan AI',
                                headerShown: false // Custom header in dashboard
                            }}
                        />
                        <Stack.Screen
                            name="scan/[type]"
                            options={({ route }) => ({
                                title: route.params.type ? `${route.params.type.charAt(0).toUpperCase() + route.params.type.slice(1)} Analysis` : 'Scan',
                                headerBackTitle: 'Back'
                            })}
                        />
                        <Stack.Screen
                            name="results/[type]"
                            options={{
                                title: 'Analysis Results',
                                presentation: 'modal'
                            }}
                        />
                    </Stack>
                </View>
            </SafeAreaProvider>
        </LanguageProvider>
    );
}
