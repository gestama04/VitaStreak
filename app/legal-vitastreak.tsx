import React from 'react'
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  View,
} from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { t } from '@/i18n'

export default function LegalVitaStreakScreen() {
  const router = useRouter()

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
              <Text style={styles.title}>{t('legal.title')}</Text>
              <Text style={styles.subtitle}>{t('legal.lastUpdated')}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('legal.privacyTitle')}</Text>
            <Text style={styles.text}>{t('legal.privacyIntro')}</Text>

            <LegalSection title={t('legal.storedDataTitle')} text={t('legal.storedDataText')} />
            <LegalSection title={t('legal.dataUseTitle')} text={t('legal.dataUseText')} />
            <LegalSection title={t('legal.aiImagesTitle')} text={t('legal.aiImagesText')} />
            <LegalSection title={t('legal.externalServicesTitle')} text={t('legal.externalServicesText')} />
            <Text style={[styles.text, styles.paragraph]}>{t('legal.aiDisclaimer')}</Text>
            <LegalSection title={t('legal.accountDeletionTitle')} text={t('legal.accountDeletionText')} />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('legal.termsTitle')}</Text>
            <Text style={styles.text}>{t('legal.termsIntro')}</Text>

            <LegalSection title={t('legal.userResponsibilityTitle')} text={t('legal.userResponsibilityText')} />
            <LegalSection title={t('legal.remindersTitle')} text={t('legal.remindersText')} />
            <LegalSection title={t('legal.properUseTitle')} text={t('legal.properUseText')} />
            <LegalSection title={t('legal.changesTitle')} text={t('legal.changesText')} />
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  )
}

function LegalSection({ title, text }: { title: string; text: string }) {
  return (
    <>
      <Text style={styles.heading}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  content: { padding: 20, paddingTop: 58, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  title: { color: 'white', fontSize: 30, fontWeight: '900' },
  subtitle: { color: '#cbd5e1', fontSize: 14, marginTop: 4 },
  card: { backgroundColor: 'rgba(15, 23, 42, 0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: 24, padding: 18, marginBottom: 18 },
  sectionTitle: { color: 'white', fontSize: 22, fontWeight: '900', marginBottom: 14 },
  heading: { color: 'white', fontSize: 16, fontWeight: '900', marginTop: 14, marginBottom: 6 },
  text: { color: '#cbd5e1', fontSize: 14, lineHeight: 21 },
  paragraph: { marginTop: 14 },
})
