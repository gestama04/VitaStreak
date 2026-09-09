import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Platform,
  Linking,
  Image,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { isRunningInExpoGo } from 'expo'
import { useTheme } from '@/contexts/theme-context'
import useCustomAlert from '../hooks/useCustomAlert'
import { t } from '@/i18n'

interface InitialSetupScreenProps {
  onComplete: () => void
}

export default function InitialSetupScreen({ onComplete }: InitialSetupScreenProps) {
  const { currentTheme } = useTheme()
  const { showAlert, AlertComponent } = useCustomAlert()
  const router = useRouter()
  const [acceptedLegal, setAcceptedLegal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const handleContinueToWidget = () => {
    if (!acceptedLegal) {
      showAlert(
        t('setup.acceptanceRequired'),
        t('setup.acceptanceMessage'),
        [{ text: 'OK', onPress: () => {} }]
      )
      return
    }

    setCurrentStep(3)
  }

  const handleAddWidget = async () => {
    if (Platform.OS !== 'android') {
      onComplete()
      return
    }

    if (isRunningInExpoGo()) {
      showAlert(
        t('setup.widgetUnavailableTitle'),
        t('setup.widgetUnavailableMessage'),
        [{ text: t('setup.continue'), onPress: onComplete }]
      )
      return
    }

    setIsLoading(true)

    try {
      const { requestVitaStreakWidgetPin } = await import(
        '../widgets/vita-streak-widget-service'
      )

      const requestAccepted = await requestVitaStreakWidgetPin()

      if (!requestAccepted) {
        showAlert(
          t('setup.widgetManualTitle'),
          t('setup.widgetManualMessage'),
          [{ text: t('setup.continue'), onPress: onComplete }]
        )
        return
      }

      onComplete()
    } catch (error) {
      console.error('[VitaStreakWidget] Erro no pedido do widget:', error)
      showAlert(
        t('setup.widgetErrorTitle'),
        t('setup.widgetErrorMessage'),
        [{ text: t('setup.continue'), onPress: onComplete }]
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipWidget = () => {
    onComplete()
  }

  const renderWelcomeSlide = () => (
    <View style={styles.slideContainer}>
      <View style={styles.header}>
        <Image
          source={require('../assets/images/vitastreak-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={[styles.title, currentTheme === 'dark' ? styles.darkText : styles.lightText]}>
          {t('setup.screenTitle')}
        </Text>

        <Text style={[styles.subtitle, currentTheme === 'dark' ? styles.darkTextSecondary : styles.lightTextSecondary]}>
          {t('setup.screenSubtitle')}
        </Text>
      </View>

      <View style={styles.welcomeContent}>
        <MaterialCommunityIcons name="pill" size={78} color="#7c3aed" />

        <Text style={[styles.welcomeTitle, currentTheme === 'dark' ? styles.darkText : styles.lightText]}>
          {t('setup.welcome')}
        </Text>

        <Text style={[styles.welcomeDescription, currentTheme === 'dark' ? styles.darkTextSecondary : styles.lightTextSecondary]}>
          {t('setup.welcomeDescription')}
        </Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="calendar-check" size={24} color="#22c55e" />
            <Text style={[styles.featureText, currentTheme === 'dark' ? styles.darkText : styles.lightText]}>
              {t('setup.dailyRoutine')}
            </Text>
          </View>

          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="bell-ring" size={24} color="#f59e0b" />
            <Text style={[styles.featureText, currentTheme === 'dark' ? styles.darkText : styles.lightText]}>
              {t('setup.customReminders')}
            </Text>
          </View>

          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="robot-outline" size={24} color="#38bdf8" />
            <Text style={[styles.featureText, currentTheme === 'dark' ? styles.darkText : styles.lightText]}>
              {t('setup.aiAnalysis')}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={() => setCurrentStep(2)}>
        <Text style={styles.nextButtonText}>{t('setup.startSetup')}</Text>
        <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  )

const openBatterySettings = async () => {
  if (Platform.OS !== 'android') return

  try {
    await Linking.openSettings()
  } catch (error) {
    console.error('Erro ao abrir definições:', error)
  }
}

const renderNotificationSettings = () => (
  <View style={styles.slideContainer}>
    <View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, styles.progressFillStepTwo]} />
        </View>
        <Text style={[styles.progressText, currentTheme === 'dark' ? styles.darkTextSecondary : styles.lightTextSecondary]}>
          {t('setup.stepTwo')}
        </Text>
      </View>

      <View style={styles.stepHeader}>
        <MaterialCommunityIcons name="bell-ring" size={70} color="#7c3aed" />

        <Text style={[styles.stepTitle, currentTheme === 'dark' ? styles.darkText : styles.lightText]}>
          {t('setup.notifications')}
        </Text>

        <Text style={[styles.stepDescription, currentTheme === 'dark' ? styles.darkTextSecondary : styles.lightTextSecondary]}>
          {t('setup.notificationsDescription')}
        </Text>
      </View>

      <View style={[styles.settingCard, currentTheme === 'dark' ? styles.darkCard : styles.lightCard]}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, currentTheme === 'dark' ? styles.darkText : styles.lightText]}>
              {t('setup.enableReminders')}
            </Text>
            <Text style={[styles.settingHelper, currentTheme === 'dark' ? styles.darkTextSecondary : styles.lightTextSecondary]}>
              {t('setup.changeLater')}
            </Text>
          </View>

          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#64748b', true: '#7c3aed' }}
            thumbColor={notificationsEnabled ? '#22c55e' : '#f4f3f4'}
          />
        </View>

        <View style={styles.legalBox}>
          <TouchableOpacity onPress={() => router.push('/legal-vitastreak' as any)}>
            <Text style={styles.legalLink}>{t('setup.viewLegal')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.legalRow}
            onPress={() => setAcceptedLegal(!acceptedLegal)}
          >
            <View style={[styles.checkbox, acceptedLegal && styles.checkboxActive]}>
              {acceptedLegal ? (
                <MaterialCommunityIcons name="check" size={16} color="white" />
              ) : null}
            </View>

            <Text style={[styles.legalText, currentTheme === 'dark' ? styles.darkTextSecondary : styles.lightTextSecondary]}>
              {t('setup.acceptLegal')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="clock-outline" size={22} color="#38bdf8" />
          <Text style={styles.infoText}>
            {t('setup.scheduleInfo')}
          </Text>
        </View>
        {Platform.OS === 'android' ? (
  <View style={styles.infoBox}>
    <MaterialCommunityIcons name="battery-heart" size={22} color="#facc15" />
    <View style={{ flex: 1 }}>
      <Text style={styles.infoText}>
        {t('setup.batteryInfo')}
      </Text>

      <TouchableOpacity style={styles.batteryButton} onPress={openBatterySettings}>
        <Text style={styles.batteryButtonText}>{t('setup.improveNotifications')}</Text>
      </TouchableOpacity>
    </View>
  </View>
) : null}
      </View>
    </View>
    <View>
      <View style={styles.stepButtons}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentStep(1)}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#7c3aed" />
          <Text style={styles.backButtonText}>{t('setup.back')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.finishButton, isLoading && styles.disabledButton]}
          onPress={handleContinueToWidget}
          disabled={isLoading}
        >
          <Text style={styles.finishButtonText}>
            {t('setup.continue')}
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
)


const renderWidgetStep = () => (
  <View style={styles.slideContainer}>
    <View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, styles.progressFillComplete]} />
        </View>
        <Text
          style={[
            styles.progressText,
            currentTheme === 'dark'
              ? styles.darkTextSecondary
              : styles.lightTextSecondary,
          ]}
        >
          {t('setup.stepThree')}
        </Text>
      </View>

      <View style={styles.stepHeader}>
        <MaterialCommunityIcons
          name="widgets-outline"
          size={70}
          color="#7c3aed"
        />

        <Text
          style={[
            styles.stepTitle,
            currentTheme === 'dark' ? styles.darkText : styles.lightText,
          ]}
        >
          {t('setup.widgetTitle')}
        </Text>

        <Text
          style={[
            styles.stepDescription,
            currentTheme === 'dark'
              ? styles.darkTextSecondary
              : styles.lightTextSecondary,
          ]}
        >
          {t('setup.widgetDescription')}
        </Text>
      </View>

      <View style={styles.widgetPreview}>
        <View style={styles.widgetPreviewTop}>
          <Text style={styles.widgetAppName}>VitaStreak</Text>
          <Text style={styles.widgetStreak}>🔥 0</Text>
        </View>

        <View style={styles.widgetPreviewProgressRow}>
          <Text style={styles.widgetMutedText}>{t('setup.widgetToday')}</Text>
          <Text style={styles.widgetPercent}>0%</Text>
        </View>

        <Text style={styles.widgetStatusText}>
          {t('setup.widgetEmptyStatus')}
        </Text>

        <View style={styles.widgetProgressTrack}>
          <View style={styles.widgetProgressValue} />
        </View>
      </View>

      <View style={styles.widgetHintBox}>
        <MaterialCommunityIcons name="gesture-tap" size={22} color="#38bdf8" />
        <Text style={styles.widgetHintText}>{t('setup.widgetTapHint')}</Text>
      </View>
    </View>

    <View>
      <TouchableOpacity
        style={[styles.widgetAddButton, isLoading && styles.disabledButton]}
        onPress={handleAddWidget}
        disabled={isLoading}
      >
        <MaterialCommunityIcons name="plus-box-outline" size={22} color="#fff" />
        <Text style={styles.widgetAddButtonText}>
          {isLoading ? t('setup.saving') : t('setup.addWidget')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.widgetLaterButton} onPress={handleSkipWidget}>
        <Text
          style={[
            styles.widgetLaterText,
            currentTheme === 'dark'
              ? styles.darkTextSecondary
              : styles.lightTextSecondary,
          ]}
        >
          {t('setup.maybeLater')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.widgetBackButton} onPress={() => setCurrentStep(2)}>
        <MaterialCommunityIcons name="arrow-left" size={18} color="#7c3aed" />
        <Text style={styles.widgetBackButtonText}>{t('setup.back')}</Text>
      </TouchableOpacity>
    </View>
  </View>
)


  return (
    <SafeAreaView style={[styles.container, currentTheme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
      <StatusBar barStyle={currentTheme === 'dark' ? 'light-content' : 'dark-content'} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {currentStep === 1
          ? renderWelcomeSlide()
          : currentStep === 2
            ? renderNotificationSettings()
            : renderWidgetStep()}
      </ScrollView>

      <AlertComponent />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: '#0f172a' },
  lightContainer: { backgroundColor: '#f8fafc' },
  scrollContent: {
  flexGrow: 1,
  padding: 20,
  paddingTop: 22,
  paddingBottom: 24,
},
  slideContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  legalBox: {
  marginTop: 16,
  marginBottom: 0,
},
legalRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 10,
  marginBottom: 10,
},
checkbox: {
  width: 24,
  height: 24,
  borderRadius: 7,
  borderWidth: 2,
  borderColor: '#7c3aed',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 1,
},
checkboxActive: {
  backgroundColor: '#7c3aed',
},
batteryButton: {
  marginTop: 10,
  backgroundColor: 'rgba(255, 0, 0, 0.18)',
  borderWidth: 1,
  borderColor: 'rgba(255, 0, 0, 0.45)',
  borderRadius: 14,
  paddingVertical: 10,
  paddingHorizontal: 12,
  alignSelf: 'flex-start',
},
batteryButtonText: {
  color: '#ff0000',
  fontSize: 13,
  fontWeight: '900',
},
legalText: {
  flex: 1,
  fontSize: 14,
  lineHeight: 20,
},
legalLink: {
  color: '#67e8f9',
  fontSize: 14,
  fontWeight: '800',
  textDecorationLine: 'underline',
  marginBottom: 14
},
  logo: {
    width: 120,
    height: 120,
    marginBottom: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 12,
  },
  welcomeDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 34,
  },
  featuresList: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 14,
  },
  progressContainer: {
  marginBottom: 20,
},
  progressBar: {
    height: 5,
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 3,
  },
  progressFillStepTwo: {
    width: '67%',
  },
  progressFillComplete: {
    width: '100%',
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  stepHeader: {
  alignItems: 'center',
  marginBottom: 22,
},
  stepTitle: {
  fontSize: 30,
  fontWeight: '900',
  marginTop: 12,
  marginBottom: 8,
  textAlign: 'center',
},
stepDescription: {
  fontSize: 15,
  textAlign: 'center',
  lineHeight: 22,
},
settingCard: {
  borderRadius: 22,
  padding: 18,
  marginBottom: 18,
},
  darkCard: { backgroundColor: '#1e293b' },
  lightCard: { backgroundColor: '#ffffff' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  settingHelper: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoBox: {
  flexDirection: 'row',
  backgroundColor: 'rgba(56, 189, 248, 0.12)',
  borderRadius: 16,
  padding: 12,
  marginTop: 12,
  gap: 10,
},
  infoText: {
    flex: 1,
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: '#7c3aed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 18,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  stepButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#7c3aed',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '800',
  },
  finishButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.6,
  },
  skipButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 12,
  },
  skipText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  widgetPreview: {
    backgroundColor: '#0b1430',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 24,
    padding: 18,
    marginTop: 8,
  },
  widgetPreviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  widgetAppName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  widgetStreak: {
    color: '#ff5a4f',
    fontSize: 18,
    fontWeight: '900',
  },
  widgetPreviewProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  widgetMutedText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  widgetPercent: {
    color: '#7dd3fc',
    fontSize: 14,
    fontWeight: '900',
  },
  widgetStatusText: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    marginTop: 8,
  },
  widgetProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1e293b',
    overflow: 'hidden',
    marginTop: 13,
  },
  widgetProgressValue: {
    width: 6,
    height: '100%',
    backgroundColor: '#7dd3fc',
  },
  widgetHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.10)',
    borderRadius: 16,
    padding: 13,
    marginTop: 14,
  },
  widgetHintText: {
    flex: 1,
    color: '#7dd3fc',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  widgetAddButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#7c3aed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  widgetAddButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  widgetLaterButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  widgetLaterText: {
    fontSize: 14,
    fontWeight: '800',
  },
  widgetBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 8,
  },
  widgetBackButtonText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '900',
  },
  darkText: { color: '#ffffff' },
  lightText: { color: '#0f172a' },
  darkTextSecondary: { color: '#cbd5e1' },
  lightTextSecondary: { color: '#475569' },
})