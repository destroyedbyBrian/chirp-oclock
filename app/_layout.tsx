import { Stack } from 'expo-router';
import { AppState } from 'react-native';
import { View, StyleSheet, useColorScheme, Image, Dimensions } from 'react-native';
import { useEffect, useRef, useState, useCallback } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Audio, Video, ResizeMode } from 'expo-av';
import { useAlarmSoundStore } from '@/stores/soundStore';
import NfcManager from 'react-native-nfc-manager';
import { useAppStateStore } from "@/stores/appStateStore";
import { useNfcStore } from '@/stores/nfcStore';
import { useAppColorScheme} from '@/stores/appColorScheme';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync(); 

export default function Layout() {
    const notificationListener = useRef<Notifications.EventSubscription>();  
    const responseListener = useRef<Notifications.EventSubscription>(); 
    const effectRunRef = useRef<boolean>(false);  // Add this ref to track effect runs
    const soundLockRef = useRef<boolean>(false);  // Add lock ref

    const isAppColorSchemeDark = useAppColorScheme(s => s.isAppColorSchemeDark);
    const setIsAppColorSchemeDark = useAppColorScheme(s => s.setIsAppColorSchemeDark);

    const [showSplash, setShowSplash] = useState<boolean>(true);
    const setIsAppInForeGround = useAppStateStore(s => s.setIsAppInForeGround);
    const splashState = useAppStateStore((state) => state.splashState);
    const setSplashState = useAppStateStore((state) => state.setSplashState);

    const setSoundRef = useAlarmSoundStore(s => s.setSoundRef);
    const currentActiveAlarm = useAlarmSoundStore(s => s.isAlarmRinging);
    const setAlarmActive = useAlarmSoundStore(s => s.setIsAlarmRinging)

    const nfcPromptVisible = useNfcStore(s => s.nfcPromptVisible);
    const setNfcPromptVisible = useNfcStore(s => s.setNfcPromptVisible);
    const lastStateChangeRef = useRef<number>(0);
    const stateChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const systemColorScheme = useColorScheme();

    const { width, height } = Dimensions.get('window');

    const staticImage = systemColorScheme === "dark"
            ? require('../assets/images/splashScreen-dark.png')
            : require('../assets/images/splashScreen-light.png');

    const splashVideo = isAppColorSchemeDark
            ? require('../assets/videos/splashScreenAnimated-dark.mp4')
            : require('../assets/videos/splashScreenAnimated-light.mp4');
    
    const backgroundColor = systemColorScheme === 'dark' ? '#000000' : '#ffffff';

    useEffect(() => {
        if (currentActiveAlarm && !nfcPromptVisible) {
          setNfcPromptVisible(true);
        }
    }, [currentActiveAlarm])

    useEffect(() => {
        // Skip if effect has already run
        if (effectRunRef.current) {
            return;
        }
        effectRunRef.current = true;

        requestForPushNotification();

        const initializeNfc = async () => {
            try {
                await NfcManager.start();
            } catch (error) {
                console.log('NFC initialization error:', error);
            }
        };
        initializeNfc();

        // Mount notification handler on initial render
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
            }),
        });

        // Add AppState listener with debouncing
        const handleAppStateChange = async (nextAppState: string) => {
            const now = Date.now();
            const timeSinceLastChange = now - lastStateChangeRef.current;
            
            // Clear any existing timeout
            if (stateChangeTimeoutRef.current) {
                clearTimeout(stateChangeTimeoutRef.current);
            }

            // If we've had a state change in the last 500ms, debounce it
            if (timeSinceLastChange < 500) {
                stateChangeTimeoutRef.current = setTimeout(() => {
                    handleAppStateChange(nextAppState);
                }, 500);
                return;
            }

            lastStateChangeRef.current = now;
            setIsAppInForeGround(nextAppState === 'active');
            
            // Check for recent alarm triggers when app comes to foreground
            if (nextAppState === 'active') {
                // First check for active notifications
                await checkActiveNotifications();
                // Then check for recent triggers
                await checkRecentAlarmTrigger();
            }
        };

        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
        setIsAppInForeGround(AppState.currentState === 'active');
        
        notificationListener.current = Notifications.addNotificationReceivedListener(async() => {
            console.log('Notification received, current app state:', AppState.currentState);
            
            if (AppState.currentState === "active") {
                setIsAppInForeGround(true);
            }

            if (!currentActiveAlarm) {
                console.log('No active alarm, playing sound...');
                await playSoundEndlessly();
            }

            if (AppState.currentState === "active") {
                await Notifications.cancelAllScheduledNotificationsAsync();
                await Notifications.dismissAllNotificationsAsync();
            }
        });

        // Check for active notifications on initial mount
        checkActiveNotifications();

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
            if (stateChangeTimeoutRef.current) {
                clearTimeout(stateChangeTimeoutRef.current);
            }
            appStateSubscription?.remove();
            cleanupSound();
        }
    }, []);

    useEffect(() => {
        async function prepareApp() {
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (e) {
                console.warn(e);
            } finally {
                setSplashState('animating');
            }
        }
        prepareApp();
    }, [setSplashState])

    const onLayoutRootView = useCallback(async () => {
        if (splashState === 'ready') {
            await SplashScreen.hideAsync();
        }
    }, [splashState]);

    // Add function to check for recent alarm triggers
    const checkRecentAlarmTrigger = async () => {
        try {
            const now = new Date();
            const oneMinutesAgo = new Date(now.getTime() - 1 * 60 * 1000);
            
            // Get all scheduled notifications
            const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
            
            // Check if any notification was scheduled in the last 2 minutes
            const recentTrigger = scheduledNotifications.some(notification => {
                if (!notification.trigger || !('date' in notification.trigger)) {
                    return false;
                }
                const triggerDate = new Date(notification.trigger.date);
                const isRecent = triggerDate >= oneMinutesAgo && triggerDate <= now;
                
                return isRecent;
            });

            if (recentTrigger) {
                // Cancel any existing notifications first
                await Notifications.cancelAllScheduledNotificationsAsync();
                await Notifications.dismissAllNotificationsAsync();
                await playSoundEndlessly();
                setNfcPromptVisible(true);
            }
        } catch (error) {
            console.log('Error checking recent alarm triggers:', error);
        }
    };

    // Add function to check for active notifications
    const checkActiveNotifications = async () => {
        try {
            const activeNotifications = await Notifications.getPresentedNotificationsAsync();
            
            if (activeNotifications.length > 0) {
                await Notifications.cancelAllScheduledNotificationsAsync();
                await Notifications.dismissAllNotificationsAsync();
                await playSoundEndlessly();
                setNfcPromptVisible(true);
            }
        } catch (error) {
            console.log('Error checking active notifications:', error);
        }
    };

    async function requestForPushNotification() {
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            try {
                const projectId =
                    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
                if (!projectId) {
                    throw new Error('Project ID not found');
                }
            } catch (e) {
                console.log(e)
            }
        } else {
            alert('Must use physical device for Push Notifications');
        }
    }

    async function playSoundEndlessly() {
        // If already playing or locked, return early
        if (currentActiveAlarm || soundLockRef.current) {
            return;
        }

        // Acquire lock
        soundLockRef.current = true;

        try {
            // Stop any existing sound first
            const currentSound = useAlarmSoundStore.getState().soundRef;
            if (currentSound && typeof currentSound.stopAsync === 'function') {
                await currentSound.stopAsync();
                await currentSound.unloadAsync();
            }

            const { sound } = await Audio.Sound.createAsync(
                require('../assets/sounds/ringtone.mp3'), 
                { shouldPlay: true, isLooping: true }
            );
            
            // Set refs and state before releasing lock
            setSoundRef(sound);
            setAlarmActive(true);
        } catch (e) {
            // Reset state on error
            setSoundRef(null);
            setAlarmActive(false);
        } finally {
            // Release lock only after everything is done
            soundLockRef.current = false;
        }
    }

    // Add cleanup function
    const cleanupSound = async () => {
        // Acquire lock during cleanup
        soundLockRef.current = true;

        try {
            const currentSound = useAlarmSoundStore.getState().soundRef;
            if (currentSound && typeof currentSound.stopAsync === 'function') {
                await currentSound.stopAsync();
                await currentSound.unloadAsync();
            }
        } catch (e) {
            console.log('Error cleaning up sound:', e);
        } finally {
            setSoundRef(null);
            setAlarmActive(false);
            soundLockRef.current = false;
        }
    };

     // 1. LOADING state
     if (splashState === 'loading') {
        return (
            <View style={[styles.container, { backgroundColor }]}>
                <Image source={staticImage} resizeMode="contain" style={{ width: width * 1.9, height: height * 1.9 }} />
            </View>
        );
    }

    // 2. ANIMATING state
    if (splashState === 'animating') {
        return (
            <View style={[styles.container, { backgroundColor }]}>
                <Video
                    source={splashVideo}
                    shouldPlay
                    isLooping={false}
                    resizeMode={ResizeMode.COVER}
                    style={StyleSheet.absoluteFill}
                    onPlaybackStatusUpdate={(status) => {
                        if (status.isLoaded && status.didJustFinish) {
                            setSplashState('ready');
                        }
                    }}
                />
            </View>
        );
    }

    // 3. READY state
    return (
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
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
                    name="index"
                    options={() => ({
                        title: 'index',
                        headerShown: false,
                    })}
                />
                <Stack.Screen
                    name="settings"
                    options={({ route }) => ({
                        title: 'Settings',
                        headerShown: false,
                        animation: 'slide_from_right', // This will make the screen slide from left when going back
                        // For more control, we can use the custom animation options
                        animationDuration: 1000,
                    })}
                />
                <Stack.Screen 
                    name="newAlarm"
                    options={({ route }) => ({
                        title: 'New Alarm',
                        headerShown: false,
                        animation: 'simple_push',
                        animationDuration: 500,
                    })}
                />
                <Stack.Screen 
                    name="editAlarm"
                    options={({ route }) => ({
                        title: 'Edit Alarm',
                        headerShown: false,
                        animation: 'simple_push',
                        animationDuration: 500,
                    })}
                />
                {/* <Stack.Screen 
                    name="testRun/testNFC"
                    options={({ route }) => ({
                        title: 'Test NFC',
                        headerShown: false,
                        animation: 'simple_push',
                        animationDuration: 500,
                    })}
                /> */}
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // This is the crucial part: it hides the parts of the video
        // that are scaled outside of the screen boundaries.
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
});

