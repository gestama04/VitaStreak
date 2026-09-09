import React from 'react'
import {
  FlexWidget,
  TextWidget,
  type WidgetInfo,
} from 'react-native-android-widget'
import type { VitaStreakWidgetData } from './vita-streak-widget-types'

const HOME_URI = 'vitastreak:///vitastreak-home'

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function VitaStreakDashboardWidget({
  data,
  widgetInfo,
}: {
  data: VitaStreakWidgetData
  widgetInfo: WidgetInfo
}) {
  const total = Math.max(data.total, 0)
  const completed = clamp(data.completed, 0, total)
  const progress = total > 0 ? completed / total : 0
  const percent = Math.round(progress * 100)
  const availableBarWidth = Math.max(widgetInfo.width - 52, 120)
  const completedBarWidth = Math.max(
    progress > 0 ? 6 : 0,
    Math.round(availableBarWidth * progress)
  )
  const remainingBarWidth = Math.max(availableBarWidth - completedBarWidth, 0)
  const isPortuguese = data.language === 'pt'

  const statusText =
    total === 0
      ? isPortuguese
        ? 'Nada agendado para hoje'
        : 'Nothing scheduled today'
      : completed === total
        ? isPortuguese
          ? 'Rotina completa'
          : 'Routine complete'
        : isPortuguese
          ? completed + ' de ' + total + ' tomas'
          : completed + ' of ' + total + ' doses'

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: HOME_URI }}
      accessibilityLabel={
        isPortuguese
          ? 'Abrir a aplicação VitaStreak'
          : 'Open the VitaStreak app'
      }
      style={{
        width: 'match_parent',
        height: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundGradient: {
          from: '#071124',
          to: '#17133D',
          orientation: 'TL_BR',
        },
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#334155',
        padding: 18,
      }}
    >
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text="VitaStreak"
          maxLines={1}
          style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900' }}
        />
        <TextWidget
          text={'🔥 ' + data.streak}
          maxLines={1}
          style={{ color: '#FF5A4F', fontSize: 18, fontWeight: '900' }}
        />
      </FlexWidget>

      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text={isPortuguese ? 'Hoje' : 'Today'}
          maxLines={1}
          style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}
        />
        <TextWidget
          text={percent + '%'}
          maxLines={1}
          style={{ color: '#7DD3FC', fontSize: 14, fontWeight: '900' }}
        />
      </FlexWidget>

      <TextWidget
        text={statusText}
        maxLines={1}
        truncate="END"
        style={{ color: '#E2E8F0', fontSize: 14, fontWeight: '800' }}
      />

      <FlexWidget
        style={{
          width: 'match_parent',
          height: 8,
          flexDirection: 'row',
          backgroundColor: '#1E293B',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {completedBarWidth > 0 ? (
          <FlexWidget
            style={{
              width: completedBarWidth,
              height: 8,
              backgroundColor: completed === total && total > 0 ? '#4ADE80' : '#7DD3FC',
            }}
          />
        ) : null}
        {remainingBarWidth > 0 ? (
          <FlexWidget
            style={{
              width: remainingBarWidth,
              height: 8,
              backgroundColor: '#1E293B',
            }}
          />
        ) : null}
      </FlexWidget>
    </FlexWidget>
  )
}
