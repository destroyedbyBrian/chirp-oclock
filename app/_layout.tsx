import { Stack } from 'expo-router';

export default function Layout() {
    return (
    <Stack
        screenOptions={{
        headerShown: true,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_left', // Default animation for forward navigation
        presentation: 'card',
        }}
    >
        <Stack.Screen
            name="home"
            options={{
                title: 'Home',
                headerShown: false,
            }}
        />
        <Stack.Screen
            name="settings"
            options={({ route }) => ({
                title: 'Settings',
                headerShown: false,
                animation: 'slide_from_right', // This will make the screen slide from left when going back
                // For more control, we can use the custom animation options
                animationDuration: 600,
            })}
        />
        <Stack.Screen 
            name="newAlarm"
            options={({ route }) => ({
                title: 'New Alarm',
                headerShown: false,
                animation: 'slide_from_right',
                animationDuration: 600,
            })}
        />
    </Stack>
    );
}


