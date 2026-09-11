import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase-config'
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Image,
  View,
  StatusBar,
} from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { useAuth } from '../auth-context'
import useCustomAlert from '../hooks/useCustomAlert'
import { t } from '@/i18n'

export default function LoginScreen() {
  const router = useRouter()
  const { login } = useAuth()
  const { showAlert, AlertComponent } = useCustomAlert()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  useEffect(() => {
    const loadRememberMe = async () => {
      try {
        const savedRememberMe = await AsyncStorage.getItem('rememberMe')
        const savedEmail = await AsyncStorage.getItem('savedEmail')

        if (savedRememberMe === 'true') {
          setRememberMe(true)
          if (savedEmail) setEmail(savedEmail)
        }
      } catch (error) {
        console.error('Erro ao carregar preferências:', error)
      }
    }

    loadRememberMe()
  }, [])

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showAlert(t('login.error'), t('login.fillAllFields'), [
        { text: 'OK', onPress: () => {} },
      ])
      return
    }

    setIsLoading(true)

    try {
      if (rememberMe) {
        await AsyncStorage.setItem('rememberMe', 'true')
        await AsyncStorage.setItem('savedEmail', email.trim())
      } else {
        await AsyncStorage.removeItem('rememberMe')
        await AsyncStorage.removeItem('savedEmail')
      }

      await login(email.trim(), password, rememberMe)
      router.replace('/' as any)
    } catch (error: any) {
      console.log('Erro de login:', error?.code, error?.message)

      if (
  error?.message === 'email-not-verified' ||
  error?.message?.includes('email-not-verified') ||
  error?.message?.toLowerCase?.().includes('email not confirmed')
) {
  showAlert(
    t('login.confirmEmailTitle'),
    t('login.confirmEmailMessage'),
    [
      { text: t('login.cancel'), onPress: () => {} },
      { text: t('login.resend'), onPress: handleResendConfirmation },
    ]
  )
  return
}

      showAlert(
        t('login.loginErrorTitle'),
        t('login.invalidCredentials'),
        [{ text: 'OK', onPress: () => {} }]
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
  const resetEmail = forgotPasswordEmail.trim()

  if (!resetEmail) {
    showAlert(t('login.error'), t('login.enterEmailToReset'), [
      { text: 'OK', onPress: () => {} },
    ])
    return
  }

  setIsLoading(true)

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail)

    if (error) throw error

    showAlert(
      t('login.emailSent'),
      t('login.resetCodeSent'),
      [
        {
          text: 'OK',
          onPress: () =>
            router.push({
              pathname: '/reset-password-code' as any,
              params: { email: resetEmail },
            }),
        },
      ]
    )
  } catch (error) {
    console.error('Erro ao enviar reset:', error)
    showAlert(
      'Erro',
      t('login.resetEmailError'),
      [{ text: 'OK', onPress: () => {} }]
    )
  } finally {
    setIsLoading(false)
  }
}
  
  const handleResendConfirmation = async () => {
  if (!email.trim()) {
    showAlert(t('login.missingEmail'), t('login.enterEmailToResend'), [
      { text: 'OK', onPress: () => {} },
    ])
    return
  }

  try {
    setIsLoading(true)

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: 'vitastreak://',
      },
    })

    if (error) throw error

    showAlert(
      t('login.emailSent'),
      t('login.confirmationResent'),
      [{ text: 'OK', onPress: () => {} }]
    )
  } catch (error) {
    console.error('Erro ao reenviar confirmação:', error)
    showAlert(t('login.error'), t('login.resendError'), [
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

      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#312e81', '#155e75']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid
            extraScrollHeight={30}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/vitastreak-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.title}>{t('common.appName')}</Text>
              <Text style={styles.subtitle}>
                {t('login.subtitle')}
              </Text>
            </View>

            <View style={styles.card}>
              {showForgotPassword ? (
                <>
                  <Text style={styles.cardTitle}>{t('login.recoverPassword')}</Text>
                  <Text style={styles.cardSubtitle}>
                    {t('login.recoveryInstructions')}
                  </Text>

                  <TextInput
                    style={styles.input}
                    placeholder={t('login.email')}
                    placeholderTextColor="#94a3b8"
                    value={forgotPasswordEmail}
                    onChangeText={setForgotPasswordEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.disabledButton]}
                    onPress={handleForgotPassword}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.buttonText}>{t('login.sendEmail')}</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => setShowForgotPassword(false)}
                  >
                    <Text style={styles.linkText}>{t('login.backToLogin')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.cardTitle}>{t('login.title')}</Text>

                  <TextInput
                    style={styles.input}
                    placeholder={t('login.email')}
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder={t('login.password')}
                      placeholderTextColor="#94a3b8"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />

                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={23}
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.optionsContainer}>
                    <View style={styles.rememberContainer}>
                      <Switch
                        value={rememberMe}
                        onValueChange={setRememberMe}
                        trackColor={{ false: '#475569', true: '#7c3aed' }}
                        thumbColor={rememberMe ? '#ffffff' : '#cbd5e1'}
                      />
                      <Text style={styles.rememberText}>{t('login.rememberMe')}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        setForgotPasswordEmail(email)
                        setShowForgotPassword(true)
                      }}
                    >
                      <Text style={styles.forgotText}>
                        {t('login.forgotPassword')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.disabledButton]}
                    onPress={handleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.buttonText}>{t('login.signIn')}</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.registerLink}
                    onPress={() => router.push('/register-vitastreak' as any)}
                  >
                    <Text style={styles.registerText}>
                      {t('login.noAccount')}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </KeyboardAwareScrollView>

          <AlertComponent />
        </KeyboardAvoidingView>
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
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 118,
    height: 118,
    marginBottom: 14,
  },
  title: {
    color: 'white',
    fontSize: 36,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 26,
    padding: 22,
  },
cardTitle: {
  color: 'white',
  fontSize: 26,
  fontWeight: '900',
  marginBottom: 18,
},
cardSubtitle: {
  color: '#cbd5e1',
  fontSize: 14,
  lineHeight: 20,
  marginBottom: 24,
},
  input: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderWidth: 1,
    borderColor: '#334155',
    color: 'white',
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 14,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  passwordInput: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderWidth: 1,
    borderColor: '#334155',
    color: 'white',
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingRight: 52,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 15,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    color: '#e2e8f0',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  forgotText: {
    color: '#67e8f9',
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '900',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '700',
  },
  linkButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    color: '#67e8f9',
    fontSize: 15,
    fontWeight: '800',
  },
})