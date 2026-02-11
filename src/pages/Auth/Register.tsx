import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';

const Register = ({ navigation }: any) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // 1. Boş alan kontrolü
    if (!form.email || !form.password || !form.name) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);

    try {
      // 2. Supabase Auth kaydı
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          // SQL Tetikleyicin (trigger) buradaki 'full_name' bilgisini kullanır
          data: {
            full_name: form.name,
          },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        // 3. Başarılı kayıt sonrası kullanıcıyı Login sayfasına yönlendiriyoruz
        Alert.alert(
          'Kayıt Başarılı', 
          'Hesabınız başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.',
          [{ text: 'Giriş Yap', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error: any) {
      // Supabase'den gelen hataları (örn: email kullanımda) gösterir
      Alert.alert('Kayıt Hatası', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>
      <Text style={styles.subtitle}>Poltem Akademi'ye katılmak için bilgileri doldur.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ad Soyad</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Adınız Soyadınız"
          value={form.name}
          onChangeText={(val) => setForm({...form, name: val})}
        />

        <Text style={styles.label}>E-posta</Text>
        <TextInput 
          style={styles.input} 
          placeholder="ornek@mail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(val) => setForm({...form, email: val})}
        />

        <Text style={styles.label}>Şifre</Text>
        <TextInput 
          style={styles.input} 
          placeholder="******"
          secureTextEntry
          value={form.password}
          onChangeText={(val) => setForm({...form, password: val})}
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && { opacity: 0.7 }]} 
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Kayıt Ol</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.loginLink} 
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.loginLinkText}>Zaten hesabınız var mı? Giriş yapın.</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20, 
    backgroundColor: '#fff', 
    justifyContent: 'center' 
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#333', marginBottom: 5, fontWeight: '500' },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 15, 
    fontSize: 16 
  },
  button: { 
    backgroundColor: '#28a745', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    height: 55, 
    justifyContent: 'center' 
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginLinkText: { color: '#007bff', fontSize: 14 }
});

export default Register;