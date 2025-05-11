import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Audio } from 'expo-av';
import { useAlarmSoundStore } from '../stores/soundStore';
 

export default function Layout() {
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);  
    const notificationListener = useRef<Notifications.EventSubscription>();  
    const responseListener = useRef<Notifications.EventSubscription>(); 

    const setSoundRef = useAlarmSoundStore(s => s.setSoundRef);


    useEffect(() => {
        requestForPushNotification();
    
        // Mount notification handler on initial render
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: true,
          }),
        });

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          setNotification(notification);
          playSoundEndlessly()
        });
    
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
        });

        return () => {
            if (notificationListener.current) {
              Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
              Notifications.removeNotificationSubscription(responseListener.current);
            }
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

      async function playSoundEndlessly() {
        try {
          const { sound } = await Audio.Sound.createAsync(
            require('../assets/sounds/netflix.mp3'), 
            { shouldPlay: true, isLooping: true }
          );
          setSoundRef(sound);
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
        {/* <Stack.Screen 
            name="testRun/testPushNoti"
            options={({ route }) => ({
                title: 'Test Push Notification',
                headerShown: false,
                animation: 'simple_push',
                animationDuration: 500,
            })}
        /> */}
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