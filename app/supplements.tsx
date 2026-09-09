import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  StatusBar,
} from 'react-native'
import { Stack, useFocusEffect, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

import {
  deleteSupplement,
  getSupplements,
} from '../services/supplements/supplement-service'
import { Supplement } from '../types/supplements/supplement'
import useCustomAlert from '../hooks/useCustomAlert'
import { t } from '@/i18n'

export default function SupplementsScreen() {
  const router = useRouter()
  const { showAlert, AlertComponent } = useCustomAlert()

  const [supplements, setSupplements] = useState<Supplement[]>([])
  const [loading, setLoading] = useState(true)

  const loadSupplements = async () => {
    try {
      setLoading(true)
      const data = await getSupplements()
      setSupplements(data)
    } catch (error) {
      console.error('Erro ao carregar suplementos:', error)
      showAlert(t('supplements.error'), t('supplements.loadError'), [
        { text: 'OK', onPress: () => {} },
      ])
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadSupplements()
    }, [])
  )

  const confirmDeleteSupplement = (item: Supplement) => {
    if (!item.id) return

    showAlert(
      t('supplements.deleteTitle'),
      t('supplements.deleteConfirmation', { name: item.name }),
      [
        { text: t('supplements.cancel'), onPress: () => {} },
        {
          text: t('supplements.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSupplement(item.id!)

              setSupplements((current) =>
                current.filter((supplement) => supplement.id !== item.id)
              )
            } catch (error) {
              console.error('Erro ao apagar suplemento:', error)
              setTimeout(() => {
  showAlert(t('supplements.error'), t('supplements.deleteError'), [
    { text: 'OK', onPress: () => {} },
  ])
}, 300)
            }
          },
        },
      ]
    )
  }

  const openSupplementOptions = (item: Supplement) => {
  showAlert(item.name, t('supplements.optionsQuestion'), [
    { text: t('supplements.cancel'), onPress: () => {} },
    {
      text: t('supplements.edit'),
      onPress: () => {
        router.push({
          pathname: '/edit-supplement' as any,
          params: { id: item.id },
        })
      },
    },
    {
      text: t('supplements.delete'),
      style: 'destructive',
      onPress: () => {
        setTimeout(() => {
          confirmDeleteSupplement(item)
        }, 300)
      },
    },
  ])
}

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#312e81', '#155e75']}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t('supplements.title')}</Text>
              <Text style={styles.subtitle}>
                {t('supplements.subtitle')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-supplement' as any)}
            >
              <Ionicons name="add" size={26} color="white" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#22c55e" size="large" />
              <Text style={styles.loadingText}>{t('supplements.loading')}</Text>
            </View>
          ) : supplements.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="nutrition-outline" size={42} color="#c4b5fd" />
              </View>

              <Text style={styles.emptyTitle}>{t('supplements.emptyTitle')}</Text>
              <Text style={styles.emptyText}>
                {t('supplements.emptyMessage')}
              </Text>

              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/add-supplement' as any)}
              >
                <Ionicons name="add-circle-outline" size={22} color="white" />
                <Text style={styles.emptyButtonText}>{t('supplements.addSupplement')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={supplements}
              keyExtractor={(item) => item.id ?? item.name}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 36 }}
              renderItem={({ item }) => {
                const dosageText =
                  item.dosage_amount && item.dosage_unit
                    ? `${item.dosage_amount} ${item.dosage_unit}`
                    : null

                const timeText = item.reminder_time
                  ? item.reminder_time.slice(0, 5)
                  : null

                const metaText = [dosageText, timeText]
                  .filter(Boolean)
                  .join(' • ')

                return (
                  <TouchableOpacity
                    style={styles.card}
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({
                        pathname: '/supplement-details' as any,
                        params: { id: item.id },
                      })
                    }
                    onLongPress={() => openSupplementOptions(item)}
                  >
                    {item.photo_url ? (
                      <Image source={{ uri: item.photo_url }} style={styles.image} />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons
                          name="nutrition-outline"
                          size={30}
                          color="#c4b5fd"
                        />
                      </View>
                    )}

                    <View style={styles.cardText}>
                      <Text style={styles.name} numberOfLines={1}>
                        {item.name}
                      </Text>

                      {!!item.brand && (
                        <Text style={styles.brand} numberOfLines={1}>
                          {item.brand}
                        </Text>
                      )}

                      {!!metaText && <Text style={styles.meta}>{metaText}</Text>}
                    </View>

                    <Ionicons name="chevron-forward" size={22} color="#94a3b8" />
                  </TouchableOpacity>
                )
              }}
            />
          )}

          <AlertComponent />
        </View>
      </LinearGradient>
    </>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 58,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
    gap: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#22c55e',
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    marginTop: 80,
    alignItems: 'center',
  },
  loadingText: {
    color: '#cbd5e1',
    marginTop: 14,
    fontSize: 15,
    fontWeight: '600',
  },
  empty: {
    marginTop: 70,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 26,
    padding: 24,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 23,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#cbd5e1',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#22c55e',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 15,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
    gap: 14,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#334155',
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(124, 58, 237, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
  },
  name: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  },
  brand: {
    color: '#cbd5e1',
    marginTop: 3,
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    color: '#94a3b8',
    marginTop: 5,
    fontSize: 14,
  },
})