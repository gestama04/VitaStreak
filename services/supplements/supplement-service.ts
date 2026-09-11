import { supabase } from '../../supabase-config'
import { uploadImageToCloudinary } from '../../cloudinary-service'
import { Supplement } from '../../types/supplements/supplement'
import {
  cancelSupplementNotifications,
  scheduleSupplementNotifications,
  debugScheduledSupplementNotifications,
} from './supplement-notification-service'

export async function addSupplement(
  supplement: Omit<Supplement, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  photoBase64?: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Utilizador não autenticado')
  }

  let photo_url: string | null = null
  let photo_public_id: string | null = null

  if (photoBase64) {
    const upload = await uploadImageToCloudinary(photoBase64, 'supplements')
    photo_url = upload.secure_url
    photo_public_id = upload.public_id
  }

  const { data, error } = await supabase
    .from('supplements')
    .insert({
      ...supplement,
      user_id: user.id,
      photo_url,
      photo_public_id,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    throw error
  }
const notificationIds = await scheduleSupplementNotifications(data as Supplement)
console.log('[SUPP_SERVICE] ADD_NOTIFICATION_IDS', notificationIds)

if (notificationIds.length > 0) {
  await supabase
    .from('supplements')
    .update({ notification_ids: notificationIds })
    .eq('id', data.id)

  data.notification_ids = notificationIds
}
await refreshTodayDayStatus(user.id)

  return data as Supplement
}

export async function getSupplements() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Utilizador não autenticado')
  }

  const { data, error } = await supabase
    .from('supplements')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as Supplement[]
}

export type TodaySupplement = Supplement & {
  take_id: string
  reminder_time: string
  taken_today?: boolean
  log_id?: string | null
}

function getDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function normalizeTime(time?: string | null) {
  if (!time) return ''
  return String(time).slice(0, 5)
}

function getReminderTimes(supplement: Supplement) {
  if (Array.isArray(supplement.reminder_times) && supplement.reminder_times.length > 0) {
    return supplement.reminder_times.map(normalizeTime).filter(Boolean)
  }

  if (supplement.reminder_time) {
    return [normalizeTime(supplement.reminder_time)]
  }

  return []
}

function isSupplementScheduledForDate(supplement: Supplement, date: Date) {
  const frequency = supplement.frequency_type ?? 'daily'
  const dayOfWeek = date.getDay()

  if (frequency === 'daily') return true

  if (frequency === 'specific_days') {
    return Array.isArray(supplement.days_of_week)
      ? supplement.days_of_week.includes(dayOfWeek)
      : false
  }

  const startDateString = supplement.start_date ?? getDateString()
  const startDate = new Date(`${startDateString}T00:00:00`)
  const currentDate = new Date(`${getDateString(date)}T00:00:00`)

  const diffDays = Math.floor(
    (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays < 0) return false

  if (frequency === 'every_other_day') {
    return diffDays % 2 === 0
  }

  if (frequency === 'custom_interval') {
    const interval = supplement.interval_days ?? 1
    return diffDays % interval === 0
  }

  return true
}

export async function getTodaySupplements() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Utilizador não autenticado')

  const today = getDateString()
  const now = new Date()

  const { data: supplements, error: supplementsError } = await supabase
    .from('supplements')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (supplementsError) throw supplementsError

  const { data: logs, error: logsError } = await supabase
    .from('supplement_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('taken_date', today)

  if (logsError) throw logsError


  return (supplements || [])
  .filter((supplement) =>
    isSupplementScheduledForDate(supplement as Supplement, now)
  )
  .flatMap((supplement: Supplement) => {
    const times = getReminderTimes(supplement)

    return times.map((time) => {
      const normalizedTime = String(time).slice(0, 5)

      const log = (logs || []).find(
        (l: any) =>
          l.supplement_id === supplement.id &&
          String(l.reminder_time).slice(0, 5) === normalizedTime
      )

      return {
        ...supplement,
        take_id: `${supplement.id}-${normalizedTime}`,
        reminder_time: normalizedTime,
        taken_today: !!log,
        log_id: log?.id ?? null,
      }
    })
  })
  .sort((a, b) => a.reminder_time.localeCompare(b.reminder_time)) as TodaySupplement[]
}

export async function getTodayDoseSummary() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Utilizador não autenticado')

  const today = getDateString()

  const [{ count, error: countError }, activeToday] = await Promise.all([
    supabase
      .from('supplement_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('taken_date', today)
      .eq('status', 'taken'),
    getTodaySupplements(),
  ])

  if (countError) throw countError

  return {
    completed: count ?? 0,
    pending: activeToday.filter((item) => !item.taken_today).length,
  }
}

export async function markSupplementTaken(
  supplementId: string,
  reminderTime: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Utilizador não autenticado')

  const today = getDateString()

  const { data: supplement, error: supplementError } = await supabase
    .from('supplements')
    .select('name, brand, photo_url')
    .eq('id', supplementId)
    .eq('user_id', user.id)
    .single()

  if (supplementError) throw supplementError

  const { data, error } = await supabase
    .from('supplement_logs')
    .upsert(
      {
        user_id: user.id,
        supplement_id: supplementId,
        supplement_name: supplement.name,
        supplement_brand: supplement.brand,
        supplement_photo_url: supplement.photo_url,
        taken_date: today,
        reminder_time: normalizeTime(reminderTime),
        status: 'taken',
        taken_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,supplement_id,taken_date,reminder_time',
      }
    )
    .select()
    .single()

  if (error) throw error
  await refreshTodayDayStatus(user.id)
  return data
}

export async function unmarkSupplementTaken(
  supplementId: string,
  reminderTime: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Utilizador não autenticado')

  const today = getDateString()
  const normalizedReminderTime = normalizeTime(reminderTime)

  const { error } = await supabase
    .from('supplement_logs')
    .delete()
    .eq('user_id', user.id)
    .eq('supplement_id', supplementId)
    .eq('taken_date', today)
    .eq('reminder_time', normalizedReminderTime)

  if (error) throw error

  await refreshTodayDayStatus(user.id)
}

export async function deleteSupplement(supplementId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Utilizador não autenticado')
  }

  const { data: existing } = await supabase
    .from('supplements')
    .select('notification_ids')
    .eq('id', supplementId)
    .eq('user_id', user.id)
    .single()

  await cancelSupplementNotifications(existing?.notification_ids)

  const { error } = await supabase
    .from('supplements')
    .delete()
    .eq('id', supplementId)
    .eq('user_id', user.id)

  if (error) {
    throw error
  }
  await refreshTodayDayStatus(user.id)
}

