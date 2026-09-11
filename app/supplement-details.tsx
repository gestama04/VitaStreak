import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getSupplementById } from '../services/supplements/supplement-service'
import { Supplement } from '../types/supplements/supplement'
import { t, i18n } from '@/i18n'

function formatDate(value?: string | null) {
  if (!value) return null

  return new Date(value).toLocaleString(
    i18n.locale === 'pt' ? 'pt-PT' : 'en-US',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  )
}

function formatTimes(supplement: Supplement) {
  const times =
    Array.isArray(supplement.reminder_times) && supplement.reminder_times.length > 0
      ? supplement.reminder_times
      : supplement.reminder_time
        ? [supplement.reminder_time]
        : []

  if (times.length === 0) return t('supplementDetails.noTime')

  return times
    .map((time) => String(time).slice(0, 5))
    .sort((a, b) => a.localeCompare(b))
    .join(', ')
}

function formatFrequency(supplement: Supplement) {
  const frequency = supplement.frequency_type ?? 'daily'

  if (frequency === 'daily') {
    return t('supplementDetails.everyDay')
  }

  if (frequency === 'every_other_day') {
    return t('supplementDetails.everyOtherDay')
  }

  if (frequency === 'custom_interval') {
    const interval = supplement.interval_days ?? 1

    return interval === 1
      ? t('supplementDetails.everyDay')
      : t('supplementDetails.everyNDays', { count: interval })
  }

  const days = supplement.days_of_week

  if (!days || days.length === 0) {
    return t('supplementDetails.noDays')
  }

  if (days.length === 7) {
    return t('supplementDetails.everyDay')
  }

  const labels: Record<number, string> = {
    0: t('supplementDetails.sundayShort'),
    1: t('supplementDetails.mondayShort'),
    2: t('supplementDetails.tuesdayShort'),
    3: t('supplementDetails.wednesdayShort'),
    4: t('supplementDetails.thursdayShort'),
    5: t('supplementDetails.fridayShort'),
    6: t('supplementDetails.saturdayShort'),
  }

  return [...days]
    .sort((a, b) => a - b)
    .map((day) => labels[day] ?? String(day))
    .join(', ')
}

