import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Linking,
} from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { rescheduleAllSupplementNotifications } from '../services/supplements/supplement-service'
import { supabase } from '../supabase-config'
import useCustomAlert from '../hooks/useCustomAlert'
import { t } from '@/i18n'
import { useLanguage } from './language-context'
import type { LanguagePreference } from '../services/language-service'

function hasErrorContext(error: unknown): error is {
  context: { text: () => Promise<string> }
} {
  if (typeof error !== 'object' || error === null || !('context' in error)) {
    return false
  }

  const context = (error as { context?: unknown }).context
  return (
    typeof context === 'object' &&
    context !== null &&
    'text' in context &&
    typeof (context as { text?: unknown }).text === 'function'
  )
}

export default function SettingsScreen() {
  const router = useRouter()
  const { showAlert, AlertComponent } = useCustomAlert()
  const { languagePreference, setLanguagePreference } = useLanguage()

  const getLanguageLabel = (preference: LanguagePreference) => {
    if (preference === 'pt') return t('settings.languagePortuguese')
    if (preference === 'en') return t('settings.languageEnglish')
    return t('settings.languageAutomatic')
  }

  const chooseLanguage = () => {
    const choose = (preference: LanguagePreference) => {
      void setLanguagePreference(preference)
    }

    showAlert(t('settings.chooseLanguage'), t('settings.chooseLanguageMessage'), [
      {
        text: (languagePreference === 'system' ? '✓ ' : '') + t('settings.languageAutomatic'),
        onPress: () => choose('system'),
      },
      {
        text: (languagePreference === 'pt' ? '✓ ' : '') + t('settings.languagePortuguese'),
        onPress: () => choose('pt'),
      },
      {
        text: (languagePreference === 'en' ? '✓ ' : '') + t('settings.languageEnglish'),
        onPress: () => choose('en'),
      },
      {
        text: t('settings.cancel'),
        style: 'cancel',
        onPress: () => {},
      },
    ])
  }

  const deleteAccount = () => {
  showAlert(
  t('settings.deleteAccountTitle'),
  t('settings.deleteAccountMessage'),
    [
      { text: t('settings.cancel'), onPress: () => {} },
      {
        text: t('settings.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.functions.invoke('delete-user')

            if (error) throw error

            await supabase.auth.signOut()
            router.replace('/login-vitastreak' as any)
          } catch (error: unknown) {
  console.error('Erro ao apagar conta:', error)

  if (hasErrorContext(error)) {
    const body = await error.context.text()
    console.error('DELETE USER FUNCTION BODY:', body)
  }

  showAlert(t('settings.error'), t('settings.deleteAccountError'), [
    { text: 'OK', onPress: () => {} },
  ])
}
        },
      },
    ]
  )
}

const openBatterySettings = async () => {
  if (Platform.OS !== 'android') return

  try {
    await Linking.openSettings()
  } catch (error) {
    console.error('Erro ao abrir definições:', error)
  }
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
              <Text style={styles.title}>{t('settings.title')}</Text>
              <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('settings.application')}</Text>

            <SettingItem
              icon="language-outline"
              title={t('settings.language')}
              subtitle={getLanguageLabel(languagePreference)}
              onPress={chooseLanguage}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('settings.routine')}</Text>

            <SettingItem
              icon="notifications-outline"
              title={t('settings.notifications')}
              subtitle={t('settings.notificationsSubtitle')}
            />

            <SettingItem
              icon="time-outline"
              title={t('settings.dosesPerDay')}
              subtitle={t('settings.dosesPerDaySubtitle')}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('settings.account')}</Text>

            <SettingItem
              icon="trash-outline"
              title={t('settings.deleteAccountTitle')}
              subtitle={t('settings.deleteAccountSubtitle')}
              danger
              onPress={deleteAccount}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('settings.about')}</Text>

            <SettingItem
              icon="mail-outline"
              title={t('settings.contactSupport')}
              subtitle={t('settings.sendEmail')}
              onPress={() => Linking.openURL('mailto:benigestama@gmail.com')}
            />
            <SettingItem
  icon="document-text-outline"
  title={t('settings.privacyAndTerms')}
  subtitle={t('settings.privacyAndTermsSubtitle')}
  onPress={() => router.push('/legal-vitastreak' as any)}
/>
            <SettingItem
              icon="information-circle-outline"
              title={t('settings.version')}
              subtitle="VitaStreak 1.0.0"
            />
          </View>
<View style={styles.card}>
  <Text style={styles.sectionTitle}>{t('settings.help')}</Text>
    {Platform.OS === 'android' ? (
  <SettingItem
    icon="battery-charging-outline"
    title={t('settings.improveNotifications')}
    subtitle={t('settings.improveNotificationsSubtitle')}
    onPress={openBatterySettings}
  />
) : null}
  <SettingItem
    icon="build-outline"
    title={t('settings.repairNotifications')}
    subtitle={t('settings.repairNotificationsSubtitle')}
    onPress={async () => {
      try {
        await rescheduleAllSupplementNotifications()
        showAlert(t('settings.notificationsRepaired'), t('settings.notificationsRepairedMessage'), [
          { text: 'OK', onPress: () => {} },
        ])
      } catch (error) {
        console.error('Erro ao reagendar notificações:', error)
        showAlert(t('settings.error'), t('settings.repairNotificationsError'), [
          { text: 'OK', onPress: () => {} },
        ])
      }
    }}
  />

  <Text style={styles.helpText}>
    {t('settings.androidBatteryHelp')}
  </Text>
</View>
          <Text style={styles.footer}>2026 © VitaStreak</Text>
        </ScrollView>

        <AlertComponent />
      </LinearGradient>
    </>
  )
}

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle: string
  onPress?: () => void
  danger?: boolean
}) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={[styles.iconBox, danger && styles.dangerIconBox]}>
        <Ionicons name={icon} size={22} color={danger ? '#fecaca' : '#c4b5fd'} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.settingTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>

      {onPress ? (
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      ) : null}
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
  helpText: {
  color: '#94a3b8',
  fontSize: 12,
  lineHeight: 18,
  marginTop: 6,
},
  backButton: {
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
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: 'rgba(124,58,237,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerIconBox: {
    backgroundColor: 'rgba(239,68,68,0.18)',
  },
  settingTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
  },
  settingSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  dangerText: {
    color: '#fecaca',
  },
  footer: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
  },
})