import React, { useEffect, useState } from 'react'
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
  StatusBar,
} from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../supabase-config'
import useCustomAlert from '../hooks/useCustomAlert'
import { t } from '@/i18n'

export default function ResetPasswordCodeScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { showAlert, AlertComponent } = useCustomAlert()

  const [email, setEmail] = useState(String(params.email || ''))
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingToken, setIsSendingToken] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordStrength = {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#€£$%^&*(),.?":{}|<>]/.test(password),
  }

  const passwordOk =
    passwordStrength.hasMinLength &&
    passwordStrength.hasUpperCase &&
    passwordStrength.hasLowerCase &&
    passwordStrength.hasNumber &&
    passwordStrength.hasSpecialChar

  const sendNewToken = async () => {
    const cleanEmail = email.trim()

    if (!cleanEmail) {
      showAlert(t('resetPassword.missingEmailTitle'), t('resetPassword.missingEmailMessage'), [
        { text: 'OK', onPress: () => {} },
      ])
      return
    }

    try {
      setIsSendingToken(true)

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail)

      if (error) throw error

      setToken('')

      showAlert(
        t('resetPassword.newCodeSentTitle'),
        t('resetPassword.newCodeSentMessage'),
        [{ text: 'OK', onPress: () => {} }]
      )
    } catch (error) {
      console.error('RESET SEND TOKEN ERROR:', error)
      showAlert(t('resetPassword.error'), t('resetPassword.sendCodeError'), [
        { text: 'OK', onPress: () => {} },
      ])
    } finally {
      setIsSendingToken(false)
    }
  }

  const getFriendlyError = (message?: string) => {
    const text = message?.toLowerCase?.() || ''

    if (text.includes('different from the old password')) {
      return t('resetPassword.samePasswordError')
    }

    if (text.includes('token has expired') || text.includes('invalid')) {
      return t('resetPassword.expiredCodeError')
    }

    return t('resetPassword.genericError')
  }

  const handleReset = async () => {
    const cleanEmail = email.trim()
    const cleanToken = token.trim()

    if (!cleanEmail || !cleanToken || !password || !confirmPassword) {
      showAlert(t('resetPassword.error'), t('resetPassword.fillAllFields'), [{ text: 'OK', onPress: () => {} }])
      return
    }

    if (password !== confirmPassword) {
      showAlert(t('resetPassword.error'), t('resetPassword.passwordsMismatch'), [{ text: 'OK', onPress: () => {} }])
      return
    }

    if (!passwordOk) {
      showAlert(
        t('resetPassword.incompletePassword'),
        t('resetPassword.passwordRulesMessage'),
        [{ text: 'OK', onPress: () => {} }]
      )
      return
    }

    setIsLoading(true)

    try {
      console.log('RESET OTP VERIFY START')

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'recovery',
      })

      console.log('RESET OTP VERIFY RESULT:', {
        hasSession: !!data.session,
        hasUser: !!data.user,
        error: verifyError,
      })

      if (verifyError) throw verifyError

      console.log('RESET UPDATE USER START')

      const { error: updateError } = await supabase.auth.updateUser({ password })

      console.log('RESET UPDATE USER RESULT:', updateError)

      if (updateError) throw updateError

      await supabase.auth.signOut({ scope: 'global' })

      showAlert(
        t('resetPassword.updatedTitle'),
        t('resetPassword.updatedMessage'),
        [{ text: 'OK', onPress: () => router.replace('/login-vitastreak' as any) }]
      )
    } catch (error: any) {
      console.error('RESET OTP ERROR:', error)
      showAlert(t('resetPassword.error'), getFriendlyError(error?.message), [
        { text: 'OK', onPress: () => {} },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <LinearGradient colors={['#0f172a', '#1e1b4b', '#312e81', '#155e75']} style={styles.gradient}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>{t('resetPassword.title')}</Text>
            <Text style={styles.subtitle}>
              {t('resetPassword.subtitle')}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={t('resetPassword.email')}
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder={t('resetPassword.emailCode')}
              placeholderTextColor="#94a3b8"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
            />

            <PasswordInput
              value={password}
              onChangeText={setPassword}
              placeholder={t('resetPassword.newPassword')}
              visible={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
            />

            {password.length > 0 && (
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>{t('resetPassword.passwordMustContain')}</Text>
                <Requirement ok={passwordStrength.hasMinLength} text={t('resetPassword.minCharacters')} />
                <Requirement ok={passwordStrength.hasUpperCase} text={t('resetPassword.uppercaseLetter')} />
                <Requirement ok={passwordStrength.hasLowerCase} text={t('resetPassword.lowercaseLetter')} />
                <Requirement ok={passwordStrength.hasNumber} text={t('resetPassword.number')} />
                <Requirement ok={passwordStrength.hasSpecialChar} text={t('resetPassword.specialCharacter')} />
              </View>
            )}

            <PasswordInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('resetPassword.confirmNewPassword')}
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.disabledButton]}
              onPress={handleReset}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{t('resetPassword.saveNewPassword')}</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, isSendingToken && styles.disabledButton]}
              onPress={sendNewToken}
              disabled={isSendingToken}
            >
              {isSendingToken ? <ActivityIndicator color="white" /> : <Text style={styles.secondaryButtonText}>{t('resetPassword.requestNewCode')}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/login-vitastreak' as any)}>
              <Text style={styles.linkText}>{t('resetPassword.backToLogin')}</Text>
            </TouchableOpacity>
          </View>

          <AlertComponent />
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  )
}

