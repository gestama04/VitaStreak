import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Image,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { t } from '@/i18n'

interface WelcomeScreenProps {
  onContinue: () => void
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const aiGlowAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(aiGlowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(aiGlowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  const aiGlowOpacity = aiGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  })

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#312e81', '#155e75']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoSection}>
              <Image
                source={require('../assets/images/vitastreak-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.appName}>{t('common.appName')}</Text>
              <Text style={styles.tagline}>{t('welcome.tagline')}</Text>
            </View>

            <Animated.View
              style={[styles.aiHighlight, { opacity: aiGlowOpacity }]}
            >
              <View style={styles.aiContainer}>
                <MaterialCommunityIcons
                  name="robot-outline"
                  size={40}
                  color="#67e8f9"
                />

                <View style={styles.aiTextContainer}>
                  <Text style={styles.aiTitle}>{t('welcome.aiTitle')}</Text>
                  <Text style={styles.aiDescription}>
                    {t('welcome.aiDescription')}
                  </Text>
                </View>
              </View>
            </Animated.View>

            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>{t('welcome.title')}</Text>
              <Text style={styles.welcomeDescription}>
                {t('welcome.description')}
              </Text>
            </View>

            <View style={styles.featuresSection}>
              <Feature icon="pill" iconColor="#a78bfa" translationKey="supplements" />
              <Feature icon="calendar-check" iconColor="#22c55e" translationKey="routine" />
              <Feature icon="bell-ring" iconColor="#f59e0b" translationKey="notifications" />
              <Feature icon="robot-outline" iconColor="#06b6d4" translationKey="ai" />
              <Feature icon="chart-timeline-variant" iconColor="#ffffff" translationKey="history" />
            </View>

            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={onContinue}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  style={styles.buttonGradient}
                >
                  <MaterialCommunityIcons
                    name="rocket-launch"
                    size={24}
                    color="#7c3aed"
                  />
                  <Text style={styles.continueButtonText}>
                    {t('welcome.continue')}
                  </Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={22}
                    color="#7c3aed"
                  />
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.skipText}>{t('welcome.footer')}</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

type FeatureTranslationKey =
  | 'supplements'
  | 'routine'
  | 'notifications'
  | 'ai'
  | 'history'

function Feature({
  icon,
  iconColor,
  translationKey,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']
  iconColor: string
  translationKey: FeatureTranslationKey
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon} size={28} color={iconColor} />
      </View>

      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>
          {t(`welcome.features.${translationKey}.title`)}
        </Text>
        <Text style={styles.featureSubtitle}>
          {t(`welcome.features.${translationKey}.subtitle`)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: 40, paddingBottom: 44 },
  content: { alignItems: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 122, height: 122, marginBottom: 18 },
  appName: { fontSize: 36, fontWeight: '900', color: '#ffffff', textAlign: 'center', marginBottom: 8, textShadowColor: 'rgba(0, 0, 0, 0.35)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 6 },
  tagline: { fontSize: 17, color: 'rgba(255, 255, 255, 0.92)', textAlign: 'center', lineHeight: 24, fontWeight: '600' },
  aiHighlight: { width: '100%', marginBottom: 30 },
  aiContainer: { backgroundColor: 'rgba(124, 58, 237, 0.18)', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(34, 211, 238, 0.35)' },
  aiTextContainer: { flex: 1, marginLeft: 16 },
  aiTitle: { fontSize: 19, fontWeight: '800', color: '#ffffff', marginBottom: 6 },
  aiDescription: { fontSize: 14, color: 'rgba(255, 255, 255, 0.88)', lineHeight: 20 },
  welcomeSection: { alignItems: 'center', marginBottom: 32, paddingHorizontal: 16 },
  welcomeTitle: { fontSize: 32, fontWeight: '900', color: '#ffffff', marginBottom: 14, textAlign: 'center' },
  welcomeDescription: { fontSize: 17, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', lineHeight: 26 },
  featuresSection: { width: '100%', marginBottom: 42 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 8 },
  iconContainer: { width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(255, 255, 255, 0.16)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  featureTextContainer: { flex: 1 },
  featureTitle: { fontSize: 17, fontWeight: '800', color: '#ffffff', marginBottom: 4 },
  featureSubtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.78)', lineHeight: 19 },
  buttonSection: { alignItems: 'center', width: '100%' },
  continueButton: { borderRadius: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 14, marginBottom: 16 },
  buttonGradient: { paddingVertical: 18, paddingHorizontal: 34, borderRadius: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  continueButtonText: { fontSize: 20, fontWeight: '900', color: '#7c3aed' },
  skipText: { fontSize: 15, color: 'rgba(255, 255, 255, 0.82)', textAlign: 'center', marginTop: 10, fontWeight: '500', fontStyle: 'italic' },
})

export default WelcomeScreen
