import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { supabase } from '../../lib/supabase';

const ForgotPassword = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    const cleanEmail = email.trim();
    
    if (!cleanEmail) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi giriniz.');
      return;
    }

    setLoading(true);
    try {
      // 1. ADIM: Supabase Auth'un şifre sıfırlama tetikleyicisini çalıştır
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);

      if (error) {
        // Teknik hataları kontrol et ve özel mesajlar fırlat
        if (error.message.includes("User not found") || error.status === 422) {
          throw new Error('Bu e-posta adresine ait bir kullanıcı bulunamadı.');
        }
        if (error.message.includes("rate limit") || error.message.includes("limit exceeded")) {
          throw new Error('Çok fazla istek gönderildi. Lütfen birkaç dakika bekleyip tekrar deneyiniz.');
        }
        throw error;
      }
      
      // 2. ADIM: Başarılıysa kullanıcıyı bilgilendir ve VerifyOTP'ye yönlendir
      Alert.alert(
        'Kod Gönderildi', 
        'E-posta adresinize 6 haneli bir doğrulama kodu gönderilmiştir.',
        [
          { 
            text: 'Tamam', 
            onPress: () => navigation.navigate('VerifyOTP', { email: cleanEmail }) 
          }
        ]
      );

    } catch (err: any) {
  
      Alert.alert('Hata', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.centeredContent}>
            
            <View style={styles.header}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logo} 
                resizeMode="contain" 
              />
              <Text style={styles.title}>Şifrenizi Yenileyin</Text>
              <Text style={styles.subTitle}>
                Doğrulama kodu göndermemiz için e-posta adresinizi girin.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.cardItem}>
                <Text style={styles.label}>E-posta Adresiniz</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="ornek@mail.com" 
                  value={email} 
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.resetBtn} 
              onPress={handleResetPassword} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.resetBtnText}>KOD GÖNDER</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.goBackBtn}
            >
              <Text style={styles.goBackText}>« Geri Dön</Text>
            </TouchableOpacity>

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
    justifyContent: 'center', 
    paddingHorizontal: 25 
  },
  centeredContent: { width: '100%' },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 140, height: 70 },
  title: { fontSize: 22, fontWeight: '600', color: '#1A1A1A', marginTop: 15 },
  subTitle: { 
    fontSize: 14, 
    color: '#666', 
    textAlign: 'center', 
    marginTop: 8,
    paddingHorizontal: 20 
  },
  inputGroup: { 
    backgroundColor: '#F8F9FB', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#EAECEF',
    marginBottom: 20
  },
  cardItem: { paddingHorizontal: 16, paddingVertical: 10 },
  label: { fontSize: 12, color: '#666', marginBottom: 2 },
  input: { fontSize: 15, color: '#333', height: 40 },
  resetBtn: { 
    backgroundColor: '#007AFF', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  resetBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  goBackBtn: { marginTop: 25, alignItems: 'center' },
  goBackText: { color: '#007AFF', fontSize: 14, fontWeight: '500' }
});

export default ForgotPassword;