import React, { useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

import { getSupplements } from '../services/supplements/supplement-service'
import {
  AIRoutineReview,
  reviewSupplementRoutine,
} from '../services/supplements/ai-routine-review-service'
import {
  AIRoutineChatMessage,
  askVitaStreakAI,
} from '../services/supplements/ai-routine-chat-service'
import { Supplement } from '../types/supplements/supplement'
import useCustomAlert from '../hooks/useCustomAlert'
import { t } from '@/i18n'

type SectionTone = 'neutral' | 'positive' | 'warning' | 'timing' | 'question'

const sectionConfig: Record<
  SectionTone,
  { icon: keyof typeof Ionicons.glyphMap; color: string; background: string }
> = {
  neutral: {
    icon: 'document-text-outline',
    color: '#7dd3fc',
    background: 'rgba(125,211,252,0.14)',
  },
  positive: {
    icon: 'checkmark-circle-outline',
    color: '#4ade80',
    background: 'rgba(74,222,128,0.14)',
  },
  warning: {
    icon: 'warning-outline',
    color: '#fbbf24',
    background: 'rgba(251,191,36,0.14)',
  },
  timing: {
    icon: 'time-outline',
    color: '#38bdf8',
    background: 'rgba(56,189,248,0.14)',
  },
  question: {
    icon: 'help-circle-outline',
    color: '#c4b5fd',
    background: 'rgba(196,181,253,0.14)',
  },
}

export default function AIRoutineReviewScreen() {
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)
  const { showAlert, AlertComponent } = useCustomAlert()

  const [analyzing, setAnalyzing] = useState(false)
  const [sending, setSending] = useState(false)
  const [supplements, setSupplements] = useState<Supplement[]>([])
  const [review, setReview] = useState<AIRoutineReview | null>(null)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<AIRoutineChatMessage[]>([])

  const quickQuestions = useMemo(
    () => [
      t('vitaStreakAI.quickDuplicate'),
      t('vitaStreakAI.quickTiming'),
      t('vitaStreakAI.quickConfirm'),
      t('vitaStreakAI.quickProfessional'),
    ],
    []
  )

  const loadActiveSupplements = async () => {
    const allSupplements = await getSupplements()
    return allSupplements.filter((item) => item.is_active !== false)
  }

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true)
      const activeSupplements = await loadActiveSupplements()

      if (activeSupplements.length === 0) {
        showAlert(
          t('vitaStreakAI.noSupplementsTitle'),
          t('vitaStreakAI.noSupplementsMessage'),
          [{ text: 'OK', onPress: () => {} }]
        )
        return
      }

      const result = await reviewSupplementRoutine(activeSupplements)
      setSupplements(activeSupplements)
      setReview(result)
      setMessages([])

      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 430, animated: true })
      }, 100)
    } catch (error) {
      console.error('Erro na analise VitaStreak AI:', error)
      showAlert(
        t('vitaStreakAI.error'),
        t('vitaStreakAI.analysisError'),
        [{ text: 'OK', onPress: () => {} }]
      )
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSend = async (suggestedQuestion?: string) => {
    const finalQuestion = (suggestedQuestion ?? question).trim()
    if (!finalQuestion || sending) return

    try {
      setSending(true)
      setQuestion('')

      let activeSupplements = supplements
      let currentReview = review

      if (activeSupplements.length === 0) {
        activeSupplements = await loadActiveSupplements()
        setSupplements(activeSupplements)
      }

      if (activeSupplements.length === 0) {
        showAlert(
          t('vitaStreakAI.noSupplementsTitle'),
          t('vitaStreakAI.noSupplementsMessage'),
          [{ text: 'OK', onPress: () => {} }]
        )
        return
      }

      if (!currentReview) {
        currentReview = await reviewSupplementRoutine(activeSupplements)
        setReview(currentReview)
      }

      const userMessage: AIRoutineChatMessage = {
        role: 'user',
        content: finalQuestion,
      }
      const nextMessages = [...messages, userMessage]
      setMessages(nextMessages)

      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80)

      const answer = await askVitaStreakAI({
        supplements: activeSupplements,
        review: currentReview,
        messages: nextMessages,
        question: finalQuestion,
      })

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: answer },
      ])
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    } catch (error) {
      console.error('Erro no chat VitaStreak AI:', error)
      showAlert(
        t('vitaStreakAI.error'),
        t('vitaStreakAI.chatError'),
        [{ text: 'OK', onPress: () => {} }]
      )
    } finally {
      setSending(false)
    }
  }

  const clearConversation = () => {
    setMessages([])
    setQuestion('')
  }

  return (
    <KeyboardAvoidingView
  style={styles.flex}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#071124" />

      <LinearGradient
        colors={['#071124', '#11183d', '#25165b', '#0e4f63']}
        style={styles.gradient}
      >
        <ScrollView
  ref={scrollRef}
  style={styles.scrollView}
  contentContainerStyle={styles.content}
  keyboardShouldPersistTaps="handled"
  keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
  showsVerticalScrollIndicator={false}
>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>

            <View style={styles.headerText}>
              <Text style={styles.title}>{t('vitaStreakAI.title')}</Text>
              <Text style={styles.subtitle}>{t('vitaStreakAI.subtitle')}</Text>
            </View>
          </View>

          <View style={styles.heroCard}>
            <LinearGradient
              colors={['#7dd3fc', '#a78bfa']}
              style={styles.logoCircle}
            >
              <Ionicons name="sparkles" size={32} color="#071124" />
            </LinearGradient>

            <View style={styles.heroTextBox}>
              <Text style={styles.heroTitle}>{t('vitaStreakAI.heroTitle')}</Text>
              <Text style={styles.heroText}>{t('vitaStreakAI.heroText')}</Text>
            </View>

            <View style={styles.privacyRow}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#7dd3fc" />
              <Text style={styles.privacyText}>{t('vitaStreakAI.contextNotice')}</Text>
            </View>

            <TouchableOpacity
              style={[styles.analyzeButton, analyzing && styles.disabledButton]}
              onPress={handleAnalyze}
              disabled={analyzing}
              activeOpacity={0.86}
            >
              {analyzing ? (
                <ActivityIndicator color="#071124" />
              ) : (
                <>
                  <Ionicons name="analytics-outline" size={22} color="#071124" />
                  <Text style={styles.analyzeButtonText}>
                    {review ? t('vitaStreakAI.analyzeAgain') : t('vitaStreakAI.analyze')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {review ? (
            <View style={styles.analysisBlock}>
              <View style={styles.blockHeader}>
                <View>
                  <Text style={styles.blockEyebrow}>{t('vitaStreakAI.analysisEyebrow')}</Text>
                  <Text style={styles.blockTitle}>{t('vitaStreakAI.analysisTitle')}</Text>
                </View>
                <View style={styles.readyBadge}>
                  <Ionicons name="checkmark" size={15} color="#4ade80" />
                  <Text style={styles.readyText}>{t('vitaStreakAI.ready')}</Text>
                </View>
              </View>

              <AnalysisSection
                title={t('vitaStreakAI.summary')}
                items={[review.summary]}
                tone="neutral"
              />
              <AnalysisSection
                title={t('vitaStreakAI.positives')}
                items={review.positives}
                tone="positive"
              />
              <AnalysisSection
                title={t('vitaStreakAI.pointsToCheck')}
                items={review.pointsToCheck}
                tone="warning"
              />
              <AnalysisSection
                title={t('vitaStreakAI.timing')}
                items={review.timingNotes}
                tone="timing"
              />
              <AnalysisSection
                title={t('vitaStreakAI.professionalQuestions')}
                items={review.professionalQuestions}
                tone="question"
              />
            </View>
          ) : null}

          <View style={styles.chatCard}>
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color="#c4b5fd" />
              </View>
              <View style={styles.chatHeaderText}>
                <Text style={styles.chatTitle}>{t('vitaStreakAI.chatTitle')}</Text>
                <Text style={styles.chatSubtitle}>{t('vitaStreakAI.chatSubtitle')}</Text>
              </View>
              {messages.length > 0 ? (
                <TouchableOpacity onPress={clearConversation} style={styles.clearButton}>
                  <Ionicons name="trash-outline" size={18} color="#94a3b8" />
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {quickQuestions.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.chip}
                  onPress={() => handleSend(item)}
                  disabled={sending}
                >
                  <Text style={styles.chipText} numberOfLines={1}>
  {item}
</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {messages.length > 0 ? (
              <View style={styles.messagesBox}>
                {messages.map((message, index) => (
                  <ChatBubble
                    key={message.role + '-' + index}
                    message={message}
                  />
                ))}
                {sending ? (
                  <View
  style={[
    styles.bubble,
    styles.assistantBubble,
    styles.thinkingBubble,
  ]}
>
  <ActivityIndicator size="small" color="#c4b5fd" />
  <Text style={styles.thinkingText}>
    {t('vitaStreakAI.thinking')}
  </Text>
</View>
                ) : null}
              </View>
            ) : (
              <View style={styles.emptyChat}>
                <Ionicons name="sparkles-outline" size={24} color="#64748b" />
                <Text style={styles.emptyChatText}>{t('vitaStreakAI.emptyChat')}</Text>
              </View>
            )}

            <View style={styles.inputRow}>
              <TextInput
  value={question}
  onChangeText={setQuestion}
  placeholder={t('vitaStreakAI.placeholder')}
  placeholderTextColor="#64748b"
  style={styles.input}
  multiline
  maxLength={600}
  editable={!sending}
  returnKeyType="send"
  blurOnSubmit
  onFocus={() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true })
    }, 300)
  }}
  onSubmitEditing={() => handleSend()}
/>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!question.trim() || sending) && styles.sendButtonDisabled,
                ]}
                onPress={() => handleSend()}
                disabled={!question.trim() || sending}
              >
                <Ionicons name="arrow-up" size={22} color="#071124" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.disclaimerBox}>
            <Ionicons name="information-circle-outline" size={19} color="#fbbf24" />
            <Text style={styles.disclaimerText}>
              {review?.disclaimer ?? t('vitaStreakAI.disclaimer')}
            </Text>
          </View>
        </ScrollView>

        <AlertComponent />
      </LinearGradient>
    </KeyboardAvoidingView>
  )
}

