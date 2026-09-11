import React from 'react'
import {
  FlexWidget,
  TextWidget,
  type WidgetInfo,
  type ColorProp,
} from 'react-native-android-widget'
import type {
  VitaStreakWidgetData,
  VitaStreakWidgetDayStatus,
} from './vita-streak-widget-types'

const HOME_URI = 'vitastreak:///vitastreak-home'

const STATUS_COLORS: Record<
  VitaStreakWidgetDayStatus,
  ColorProp
> = {
  completed: '#4ADE80',
  pending: '#7DD3FC',
  missed: '#F87171',
  frozen: '#67E8F9',
  empty: '#334155',
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function VitaStreakDashboardWidget({
  data,
}: {
  data: VitaStreakWidgetData
  widgetInfo: WidgetInfo
}) {
  const total = Math.max(data.total, 0)
  const completed = clamp(data.completed, 0, total)
  const progress = total > 0 ? completed / total : 0
  const percent = Math.round(progress * 100)
  const completedWeight = Math.max(percent, 0)
  const remainingWeight = Math.max(100 - percent, 0)
  const isPortuguese = data.language === 'pt'

  const streakText =
    data.streak === 1
      ? isPortuguese
        ? '1 dia seguido'
        : '1 day in a row'
      : isPortuguese
        ? data.streak + ' dias seguidos'
        : data.streak + ' days in a row'

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
        padding: 16,
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
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget
            text={(data.streak > 0 ? '🔥 ' : '❄️ ') + (isPortuguese ? 'STREAK ATUAL' : 'CURRENT STREAK')}
            maxLines={1}
            style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '900' }}
          />
          <TextWidget
            text={streakText}
            maxLines={1}
            style={{ color: '#CBD5E1', fontSize: 12, fontWeight: '700', marginTop: 3 }}
          />
        </FlexWidget>

        <FlexWidget
          style={{
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          <TextWidget
            text={percent + '%'}
            maxLines={1}
            style={{ color: percent === 100 ? '#4ADE80' : '#7DD3FC', fontSize: 20, fontWeight: '900' }}
          />
          <TextWidget
            text={statusText}
            maxLines={1}
            truncate="END"
            style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700', marginTop: 2 }}
          />
        </FlexWidget>
      </FlexWidget>

      <FlexWidget
        style={{
          width: 'match_parent',
          height: 7,
          flexDirection: 'row',
          backgroundColor: '#1E293B',
          borderRadius: 4,
          overflow: 'hidden',
          marginTop: 9,
          marginBottom: 9,
        }}
      >
        {completedWeight > 0 ? (
          <FlexWidget
            style={{
              flex: completedWeight,
              height: 7,
              backgroundColor: percent === 100 ? '#4ADE80' : '#7DD3FC',
            }}
          />
        ) : null}
        {remainingWeight > 0 ? (
          <FlexWidget
            style={{
              flex: remainingWeight,
              height: 7,
              backgroundColor: '#1E293B',
            }}
          />
        ) : null}
      </FlexWidget>

      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {data.weekDays.map((day, index) => (
          <FlexWidget
            key={day.label + '-' + index}
            style={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <TextWidget
              text={day.label.toUpperCase()}
              maxLines={1}
              style={{ color: '#94A3B8', fontSize: 9, fontWeight: '900' }}
            />
            <TextWidget
              text="●"
              maxLines={1}
              style={{
                color: STATUS_COLORS[day.status],
                fontSize: 14,
                fontWeight: '900',
                marginTop: 2,
              }}
            />
          </FlexWidget>
        ))}
      </FlexWidget>
    </FlexWidget>
  )
}
