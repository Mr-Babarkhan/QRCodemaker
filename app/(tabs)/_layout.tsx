import { Tabs } from 'expo-router';
import { Home, QrCode, History, Settings, Scan } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import { requestPermission, getFCMToken, refreshToken } from '@/components/notifications/firebase';
import { useEffect } from 'react';
export default function TabLayout() {
  const insets = useSafeAreaInsets();
useEffect(() => {
          const initFirebase = async () => {
            requestPermission();
        console.log('VoiceChangerScreen rendered');
            getFCMToken().then(token => {
              console.log(token);
              
            });
          
            refreshToken();
            // Check whether initial notification is available
            messaging()
              .getInitialNotification()
              .then(remoteMessage => {
                if (remoteMessage) {
                  console.log(
                    'Notification caused app to open from quit state:',
                    remoteMessage.notification,
                  );
                }
              });
      
            // Assume a message notification contains a data property in the payload
            messaging().onNotificationOpenedApp(remoteMessage => {
              console.log(
                'Notification caused app to open from background state:',
                remoteMessage.notification,
              );
            });
      
            // Register background handler
            messaging().setBackgroundMessageHandler(async remoteMessage => {
              console.log('Message handled in the background!', remoteMessage);
            });
      
            const unsubscribe = messaging().onMessage(async remoteMessage => {
              console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
            });
      
            return unsubscribe;
          };
      
          initFirebase(); // Call the async function
      
          // Clean up the onMessage listener
          return () => {
            const unsubscribe = messaging().onMessage(() => {});
            unsubscribe();
          };
        }, []);
    
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#f8fafc',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 5,
          height: 75,
          marginBottom: 1
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="generator"
        options={{
          title: 'Generate',
          tabBarIcon: ({ size, color }) => (
            <QrCode size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ size, color }) => (
            <Scan size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ size, color }) => (
            <History size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}