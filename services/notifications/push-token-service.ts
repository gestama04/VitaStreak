import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { isRunningInExpoGo } from 'expo'
import { supabase } from '../../supabase-config'

export async function registerPushToken() {
  if (isRunningInExpoGo()) {
    console.log(
      '[PUSH_TOKEN] Registo de push remoto ignorado no Expo Go'
    )
    return null
  }

  if (!Device.isDevice) {
    console.log('[PUSH_TOKEN] Só funciona em dispositivo físico')
    return null
  }

  const Notifications = await import('expo-notifications')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log('[PUSH_TOKEN] Sem utilizador autenticado')
    return null
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync()

  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } =
      await Notifications.requestPermissionsAsync()

    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('[PUSH_TOKEN] Permissão negada')
    return null
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('supplements', {
      name: 'Suplementos',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      lightColor: '#22c55e',
      lockscreenVisibility:
        Notifications.AndroidNotificationVisibility.PUBLIC,
    })
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId

  if (!projectId) {
    throw new Error('EAS projectId em falta')
  }

  const tokenResult =
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })

  const token = tokenResult.data

  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      {
        user_id: user.id,
        token,
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,token',
      }
    )

  if (error) throw error

  console.log('[PUSH_TOKEN] Guardado:', token)

  return token
}