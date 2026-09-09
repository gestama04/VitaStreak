import React from 'react'
import { registerWidgetTaskHandler } from 'react-native-android-widget'
import { VitaStreakDashboardWidget } from './VitaStreakDashboardWidget'
import { getVitaStreakWidgetData } from './vita-streak-widget-storage'

registerWidgetTaskHandler(async ({
  widgetInfo,
  widgetAction,
  renderWidget,
}) => {
  if (widgetInfo.widgetName !== 'VitaStreakDashboard') return
  if (widgetAction === 'WIDGET_DELETED') return

  const data = await getVitaStreakWidgetData()
  renderWidget(
    <VitaStreakDashboardWidget data={data} widgetInfo={widgetInfo} />
  )
})
