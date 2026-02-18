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

const ResetPassword = ({ navigation }: any) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      Alert.alert('Başarılı', 'Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.', [
        { text: 'Giriş Yap', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err: any) {
      Alert.alert('Hata', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Yeni Şifre Oluştur</Text>
            <Text style={styles.subTitle}>Güçlü bir şifre belirleyerek hesabınızı koruyun.</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.cardItem}>
              <Text style={styles.label}>Yeni Şifre</Text>
              <TextInput 
                style={styles.input} 
                placeholder="••••••••" 
                secureTextEntry 
                value={password} 
                onChangeText={setPassword} 
              />
            </View>
            <View style={[styles.cardItem, { borderTopWidth: 1, borderTopColor: '#EAECEF' }]}>
              <Text style={styles.label}>Şifreyi Onayla</Text>
              <TextInput 
                style={styles.input} 
                placeholder="••••••••" 
                secureTextEntry 
                value={confirmPassword} 
                onChangeText={setConfirmPassword} 
              />
            </View>
          </View>

          <TouchableOpacity style={styles.resetBtn} onPress={handleReset} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.resetBtnText}>ŞİFREYİ GÜNCELLE</Text>}
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
  subTitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 10 },
  inputGroup: { backgroundColor: '#F8F9FB', borderRadius: 12, borderWidth: 1, borderColor: '#EAECEF', marginBottom: 20 },
  cardItem: { paddingHorizontal: 16, paddingVertical: 10 },
  label: { fontSize: 12, color: '#666', marginBottom: 2 },
  input: { fontSize: 15, color: '#333', height: 40 },
  resetBtn: { backgroundColor: '#2176FF', padding: 16, borderRadius: 12, alignItems: 'center' },
  resetBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default ResetPassword;