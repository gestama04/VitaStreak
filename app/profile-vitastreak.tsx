import React, { useEffect, useState } from 'react'
import { withTimeout } from '../utils/withTimeout'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'

import { supabase } from '../supabase-config'
import { uploadImageToCloudinary } from '../cloudinary-service'
import { useAuth } from '../auth-context'
import useCustomAlert from '../hooks/useCustomAlert'
import { t } from '@/i18n'
import {
  getSupplements,
  getTodayDoseSummary,
  getSupplementStreak,
} from '../services/supplements/supplement-service'

export default function ProfileScreen() {
  const router = useRouter()
  const { currentUser, logout } = useAuth()
  const { showAlert, AlertComponent } = useCustomAlert()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [photoURL, setPhotoURL] = useState<string | null>(null)
  const [savingPhoto, setSavingPhoto] = useState(false)
  const [birthDate, setBirthDate] = useState('')
  const [totalSupplements, setTotalSupplements] = useState(0)
  const [todayCompleted, setTodayCompleted] = useState(0)
  const [todayPending, setTodayPending] = useState(0)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (!currentUser) return
    
    const firstName = currentUser.user_metadata?.first_name
const lastName = currentUser.user_metadata?.last_name
const fullNameFromParts = [firstName, lastName].filter(Boolean).join(' ')

setDisplayName(
  fullNameFromParts ||
  currentUser.user_metadata?.full_name ||
  currentUser.user_metadata?.name ||
  currentUser.user_metadata?.display_name ||
  t('profile.defaultName')
)
    setEmail(currentUser.email || '')
    setPhotoURL(
      currentUser.user_metadata?.avatar_url ||
        currentUser.user_metadata?.picture ||
        null
    )
    setBirthDate(
  currentUser.user_metadata?.birth_date ||
  currentUser.user_metadata?.date_of_birth ||
  currentUser.user_metadata?.birthday ||
  ''
)
    loadStats()
  }, [currentUser])

  const loadStats = async () => {
    try {
      const [supplements, todaySummary, currentStreak] = await Promise.all([
        getSupplements(),
        getTodayDoseSummary(),
        getSupplementStreak(),
      ])

      setTotalSupplements(supplements.length)
      setTodayCompleted(todaySummary.completed)
      setTodayPending(todaySummary.pending)
      setStreak(currentStreak)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      console.log('PROFILE PHOTO START')
      if (status !== 'granted') {
        showAlert(t('profile.permissionRequired'), t('profile.galleryPermission'), [
          { text: 'OK', onPress: () => {} },
        ])
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (result.canceled || !result.assets[0]) return

      setSavingPhoto(true)
      console.log('PROFILE PHOTO START')
      console.log('PROFILE BEFORE MANIPULATE')
      const manipResult = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      )
      console.log('PROFILE AFTER MANIPULATE:', manipResult.uri)
      console.log('PROFILE BEFORE BASE64')
      const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
        encoding: 'base64',
      })
      console.log('PROFILE AFTER BASE64:', base64.length)
      console.log('PROFILE BEFORE CLOUDINARY')
      const upload = await uploadImageToCloudinary(
  `data:image/jpeg;base64,${base64}`,
  'profiles'
)
console.log('PROFILE AFTER CLOUDINARY:', upload.secure_url)
console.log('PROFILE PHOTO UPLOADED:', upload.secure_url)
console.log('PROFILE BEFORE SUPABASE UPDATE')
      const { error } = await withTimeout(
  supabase.auth.updateUser({
    data: {
      display_name: displayName,
      avatar_url: upload.secure_url,
    },
  }),
  12000
)
      console.log('PROFILE AFTER SUPABASE UPDATE:', error)

      if (error) throw error
      console.log('PROFILE UPDATE DONE')
      setPhotoURL(upload.secure_url)
      

      showAlert(t('profile.success'), t('profile.photoUpdated'), [
        { text: 'OK', onPress: () => {} },
      ])
    } catch (error) {
      console.error('Erro ao atualizar foto:', error)
      showAlert(t('profile.error'), t('profile.photoUpdateError'), [
        { text: 'OK', onPress: () => {} },
      ])
    } finally {
      console.log('PROFILE PHOTO FINALLY')
      setSavingPhoto(false)
    }
  }

  const handleLogout = () => {
    showAlert(t('profile.logoutTitle'), t('profile.logoutMessage'), [
      { text: t('profile.cancel'), onPress: () => {} },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: async () => {
          await logout()
          router.replace('/login-vitastreak' as any)
        },
      },
    ])
  }

