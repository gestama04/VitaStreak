import React from 'react'
import { Platform } from 'react-native'
import {
  requestPinWidget,
  requestWidgetUpdate,
} from 'react-native-android-widget'
import { VitaStreakDashboardWidget } from './VitaStreakDashboardWidget'
import { saveVitaStreakWidgetData } from './vita-streak-widget-storage'
import type { VitaStreakWidgetData } from './vita-streak-widget-types'

const WIDGET_NAME = 'VitaStreakDashboard'

export async function updateVitaStreakWidget(
  data: Omit<VitaStreakWidgetData, 'updatedAt'>
): Promise<void> {
  if (Platform.OS !== 'android') return

  const nextData: VitaStreakWidgetData = {
    ...data,
    updatedAt: new Date().toISOString(),
  }

  await saveVitaStreakWidgetData(nextData)

  await requestWidgetUpdate({
    widgetName: WIDGET_NAME,
    renderWidget: (widgetInfo) => (
      <VitaStreakDashboardWidget data={nextData} widgetInfo={widgetInfo} />
    ),
  })
}

export async function requestVitaStreakWidgetPin(): Promise<boolean> {
  if (Platform.OS !== 'android') return false
  return requestPinWidget({ widgetName: WIDGET_NAME })
}
