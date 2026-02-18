import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';

import { supabase } from '../../lib/supabase';

const Login = ({ navigation }: any) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Giriş alanlarının kontrolü
    if (!identifier.trim() || !password) {
      Alert.alert('Uyarı', 'Lütfen e-posta/kullanıcı adı ve şifrenizi girin.');
      return;
    }

    setLoading(true);

    try {

      // Eğer identifier '@' içermiyorsa, varsayılan domain eklenerek e-posta formatına getirilir.
      const finalEmail = identifier.includes('@') 
        ? identifier.trim() 
        : `${identifier.trim()}@poltemakademi.com`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: finalEmail,
        password: password,
      });

      if (error) {
        // Supabase'den gelen hatalar
        if (error.message === 'Invalid login credentials') {
          throw new Error('E-posta veya şifre hatalı.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Lütfen e-posta adresinizi onaylayın.');
        }
        throw error;
      }

      if (data?.session) {
        // Giriş başarılı, ana sayfaya yönlendir
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }

    } catch (error: any) {
      Alert.alert('Giriş Hatası', error.message || 'Bilgileriniz hatalı görünüyor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          
          <View style={styles.topSection}>
            <View style={styles.logoSection}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.myCustomLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.mainTitle}>Hesabınıza Giriş Yapın</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Kullanıcı Adı veya E-posta Adresiniz</Text>
                <TextInput
                  style={styles.input}
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="kullanıcı adı veya eposta"
                  placeholderTextColor="#A0A0A0"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={[styles.inputContainer, { borderTopWidth: 1, borderTopColor: '#E0E0E0' }]}>
                <Text style={styles.label}>Şifreniz</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="••••••••••••"
                    placeholderTextColor="#A0A0A0"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <Text style={styles.eyeEmoji}>{showPassword ? '👁️' : '🔒'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.forgotBtnArea}>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Şifrenizi mi unuttunuz?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.loginBtn, loading && styles.disabledBtn]} 
              onPress={handleLogin} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>GİRİŞ YAP</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerArea}>
              <TouchableOpacity onPress={() => navigation.navigate('PhoneLogin')}>
                <Text style={styles.phoneLink}>Telefon numaranız ile giriş yapın</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerSection}>
            <View style={styles.registerPanel}>
              <Text style={styles.newAccountText}>Yeni Kullanıcı?</Text>
              <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerBtnText}>KAYIT OL</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: {
    flexGrow: 1, 
    paddingHorizontal: 25,
    paddingVertical: 20,
    justifyContent: 'space-between' 
  },
  topSection: { marginTop: 10 },
  logoSection: { alignItems: 'center', marginBottom: 15 },
  myCustomLogo: { width: 140, height: 70 },
  mainTitle: { fontSize: 24, textAlign: 'center', color: '#1A1A1A', fontWeight: '500' },

  formSection: { flex: 1, justifyContent: 'center', marginVertical: 20 },
  card: { backgroundColor: '#F8F9FB', borderRadius: 8, borderWidth: 1, borderColor: '#EAECEF', overflow: 'hidden' },
  inputContainer: { padding: 12 },
  label: { fontSize: 13, color: '#666', marginBottom: 4 },
  input: { fontSize: 16, color: '#333', paddingVertical: 6 },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { padding: 8, backgroundColor: '#2176FF', borderRadius: 6 },
  eyeEmoji: { fontSize: 14, color: '#fff' },

  forgotBtnArea: { alignSelf: 'center', marginTop: 15 },
  forgotText: { color: '#2176FF', fontSize: 14, fontWeight: '500' },

  loginBtn: { backgroundColor: '#2176FF', padding: 16, borderRadius: 8, marginTop: 25, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#A0C4FF' },
  loginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

  dividerArea: { alignItems: 'center', marginTop: 25 },
  phoneLink: { color: '#2176FF', fontWeight: '600' },

  footerSection: { marginBottom: 10 },
  registerPanel: {
    backgroundColor: '#F8F9FB',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAECEF'
  },
  newAccountText: { fontSize: 16, color: '#333' },
  registerBtn: { backgroundColor: '#2176FF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 },
  registerBtnText: { color: '#fff', fontWeight: 'bold' }
});

export default Login;