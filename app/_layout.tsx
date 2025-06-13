import { Stack, router } from 'expo-router';
import { AppState } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Audio } from 'expo-av';
import { useAlarmSoundStore } from '../stores/soundStore';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';
import { useAppStateStore } from "@/stores/appStateStore";
import { zustandStorage } from '@/storage/mmkvStorage';
import { useNfcStore } from '@/stores/nfcStore';
import { STORAGE_KEYS } from '../storage/storageKeys';


export default function Layout() {
    const notificationListener = useRef<Notifications.EventSubscription>();  
    const responseListener = useRef<Notifications.EventSubscription>(); 

    const setSoundRef = useAlarmSoundStore(s => s.setSoundRef);
    const isAlarmActive = useAlarmSoundStore(s => s.isAlarmRinging);
    const setAlarmActive = useAlarmSoundStore(s => s.setIsAlarmRinging)

    const isAppInForeGround = useAppStateStore(s => s.isAppInForeGround);
    const setIsAppInForeGround = useAppStateStore(s => s.setIsAppInForeGround);
    const setNfcPromptVisible = useNfcStore(s => s.setNfcPromptVisible);

    useEffect(() => {
        requestForPushNotification();

        async () => { await NfcManager.start(); }
    
        // Mount notification handler on initial render
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true
          }),
        });

        notificationListener.current = Notifications.addNotificationReceivedListener(() => {
          Notifications.cancelAllScheduledNotificationsAsync();
          Notifications.dismissAllNotificationsAsync();
          if (!isAlarmActive) {
            playSoundEndlessly();
          }
        });

        // When the user taps the notification…
        responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
            // Only play sound if alarm is not already active
            if (!isAlarmActive) {
              playSoundEndlessly();
            }
            // Show NFC prompt if not already visible
            if (!useNfcStore.getState().nfcPromptVisible) {
              setNfcPromptVisible(true);
            }
        });

        // Check if app is in Foreground
        setIsAppInForeGround(AppState.currentState === 'active');
          const subscription = AppState.addEventListener('change', async (nextState) => {
          const isForeground = nextState === 'active';
          setIsAppInForeGround(isForeground);
      
          if (isForeground) {
            // Cancel any pending alarms/alerts
            await Notifications.cancelAllScheduledNotificationsAsync();
            await Notifications.dismissAllNotificationsAsync();

            setTimeout(() => {
              const alarmDue = zustandStorage.getItem(STORAGE_KEYS.NEXT_ALARM_DUE);
              if (alarmDue) {
                const dueDate = new Date(alarmDue.toString());
                // Only show modal if alarm is due within the last 5 minutes and not already handled
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                if (dueDate >= fiveMinutesAgo && dueDate <= new Date() && !isAlarmActive) {
                  useAlarmSoundStore.getState().setIsAlarmRinging(true);
                  setNfcPromptVisible(true);
                } else {
                  // If alarm is past due by more than 5 minutes, clear it
                  zustandStorage.removeItem(STORAGE_KEYS.NEXT_ALARM_DUE);
                }
              }
            }, 200)
          }
        });

        return () => {
            if (notificationListener.current) {
              Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
              Notifications.removeNotificationSubscription(responseListener.current);
            }
            subscription.remove();
            setAlarmActive(false);
        }
      }, []);

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

      // Does not trigger when app is backgrounded
      async function playSoundEndlessly() {
        try {
          // Stop any existing sound first
          const currentSound = useAlarmSoundStore.getState().soundRef;
          if (currentSound) {
            await currentSound.stopAsync();
            await currentSound.unloadAsync();
          }

          const { sound } = await Audio.Sound.createAsync(
            require('../assets/sounds/ringtone.mp3'), 
            { shouldPlay: true, isLooping: true }
          );
          setSoundRef(sound);
          setAlarmActive(true);
        } catch (e) {
          console.log("Audio error", e);
        }
      }

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
        <Stack.Screen 
            name="testRun/testNFC"
            options={({ route }) => ({
                title: 'Test NFC',
                headerShown: false,
                animation: 'simple_push',
                animationDuration: 500,
            })}
        />
        <Stack.Screen 
            name="testRun/testPushNoti"
            options={({ route }) => ({
                title: 'Test Push Notification',
                headerShown: false,
                animation: 'simple_push',
                animationDuration: 500,
            })}
        />
        <Stack.Screen 
            name="testRun/testGesture"
            options={({ route }) => ({
                title: 'Test Gesture Handler',
                headerShown: false,
                animation: 'simple_push',
                animationDuration: 500,
            })}
        />
    </Stack>
    );
}