const sendPasswordReset = async () => {
  if (!email) return

  const { error } = await supabase.auth.resetPasswordForEmail(email)

  console.log('RESET ERROR:', error)

  if (error) {
    showAlert(t('profile.error'), t('profile.passwordEmailError'), [
      { text: 'OK', onPress: () => {} },
    ])
    return
  }

  showAlert(
    t('profile.emailSent'),
    t('profile.passwordCodeSent'),
    [
      {
        text: 'OK',
        onPress: () =>
          router.push({
            pathname: '/reset-password-code' as any,
            params: { email },
          }),
      },
    ]
  )
}

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#312e81', '#155e75']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t('profile.title')}</Text>
              <Text style={styles.subtitle}>{t('profile.subtitle')}</Text>
            </View>

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/settings-vitastreak' as any)}
            >
              <Ionicons name="settings-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileCard}>
            <TouchableOpacity
              style={styles.avatarBox}
              onPress={pickImage}
              disabled={savingPhoto}
            >
              {savingPhoto ? (
                <ActivityIndicator color="#22c55e" />
              ) : photoURL ? (
                <Image source={{ uri: photoURL }} style={styles.avatar} />
              ) : (
                <Text style={styles.avatarInitial}>
                  {(displayName || email || '?')[0].toUpperCase()}
                </Text>
              )}

              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>

            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{email}</Text>
            {birthDate ? (
  <Text style={styles.birthDate}>{t('profile.birthDate', { date: birthDate })}</Text>
) : null}
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statsTopRow}>
              <StatCard label={t('profile.streak')} value={`🔥 ${streak}`} />
              <StatCard label={t('profile.supplements')} value={`${totalSupplements}`} />
            </View>

            <View style={styles.todayStatCard}>
              <Text style={styles.todayStatValue}>
                {todayCompleted === 0 && todayPending === 0
                  ? t('profile.noDoses')
                  : t('profile.todaySummary', {
                      completed: todayCompleted,
                      completedLabel:
                        todayCompleted === 1
                          ? t('profile.doseCompletedSingular')
                          : t('profile.doseCompletedPlural'),
                      pending: todayPending,
                      pendingLabel:
                        todayPending === 1
                          ? t('profile.dosePendingSingular')
                          : t('profile.dosePendingPlural'),
                    })}
              </Text>
              <Text style={styles.statLabel}>{t('profile.today')}</Text>
            </View>
          </View>

          <View style={styles.menuCard}>
            <MenuItem
  icon="calendar-outline"
  title={t('profile.history')}
  onPress={() => router.push('/history' as any)}
/>
            <MenuItem
              icon="nutrition-outline"
              title={t('profile.mySupplements')}
              onPress={() => router.push('/supplements' as any)}
            />
            <MenuItem
  icon="key-outline"
  title={t('profile.changePassword')}
  onPress={sendPasswordReset}
/>
            <MenuItem
              icon="log-out-outline"
              title={t('profile.logoutTitle')}
              danger
              onPress={handleLogout}
            />
          </View>

          <Text style={styles.footer}>{t('profile.footer')}</Text>
        </ScrollView>

        <AlertComponent />
      </LinearGradient>
    </>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.62}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function MenuItem({
  icon,
  title,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  onPress: () => void
  danger?: boolean
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={23} color={danger ? '#fecaca' : '#c4b5fd'} />
      <Text style={[styles.menuText, danger && styles.dangerText]}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  content: {
    padding: 20,
    paddingTop: 58,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 26,
  },
  birthDate: {
  color: '#cbd5e1',
  fontSize: 14,
  marginTop: 6,
  fontWeight: '600',
},
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    marginTop: 4,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
  },
  avatarBox: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: 'rgba(124,58,237,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  avatarInitial: {
    color: 'white',
    fontSize: 44,
    fontWeight: '900',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
  },
  email: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  statsGrid: {
    gap: 10,
    marginBottom: 18,
  },
  statsTopRow: {
    flexDirection: 'row',
    gap: 10,
  },
  todayStatCard: {
    width: '100%',
    minHeight: 92,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayStatValue: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '700',
  },
  menuCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  menuText: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  dangerText: {
    color: '#fecaca',
  },
  footer: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 24,
    fontSize: 13,
    fontWeight: '700',
  },
})