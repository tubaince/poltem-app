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

const PhoneLogin = ({ navigation }: any) => {
  const [phone, setPhone] = useState('+90');
  const [loading, setLoading] = useState(false);

  const handlePhoneLogin = async () => {
    if (phone.length < 10) {
      Alert.alert('Hata', 'Lütfen geçerli bir telefon numarası giriniz.');
      return;
    }

    setLoading(true);
    try {
   
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
      });

      if (error) throw error;

      Alert.alert('Kod Gönderildi', 'Doğrulama kodu telefonunuza iletildi.');

      navigation.navigate('Verify', { phone: phone.trim() });
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.centeredContent}>
            
            <View style={styles.header}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logo} 
                resizeMode="contain" 
              />
              <Text style={styles.title}>Telefon ile Giriş Yap</Text>
              <Text style={styles.subTitle}>
                Giriş yapmak için telefon numaranızı giriniz.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.cardItem}>
                <Text style={styles.label}>Telefon Numaranız</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="+90 5xx xxx xx xx" 
                  value={phone} 
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.loginBtn} 
              onPress={handlePhoneLogin} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>GİRİŞ YAP</Text>
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
  input: { fontSize: 16, color: '#333', height: 40 },
  loginBtn: { 
    backgroundColor: '#007AFF', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  loginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  goBackBtn: { marginTop: 25, alignItems: 'center' },
  goBackText: { color: '#007AFF', fontSize: 14, fontWeight: '500' }
});

export default PhoneLogin;