function AnalysisSection({
  title,
  items,
  tone,
}: {
  title: string
  items: string[]
  tone: SectionTone
}) {
  const validItems = items.filter((item) => typeof item === 'string' && item.trim())
  if (validItems.length === 0) return null

  const config = sectionConfig[tone]

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: config.background }]}>
          <Ionicons name={config.icon} size={21} color={config.color} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {validItems.map((item, index) => (
        <View key={title + '-' + index} style={styles.sectionRow}>
          <View style={[styles.sectionDot, { backgroundColor: config.color }]} />
          <Text style={styles.sectionText}>{item}</Text>
        </View>
      ))}
    </View>
  )
}

function ChatBubble({ message }: { message: AIRoutineChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      {!isUser ? (
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={15} color="#071124" />
        </View>
      ) : null}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.bubbleLabel, isUser && styles.userBubbleLabel]}>
          {isUser ? t('vitaStreakAI.you') : t('vitaStreakAI.assistant')}
        </Text>
        <Text style={styles.bubbleText}>{message.content}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradient: { flex: 1 },
  content: {
  padding: 20,
  paddingTop: 58,
  paddingBottom: 80,
},
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  headerText: { flex: 1 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { color: 'white', fontSize: 32, fontWeight: '900', letterSpacing: -0.7 },
  subtitle: { color: '#cbd5e1', fontSize: 14, lineHeight: 20, marginTop: 3 },
heroCard: {
  backgroundColor: '#0b1430',
  borderWidth: 1,
  borderColor: 'rgba(167,139,250,0.30)',
  borderRadius: 28,
  padding: 20,
  marginBottom: 22,
  overflow: 'hidden',
},
  thinkingBubble: {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  gap: 8,
},
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextBox: { marginTop: 16 },
  heroTitle: { color: 'white', fontSize: 24, fontWeight: '900' },
  heroText: { color: '#cbd5e1', fontSize: 15, lineHeight: 22, marginTop: 7 },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 14,
    padding: 12,
    backgroundColor: 'rgba(125,211,252,0.08)',
    borderRadius: 14,
  },
  privacyText: { flex: 1, color: '#bae6fd', fontSize: 12, lineHeight: 18, fontWeight: '700' },
  analyzeButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#7dd3fc',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
  },
  analyzeButtonText: { color: '#071124', fontSize: 17, fontWeight: '900' },
  disabledButton: { opacity: 0.65 },
  analysisBlock: { marginBottom: 8 },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  blockEyebrow: { color: '#a78bfa', fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  blockTitle: { color: 'white', fontSize: 23, fontWeight: '900', marginTop: 3 },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(74,222,128,0.11)',
  },
  scrollView: {
  flex: 1,
},
  readyText: { color: '#86efac', fontSize: 11, fontWeight: '900' },
  sectionCard: {
    backgroundColor: 'rgba(9,18,40,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 22,
    padding: 17,
    marginBottom: 12,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 13 },
  sectionIcon: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { flex: 1, color: 'white', fontSize: 17, fontWeight: '900' },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 9 },
  sectionDot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  sectionText: { flex: 1, color: '#cbd5e1', fontSize: 14, lineHeight: 21 },
  chatCard: {
  backgroundColor: '#0b1430',
  borderWidth: 1,
  borderColor: 'rgba(196,181,253,0.26)',
  borderRadius: 26,
  padding: 17,
  marginTop: 10,
},
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  chatHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(196,181,253,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderText: { flex: 1 },
  chatTitle: { color: 'white', fontSize: 18, fontWeight: '900' },
  chatSubtitle: { color: '#94a3b8', fontSize: 12, lineHeight: 17, marginTop: 2 },
  clearButton: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  chipsRow: {
  gap: 8,
  paddingVertical: 15,
  paddingRight: 8,
  alignItems: 'center',
},

chip: {
  alignSelf: 'flex-start',
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 999,
  backgroundColor: 'rgba(124,58,237,0.16)',
  borderWidth: 1,
  borderColor: 'rgba(196,181,253,0.24)',
},

chipText: {
  color: '#ddd6fe',
  fontSize: 12,
  fontWeight: '800',
  flexShrink: 0,
},
  emptyChat: {
    minHeight: 90,
    borderRadius: 17,
    backgroundColor: 'rgba(15,23,42,0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 7,
  },
  emptyChatText: { color: '#94a3b8', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  messagesBox: {
  width: '100%',
  gap: 12,
  paddingVertical: 6,
},
  messageRow: {
  width: '100%',
  flexDirection: 'row',
  alignItems: 'flex-end',
  gap: 8,
},

messageRowUser: {
  justifyContent: 'flex-end',
},
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#c4b5fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
  maxWidth: '82%',
  minWidth: 90,
  borderRadius: 17,
  paddingHorizontal: 14,
  paddingVertical: 12,
  flexShrink: 1,
},
userBubble: {
  backgroundColor: 'rgba(14,116,144,0.52)',
  borderBottomRightRadius: 5,
  alignSelf: 'flex-end',
},

assistantBubble: {
  backgroundColor: 'rgba(76,29,149,0.30)',
  borderWidth: 1,
  borderColor: 'rgba(196,181,253,0.18)',
  borderBottomLeftRadius: 5,
  alignSelf: 'flex-start',
},
  bubbleLabel: { color: '#c4b5fd', fontSize: 10, fontWeight: '900', marginBottom: 4 },
  userBubbleLabel: { color: '#bae6fd' },
  bubbleText: {
  color: '#e2e8f0',
  fontSize: 14,
  lineHeight: 21,
  flexShrink: 1,
},
  thinkingText: { color: '#c4b5fd', fontSize: 12, fontWeight: '800' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 9,
    marginTop: 15,
    backgroundColor: 'rgba(15,23,42,0.76)',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
    padding: 7,
  },
  input: { flex: 1, minHeight: 42, maxHeight: 110, color: 'white', fontSize: 14, lineHeight: 20, paddingHorizontal: 9, paddingVertical: 10 },
  sendButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#7dd3fc', justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { opacity: 0.35 },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: 'rgba(245,158,11,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    borderRadius: 18,
    padding: 14,
    marginTop: 15,
  },
  disclaimerText: { flex: 1, color: '#fde68a', fontSize: 12, lineHeight: 18, fontWeight: '700' },
})
