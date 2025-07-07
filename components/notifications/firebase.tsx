import messaging from '@react-native-firebase/messaging';
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';

let isAndroid = Platform.OS === 'android';

const getFCMToken = async () => {
    let token: string;
    token = await messaging().getToken()
    return token;
}

const requestPermission = async () => {

    // let status: any;

    if (isAndroid)
        await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS')
    else
        await messaging().requestPermission();

    // if (status !== 'granted' && isAndroid) {
    //     Alert
    //         .alert('Permission required', 'Notification permission is required', [
    //             {
    //                 text: 'Open Setting',
    //                 onPress: () => Linking.openSettings()
    //             },
    //             {
    //                 text: 'Cancel'
    //             }
    //         ])
    // } else if (status !== messaging.AuthorizationStatus.AUTHORIZED && !isAndroid) {
    //     Alert
    //         .alert('Permission required', 'Notification permission is required', [
    //             {
    //                 text: 'Open Setting',
    //                 onPress: () => Linking.openSettings()
    //             },
    //             {
    //                 text: 'Cancel'
    //             }
    //         ])
    // }
}

const refreshToken = () => {
    messaging().onTokenRefresh(newToken => {
        // update(token to your server or do anything)
    })
}

export {
    getFCMToken,
    requestPermission,
    refreshToken
}