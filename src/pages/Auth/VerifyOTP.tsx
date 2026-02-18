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
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { supabase } from '../../lib/supabase';

const VerifyOTP = ({ route, navigation }: any) => {
  const { email } = route.params; // ForgotPassword'dan gelen mail
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (token.length < 6) {
      Alert.alert('Hata', 'Lütfen 6 haneli kodu eksiksiz giriniz.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery',
      });

      if (error) throw error;

      // Başarılıysa şifre yenileme sayfasına yönlendir
      navigation.navigate('ResetPassword');
    } catch (err: any) {
      Alert.alert('Doğrulama Hatası', 'Kod hatalı veya süresi dolmuş olabilir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Kodu Doğrula</Text>
            <Text style={styles.subTitle}>
              <Text style={{ fontWeight: 'bold' }}>{email}</Text> adresine gönderilen 6 haneli kodu giriniz.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <TextInput 
              style={styles.otpInput} 
              placeholder="000000" 
              value={token} 
              onChangeText={setToken}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyBtnText}>DOĞRULA</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackBtn}>
            <Text style={styles.goBackText}>« Kodu Tekrar Gönder</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 25 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  subTitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 10, lineHeight: 20 },
  inputGroup: { marginBottom: 30 },
  otpInput: { 
    backgroundColor: '#F8F9FB', 
    borderWidth: 1, 
    borderColor: '#EAECEF', 
    borderRadius: 12, 
    padding: 15, 
    fontSize: 28, 
    textAlign: 'center', 
    letterSpacing: 10,
    color: '#007AFF',
    fontWeight: 'bold'
  },
  verifyBtn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center' },
  verifyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  goBackBtn: { marginTop: 25, alignItems: 'center' },
  goBackText: { color: '#666', fontSize: 14 }
});

export default VerifyOTP;