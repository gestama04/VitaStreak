import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StatusBar,
} from 'react-native'
import { Stack, useRouter, useFocusEffect } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import {
  getSupplementHistoryDays,
  SupplementHistoryDay,
} from '../services/supplements/supplement-service'
import { i18n, t } from '@/i18n'

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    i18n.locale === 'pt' ? 'pt-PT' : 'en-US',
    { weekday: 'long', day: 'numeric', month: 'long' }
  )
}

function formatTakenTime(value: string | null) {
  if (!value) return t('history.unknownTime')

  return new Date(value).toLocaleTimeString(
    i18n.locale === 'pt' ? 'pt-PT' : 'en-US',
    { hour: '2-digit', minute: '2-digit' }
  )
}

export default function HistoryScreen() {
  const router = useRouter()
  const [days, setDays] = useState<SupplementHistoryDay[]>([])
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const loadHistory = async () => {
    try {
      setLoading(true)
      setHasError(false)
      const data = await getSupplementHistoryDays(30)
      setDays(data)
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
      setHasError(true)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadHistory()
    }, [])
  )

  const completedDoses = days.reduce((total, day) => total + day.takes.length, 0)

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
              <Text style={styles.title}>{t('history.title')}</Text>
              <Text style={styles.subtitle}>{t('history.subtitle')}</Text>
            </View>
          </View>

          {!loading && !hasError && days.length > 0 ? (
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{completedDoses}</Text>
                <Text style={styles.summaryLabel}>{t('history.completedDoses')}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{days.length}</Text>
                <Text style={styles.summaryLabel}>{t('history.activeDays')}</Text>
              </View>
            </View>
          ) : null}

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#22c55e" size="large" />
              <Text style={styles.loadingText}>{t('history.loading')}</Text>
            </View>
          ) : hasError ? (
            <View style={styles.emptyCard}>
              <Ionicons name="alert-circle-outline" size={42} color="#fca5a5" />
              <Text style={styles.emptyTitle}>{t('history.errorTitle')}</Text>
              <Text style={styles.emptyText}>{t('history.errorMessage')}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadHistory}>
                <Text style={styles.retryButtonText}>{t('history.retry')}</Text>
              </TouchableOpacity>
            </View>
          ) : days.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={42} color="#c4b5fd" />
              <Text style={styles.emptyTitle}>{t('history.emptyTitle')}</Text>
              <Text style={styles.emptyText}>{t('history.emptyMessage')}</Text>
            </View>
          ) : (
            days.map((day) => (
              <View key={day.date} style={styles.dayCard}>
                <Text style={styles.dayTitle}>{formatDate(day.date)}</Text>

                {day.takes.map((item) => (
                  <View key={item.id} style={styles.logRow}>
                    {item.supplement.photo_url ? (
                      <Image source={{ uri: item.supplement.photo_url }} style={styles.image} />
                    ) : (
                      <View style={styles.iconBox}>
                        <MaterialCommunityIcons name="pill" size={22} color="#7dd3fc" />
                      </View>
                    )}

                    <View style={{ flex: 1 }}>
                      <Text style={styles.name} numberOfLines={1}>
                        {item.supplement.name ?? t('history.unknownSupplement')}
                      </Text>
                      {item.supplement.brand ? (
                        <Text style={styles.brand} numberOfLines={1}>
                          {item.supplement.brand}
                        </Text>
                      ) : null}
                      <Text style={styles.meta}>
                        {t('history.scheduledAt', { time: item.reminder_time || t('history.unknownTime') })}
                      </Text>
                      <Text style={styles.takenTime}>
                        {t('history.takenAt', { time: formatTakenTime(item.taken_at) })}
                      </Text>
                      {item.deleted ? (
                        <Text style={styles.deletedText}>{t('history.deletedSupplement')}</Text>
                      ) : null}
                    </View>

                    <View style={styles.checkBox}>
                      <Ionicons name="checkmark" size={20} color="#052e16" />
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  content: { padding: 20, paddingTop: 58, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  title: { color: 'white', fontSize: 34, fontWeight: '900' },
  subtitle: { color: '#cbd5e1', fontSize: 14, marginTop: 4, lineHeight: 20 },
  summaryCard: { flexDirection: 'row', backgroundColor: 'rgba(15,23,42,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: 22, padding: 18, marginBottom: 18 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNumber: { color: '#7dd3fc', fontSize: 28, fontWeight: '900' },
  summaryLabel: { color: '#cbd5e1', fontSize: 13, fontWeight: '700', marginTop: 3, textAlign: 'center' },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.14)', marginHorizontal: 12 },
  loadingBox: { backgroundColor: 'rgba(15,23,42,0.72)', borderRadius: 22, padding: 24, alignItems: 'center' },
  loadingText: { color: '#cbd5e1', marginTop: 12, fontWeight: '700' },
  emptyCard: { backgroundColor: 'rgba(15,23,42,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: 24, padding: 22, alignItems: 'center' },
  emptyTitle: { color: 'white', fontSize: 20, fontWeight: '900', marginTop: 12 },
  emptyText: { color: '#cbd5e1', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  retryButton: { backgroundColor: '#7c3aed', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, marginTop: 16 },
  retryButtonText: { color: 'white', fontWeight: '900' },
  dayCard: { backgroundColor: 'rgba(15,23,42,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: 24, padding: 16, marginBottom: 16 },
  dayTitle: { color: 'white', fontSize: 18, fontWeight: '900', textTransform: 'capitalize', marginBottom: 12 },
  logRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30,41,59,0.85)', borderRadius: 18, padding: 12, marginBottom: 10, gap: 12 },
  image: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#1e293b' },
  iconBox: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(125,211,252,0.14)', justifyContent: 'center', alignItems: 'center' },
  name: { color: 'white', fontSize: 16, fontWeight: '900' },
  brand: { color: '#cbd5e1', fontSize: 13, marginTop: 2 },
  meta: { color: '#94a3b8', fontSize: 13, marginTop: 5 },
  takenTime: { color: '#86efac', fontSize: 13, marginTop: 2, fontWeight: '700' },
  deletedText: { color: '#fbbf24', fontSize: 12, marginTop: 5, fontWeight: '800' },
  checkBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#22c55e', justifyContent: 'center', alignItems: 'center' },
})