export async function getSupplementById(id: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Utilizador não autenticado')
  }

  const { data, error } = await supabase
    .from('supplements')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    throw error
  }

  return data as Supplement
}

export async function updateSupplement(
  id: string,
  supplement: Partial<Supplement>,
  photoBase64?: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Utilizador não autenticado')
  }

  const { data: existing } = await supabase
    .from('supplements')
    .select('notification_ids')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  console.log('[SUPP_SERVICE] UPDATE_OLD_NOTIFICATION_IDS', existing?.notification_ids)

await cancelSupplementNotifications(existing?.notification_ids)

console.log('[SUPP_SERVICE] UPDATE_AFTER_CANCEL')

  let photoUpdate = {}

  if (photoBase64) {
    const upload = await uploadImageToCloudinary(photoBase64, 'supplements')

    photoUpdate = {
      photo_url: upload.secure_url,
      photo_public_id: upload.public_id,
    }
  }

  const { data, error } = await supabase
    .from('supplements')
    .update({
      ...supplement,
      ...photoUpdate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw error
  }

  const notificationIds = await scheduleSupplementNotifications(data as Supplement)
console.log('[SUPP_SERVICE] UPDATE_NEW_NOTIFICATION_IDS', notificationIds)
  await supabase
    .from('supplements')
    .update({ notification_ids: notificationIds })
    .eq('id', data.id)

  data.notification_ids = notificationIds

  await refreshTodayDayStatus(user.id)

  return data as Supplement
}

export async function getSupplementStreak() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Utilizador não autenticado')

  await refreshTodayDayStatus(user.id)

  const { data, error } = await supabase
    .from('supplement_day_status')
    .select('date, completed, frozen')
    .eq('user_id', user.id)

  if (error) throw error

  const dayStatusMap = new Map(
    (data || []).map((item: any) => [
      item.date,
      {
        completed: item.completed,
        frozen: item.frozen,
      },
    ])
  )

  let streak = 0
  const today = new Date()
  const MAX_STREAK_DAYS = 5000

  for (let i = 0; i < MAX_STREAK_DAYS; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)

    const dateString = getDateString(date)
    const status = dayStatusMap.get(dateString)

    if (status?.completed) {
      streak++
      continue
    }

    if (status?.frozen) {
      continue
    }

    if (i === 0) continue

    break
  }

  return streak
}

