// import { useState, useEffect, useRef } from 'react';
// import { Text, View, Button, Platform } from 'react-native';
// import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
// import Constants from 'expo-constants';

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// });

// /* NOTIFICATION WORKFLOW

//   1. User install app and grants permission for notification
//     # requestPermissionsAsync
//       - prompt user to grant permission on first mount
//     # getPermissionsAsync
//       - check status of permission
//     # getExpoPushTokenAsync
//       - obtains unqiue push token allowing targeted notifications to be sent to device

//   2. User sets up Notification Handler
//     # setNotificationHandler
//       - set the handler for notification

//   3. User customises Notification Channel
//     # getNotificationChannelsAsync
//       - get all notification channels
//     # setNotificationChannelAsync
//       - create a notification channel

//   4. User schedule a notification
//     # scheduleNotificationAsync
//       - schedule a notification

//   5. User receives notification
//     # addNotificationReceivedListener
//       - add a listener for notification received

//   6. User clicks notification
//     # addNotificationResponseReceivedListener
//       - add a listener for notification response
// */


// export default function App() {
//   const [expoPushToken, setExpoPushToken] = useState('');  
//   const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);  
//   const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);  
//   const notificationListener = useRef<Notifications.EventSubscription>();  // events when notification is received
//   const responseListener = useRef<Notifications.EventSubscription>();  // actions when notification is clicked

//   useEffect(() => {
//     registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

//     if (Platform.OS === 'android') {
//       Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
//     }
//     notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
//       setNotification(notification);
//     });

//     responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
//       console.log(response);
//     });

//     return () => {
//       notificationListener.current &&
//         Notifications.removeNotificationSubscription(notificationListener.current);
//       responseListener.current &&
//         Notifications.removeNotificationSubscription(responseListener.current);
//     };
//   }, []);

//   return (
//     <View
//       style={{
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'space-around',
//       }}>
//       <Text>Your expo push token: {expoPushToken}</Text>
//       <Text>{`Channels: ${JSON.stringify(
//         channels.map(c => c.id),
//         null,
//         2
//       )}`}</Text>
//       <View style={{ alignItems: 'center', justifyContent: 'center' }}>
//         <Text>Title: {notification && notification.request.content.title} </Text>
//         <Text>Body: {notification && notification.request.content.body}</Text>
//         <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
//       </View>
//       <Button
//         title="Press to schedule a notification"
//         onPress={async () => {
//           await schedulePushNotification();
//         }}
//       />
//     </View>
//   );
// }

// // Schedule a notification to be shown 2 seconds from now
// async function schedulePushNotification() {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: "You've got mail! 📬",
//       body: 'Here is the notification body',
//       data: { data: 'goes here', test: { test1: 'more data' } },
//     },
//     trigger: {
//       type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
//       seconds: 1,
//     },
//   });
// }

// async function registerForPushNotificationsAsync() {
//   let token;

//   if (Platform.OS === 'android') {
//     await Notifications.setNotificationChannelAsync('myNotificationChannel', {
//       name: 'A channel is needed for the permissions prompt to appear',
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: '#FF231F7C',
//     });
//   }

//   // Request permission to receive notifications
//   if (Device.isDevice) {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== 'granted') {
//       alert('Failed to get push token for push notification!');
//       return;
//     }
//     // Learn more about projectId:
//     // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
//     // EAS projectId is used here.
//     try {
//       const projectId =
//         Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
//       if (!projectId) {
//         throw new Error('Project ID not found');
//       }
//       token = (
//         await Notifications.getExpoPushTokenAsync({
//           projectId,
//         })
//       ).data;
//       console.log(token);
//     } catch (e) {
//       token = `${e}`;
//     }
//   } else {
//     alert('Must use physical device for Push Notifications');
//   }

//   return token;
// }


import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');  
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);  
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);  
  const notificationListener = useRef<Notifications.EventSubscription>();  // events when notification is received
  const responseListener = useRef<Notifications.EventSubscription>();  // actions when notification is clicked

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>
      <Text>Your expo push token: {expoPushToken}</Text>
      <Text>{`Channels: ${JSON.stringify(
        channels.map(c => c.id),
        null,
        2
      )}`}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification();
        }}
      />
    </View>
  );
}

// Schedule a notification to be shown 2 seconds from now
async function schedulePushNotification() {
  for (let i = 1; i <= 5; i++) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: 'Here is the notification body',
        data: { data: 'goes here', test: { test1: 'more data' } },
        sound: "default"
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: i * 4,
      },
    });
  }
}