export default function SupplementDetailsScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [supplement, setSupplement] = useState<Supplement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSupplement = async () => {
      if (!id) return

      try {
        setLoading(true)
        const data = await getSupplementById(id)
        setSupplement(data)
      } catch (error) {
        console.error('Erro ao carregar suplemento:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSupplement()
  }, [id])

  if (loading) {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#312e81', '#155e75']}
        style={styles.loadingContainer}
      >
        <ActivityIndicator color="#22c55e" size="large" />
      </LinearGradient>
    </>
  )
}

  if (!supplement) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>{t('supplementDetails.notFound')}</Text>
      </View>
    )
  }

  const createdAt = formatDate(supplement.created_at)
  const updatedAt = formatDate(supplement.updated_at)

  return (
    <>
  <Stack.Screen options={{ headerShown: false }} />
  <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

  <LinearGradient
    colors={['#0f172a', '#1e1b4b', '#312e81', '#155e75']}
    style={{ flex: 1 }}
  >
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          {supplement.photo_url ? (
            <Image
              source={{ uri: supplement.photo_url }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="nutrition-outline" size={64} color="#94a3b8" />
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{supplement.name}</Text>
              {!!supplement.brand && (
                <Text style={styles.brand}>{supplement.brand}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                router.push({
                  pathname: '/edit-supplement' as any,
                  params: { id: supplement.id },
                })
              }
            >
              <Ionicons name="pencil" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            <InfoBox
              icon="time-outline"
              label={t('supplementDetails.time')}
              value={formatTimes(supplement)}
            />
            <InfoBox
              icon="calendar-outline"
              label={t('supplementDetails.days')}
              value={formatFrequency(supplement)}
            />
            <InfoBox
              icon="flask-outline"
              label={t('supplementDetails.dosage')}
              value={
                supplement.dosage_amount && supplement.dosage_unit
                  ? `${supplement.dosage_amount} ${supplement.dosage_unit}`
                  : t('supplementDetails.noDosage')
              }
            />
            <InfoBox
              icon="cube-outline"
              label={t('supplementDetails.package')}
              value={
  supplement.container_quantity
    ? supplement.container_quantity === 1
      ? t('supplementDetails.oneUnit')
      : t('supplementDetails.units', { count: supplement.container_quantity })
    : t('supplementDetails.noQuantity')
}
            />
          </View>

          <Section title={t('supplementDetails.mainIngredient')}>
            <Text style={styles.sectionText}>
              {supplement.main_ingredient || t('supplementDetails.noMainIngredient')}
            </Text>
          </Section>

          {Array.isArray(supplement.active_ingredients) &&
          supplement.active_ingredients.length > 0 ? (
            <Section title={t('supplementDetails.detectedIngredients')}>
              {supplement.active_ingredients.map((ingredient, index) => (
                <Text key={`${ingredient.name}-${index}`} style={styles.sectionText}>
                  {ingredient.name}
                  {ingredient.amount ? ` • ${ingredient.amount}` : ''}
                  {ingredient.unit ? ` ${ingredient.unit}` : ''}
                </Text>
              ))}
            </Section>
          ) : null}

          <Section title={t('supplementDetails.servingSize')}>
            <Text style={styles.sectionText}>
              {supplement.serving_size || t('supplementDetails.noServingSize')}
            </Text>
          </Section>

          <Section title={t('supplementDetails.labelInstructions')}>
            <Text style={styles.sectionText}>
              {supplement.instructions_from_label || t('supplementDetails.noInstructions')}
            </Text>
          </Section>

          {supplement.ai_insights ? (
  <Section title={t('supplementDetails.aiSummary')}>
    {supplement.ai_insights.summary ? (
      <Text style={styles.sectionText}>{supplement.ai_insights.summary}</Text>
    ) : null}

    {supplement.ai_insights.benefits?.length > 0 ? (
      <>
        <Text style={styles.sectionText}>{t('supplementDetails.generalBenefits')}</Text>
        {supplement.ai_insights.benefits.map((item, index) => (
          <Text key={index} style={styles.sectionText}>• {item}</Text>
        ))}
      </>
    ) : null}

    {supplement.ai_insights.cautions?.length > 0 ? (
      <>
        <Text style={styles.sectionText}>{t('supplementDetails.caution')}</Text>
        {supplement.ai_insights.cautions.map((item, index) => (
          <Text key={index} style={styles.sectionText}>• {item}</Text>
        ))}
      </>
    ) : null}

    <Text style={styles.dateText}>
      {t('supplementDetails.medicalDisclaimer')}
    </Text>
  </Section>
) : null}

          <View style={styles.datesBox}>
            {createdAt ? (
              <Text style={styles.dateText}>{t('supplementDetails.created', { date: createdAt })}</Text>
            ) : null}
            {updatedAt ? (
              <Text style={styles.dateText}>{t('supplementDetails.updated', { date: updatedAt })}</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
      </LinearGradient>
    </>
  )
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
}) {
  return (
    <View style={styles.infoBox}>
      <Ionicons name={icon} size={22} color="#22c55e" />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: 'transparent',
},
loadingContainer: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
},
  emptyText: {
    color: '#cbd5e1',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
  height: 320,
  backgroundColor: 'rgba(15, 23, 42, 0.7)',
},
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
  backgroundColor: 'rgba(15, 23, 42, 0.88)',
  marginTop: -26,
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  padding: 22,
  minHeight: 520,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.12)',
},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: '900',
  },
  brand: {
    color: '#cbd5e1',
    fontSize: 18,
    marginTop: 4,
  },
  editButton: {
  backgroundColor: '#7c3aed',
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 12,
},
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  infoBox: {
  width: '48%',
  backgroundColor: 'rgba(30, 41, 59, 0.95)',
  borderRadius: 18,
  padding: 14,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.12)',
},
  infoLabel: {
    color: '#94a3b8',
    marginTop: 8,
    fontSize: 13,
  },
  infoValue: {
    color: 'white',
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
  backgroundColor: 'rgba(30, 41, 59, 0.95)',
  borderRadius: 18,
  padding: 16,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.12)',
  marginBottom: 14,
},
  sectionTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  sectionText: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
  datesBox: {
    marginTop: 8,
    marginBottom: 30,
  },
  dateText: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 4,
  },
})