export async function rescheduleAllSupplementNotifications() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Utilizador não autenticado')

  const { data: supplements, error } = await supabase
    .from('supplements')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (error) throw error

  console.log('[SUPP_SERVICE] RESCHEDULE_ALL_START', supplements?.length ?? 0)

  await import('./supplement-notification-service').then(async (mod) => {
    const Notifications = await import('expo-notifications')
    await Notifications.cancelAllScheduledNotificationsAsync()
  })

  for (const supplement of supplements || []) {
    const ids = await scheduleSupplementNotifications(supplement as Supplement)

    await supabase
      .from('supplements')
      .update({ notification_ids: ids })
      .eq('id', supplement.id)
      .eq('user_id', user.id)

    console.log('[SUPP_SERVICE] RESCHEDULED_ONE', {
      name: supplement.name,
      ids: ids.length,
    })
  }

  await debugScheduledSupplementNotifications()
}
export type SupplementHistoryLog = {
  id: string
  supplement_id: string
  taken_date: string
  reminder_time: string
  status: string
  taken_at: string | null
  supplement?: {
    name: string
    brand?: string | null
    photo_url?: string | null
  } | null
}

export async function getSupplementHistory(days = 30) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Utilizador não autenticado')

  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - days)

  const from = getDateString(fromDate)

  const { data, error } = await supabase
    .from('supplement_logs')
    .select(`
      id,
      supplement_id,
      taken_date,
      reminder_time,
      status,
      taken_at,
      supplement:supplements (
        name,
        brand,
        photo_url
      )
    `)
    .eq('user_id', user.id)
    .gte('taken_date', from)
    .order('taken_date', { ascending: false })
    .order('reminder_time', { ascending: true })

  if (error) throw error

  return (data || []).map((log: any) => ({
    id: log.id,
    supplement_id: log.supplement_id,
    taken_date: log.taken_date,
    reminder_time: normalizeTime(log.reminder_time),
    status: log.status,
    taken_at: log.taken_at,
    supplement: Array.isArray(log.supplement)
      ? log.supplement[0] ?? null
      : log.supplement ?? null,
  })) as SupplementHistoryLog[]
}
export type SupplementHistoryTake = {
  id: string
  supplement_id: string | null
  taken_date: string
  reminder_time: string
  taken_at: string | null
  taken: boolean
  deleted: boolean
  supplement: {
    name: string | null
    brand: string | null
    photo_url: string | null
  }
}

export type SupplementHistoryDay = {
  date: string
  takes: SupplementHistoryTake[]
}

type SupplementHistoryRow = {
  id: string
  supplement_id: string | null
  taken_date: string
  reminder_time: string | null
  taken_at: string | null
  supplement_name: string | null
  supplement_brand: string | null
  supplement_photo_url: string | null
  supplement:
    | {
        name: string | null
        brand: string | null
        photo_url: string | null
      }
    | Array<{
        name: string | null
        brand: string | null
        photo_url: string | null
      }>
    | null
}