function PasswordInput({ value, onChangeText, placeholder, visible, onToggle }: any) {
  return (
    <View style={styles.passwordContainer}>
      <TextInput
        style={styles.passwordInput}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
      />
      <TouchableOpacity style={styles.eyeIcon} onPress={onToggle}>
        <Ionicons name={visible ? 'eye-off' : 'eye'} size={23} color="#94a3b8" />
      </TouchableOpacity>
    </View>
  )
}

function Requirement({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View style={styles.requirementItem}>
      <Ionicons name={ok ? 'checkmark-circle' : 'close-circle'} size={16} color={ok ? '#22c55e' : '#ef4444'} />
      <Text style={styles.requirementText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 22 },
  card: {
    backgroundColor: 'rgba(15,23,42,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 26,
    padding: 22,
  },
  title: { color: 'white', fontSize: 30, fontWeight: '900', marginBottom: 8 },
  subtitle: { color: '#cbd5e1', fontSize: 14, lineHeight: 20, marginBottom: 22 },
  input: {
    backgroundColor: 'rgba(30,41,59,0.95)',
    borderWidth: 1,
    borderColor: '#334155',
    color: 'white',
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 14,
  },
  passwordContainer: { position: 'relative', marginBottom: 14 },
  passwordInput: {
    backgroundColor: 'rgba(30,41,59,0.95)',
    borderWidth: 1,
    borderColor: '#334155',
    color: 'white',
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingRight: 52,
    fontSize: 16,
  },
  eyeIcon: { position: 'absolute', right: 16, top: 15 },
  requirementsContainer: {
    backgroundColor: 'rgba(30,41,59,0.72)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  requirementsTitle: { color: 'white', fontWeight: '800', marginBottom: 8 },
  requirementItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
  requirementText: { color: '#cbd5e1', marginLeft: 7, fontSize: 13 },
  button: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(103,232,249,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: { opacity: 0.65 },
  buttonText: { color: 'white', fontSize: 17, fontWeight: '900' },
  secondaryButtonText: { color: '#67e8f9', fontSize: 15, fontWeight: '900' },
  linkButton: { marginTop: 18, alignItems: 'center' },
  linkText: { color: '#cbd5e1', fontSize: 15, fontWeight: '800' },
})