export async function getSupplementHistoryDays(days = 30) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Utilizador não autenticado')

  const today = new Date()
  const fromDate = new Date()
  fromDate.setDate(today.getDate() - days + 1)

  const from = getDateString(fromDate)

  const { data: logs, error: logsError } = await supabase
    .from('supplement_logs')
    .select(`
      id,
      supplement_id,
      taken_date,
      reminder_time,
      status,
      taken_at,
      supplement_name,
      supplement_brand,
      supplement_photo_url,
      supplement:supplements (
        name,
        brand,
        photo_url
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'taken')
    .gte('taken_date', from)
    .order('taken_date', { ascending: false })
    .order('taken_at', { ascending: true })

  if (logsError) throw logsError

  const grouped: Record<string, SupplementHistoryTake[]> = {}

  for (const rawLog of logs || []) {
    const log = rawLog as SupplementHistoryRow
    const relatedSupplement = Array.isArray(log.supplement)
      ? log.supplement[0] ?? null
      : log.supplement

    if (!grouped[log.taken_date]) grouped[log.taken_date] = []

    grouped[log.taken_date].push({
      id: log.id,
      supplement_id: log.supplement_id,
      taken_date: log.taken_date,
      reminder_time: normalizeTime(log.reminder_time),
      taken_at: log.taken_at,
      taken: true,
      deleted: log.supplement_id === null,
      supplement: {
        name: log.supplement_name ?? relatedSupplement?.name ?? null,
        brand: log.supplement_brand ?? relatedSupplement?.brand ?? null,
        photo_url: log.supplement_photo_url ?? relatedSupplement?.photo_url ?? null,
      },
    })
  }

  return Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a))
    .map((date) => ({
      date,
      takes: grouped[date],
    })) as SupplementHistoryDay[]
}

async function refreshTodayDayStatus(userId: string) {
  const today = getDateString()
  const now = new Date()

  const { data: supplements, error: supplementsError } = await supabase
    .from('supplements')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (supplementsError) throw supplementsError

  const { data: logs, error: logsError } = await supabase
    .from('supplement_logs')
    .select('supplement_id, taken_date, reminder_time, status')
    .eq('user_id', userId)
    .eq('taken_date', today)
    .eq('status', 'taken')

  if (logsError) throw logsError

  const expectedTakes = (supplements || [])
    .filter((supplement) =>
      isSupplementScheduledForDate(supplement as Supplement, now)
    )
    .flatMap((supplement: Supplement) =>
      getReminderTimes(supplement).map((time) => ({
        supplement_id: supplement.id,
        reminder_time: normalizeTime(time),
      }))
    )

  if (expectedTakes.length === 0) {
    const { error: deleteError } = await supabase
      .from('supplement_day_status')
      .delete()
      .eq('user_id', userId)
      .eq('date', today)

    if (deleteError) throw deleteError
    return
  }

  const logsSet = new Set(
    (logs || []).map(
      (log: any) =>
        `${log.supplement_id}-${normalizeTime(log.reminder_time)}`
    )
  )

  const completed = expectedTakes.every((take) =>
    logsSet.has(`${take.supplement_id}-${take.reminder_time}`)
  )

  const nowIso = new Date().toISOString()

  const { error } = await supabase
    .from('supplement_day_status')
    .upsert(
      {
        user_id: userId,
        date: today,
        completed,
        completed_at: completed ? nowIso : null,
        updated_at: nowIso,
      },
      {
        onConflict: 'user_id,date',
      }
    )

  if (error) throw error
}
export type SupplementDayStatus = {
  date: string
  completed: boolean
  frozen?: boolean
}

export async function getSupplementDayStatusDays(days = 7) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Utilizador não autenticado')

  const today = new Date()
  const fromDate = new Date()
  fromDate.setDate(today.getDate() - days + 1)

  const from = getDateString(fromDate)

  const { data, error } = await supabase
    .from('supplement_day_status')
    .select('date, completed, frozen')
    .eq('user_id', user.id)
    .gte('date', from)

  if (error) throw error

  return (data || []) as SupplementDayStatus[]
}
export async function freezeSupplementDay(dateString: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Utilizador não autenticado')

  const { data: balance, error: balanceError } = await supabase
    .from('user_streak_freezes')
    .select('available_freezes, total_earned, total_used')
    .eq('user_id', user.id)
    .maybeSingle()

  if (balanceError) throw balanceError

  const available = balance?.available_freezes ?? 0
  const totalEarned = balance?.total_earned ?? 0
  const totalUsed = balance?.total_used ?? 0

  if (available <= 0) {
    throw new Error('Sem gelos disponíveis')
  }

  const { data: existing, error: existingError } = await supabase
    .from('supplement_day_status')
    .select('completed, frozen')
    .eq('user_id', user.id)
    .eq('date', dateString)
    .maybeSingle()

  if (existingError) throw existingError

  if (existing?.completed) {
    throw new Error('Este dia já está completo')
  }

  if (existing?.frozen) {
    throw new Error('Este dia já tem gelo')
  }

  const { error: freezeError } = await supabase.from('supplement_day_status').upsert(
    {
      user_id: user.id,
      date: dateString,
      completed: false,
      frozen: true,
      frozen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,date' }
  )

  if (freezeError) throw freezeError

  const { error: updateBalanceError } = await supabase
    .from('user_streak_freezes')
    .upsert(
      {
        user_id: user.id,
        available_freezes: Math.max(available - 1, 0),
        total_earned: totalEarned,
        total_used: totalUsed + 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (updateBalanceError) throw updateBalanceError
}
export async function getFreezeBalance() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Utilizador não autenticado')

  const { data, error } = await supabase
    .from('user_streak_freezes')
    .select('available_freezes, total_earned, total_used')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error

  return {
    available: data?.available_freezes ?? 0,
    totalEarned: data?.total_earned ?? 0,
    totalUsed: data?.total_used ?? 0,
  }
}

export async function syncFreezeRewards(currentStreak: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Utilizador não autenticado')

  const earnedByStreak = Math.floor(currentStreak / 5)

  const { data: current, error: fetchError } = await supabase
    .from('user_streak_freezes')
    .select('available_freezes, total_earned, total_used')
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchError) throw fetchError

  const totalEarned = current?.total_earned ?? 0
  const available = current?.available_freezes ?? 0
  const totalUsed = current?.total_used ?? 0

  if (earnedByStreak <= totalEarned) {
    return {
      available,
      totalEarned,
      totalUsed,
    }
  }

  const newlyEarned = earnedByStreak - totalEarned
  const newAvailable = Math.min(available + newlyEarned, 3)

  const { data, error } = await supabase
    .from('user_streak_freezes')
    .upsert(
      {
        user_id: user.id,
        available_freezes: newAvailable,
        total_earned: earnedByStreak,
        total_used: totalUsed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select('available_freezes, total_earned, total_used')
    .single()

  if (error) throw error

  return {
    available: data.available_freezes,
    totalEarned: data.total_earned,
    totalUsed: data.total_used,
  }
}