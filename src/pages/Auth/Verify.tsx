import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';

const Verify = ({ route, navigation }: any) => {
  // Login veya Register sayfasından gelen email bilgisini alıyoruz
  const email = route.params?.email || ''; 
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (token.length < 6) {
      Alert.alert('Hata', 'Lütfen 6 haneli kodu eksiksiz girin.');
      return;
    }

    setLoading(true);

    // Supabase OTP Doğrulama işlemi
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email', // E-posta doğrulaması yaptığımızı belirtiyoruz
    });

    setLoading(false);

    if (error) {
      Alert.alert('Doğrulama Başarısız', 'Kod hatalı veya süresi dolmuş olabilir. Tekrar deneyin.');
    } else {
      Alert.alert('Başarılı', 'Giriş işleminiz onaylandı!', [
        { text: 'Devam Et', onPress: () => navigation.navigate('Home') }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Kodu Doğrula</Text>
        <Text style={styles.subtitle}>
          <Text style={{ fontWeight: 'bold' }}>{email}</Text> adresine gönderilen 6 haneli doğrulama kodunu aşağıya girin.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="000000"
          value={token}
          onChangeText={setToken}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus={true} // Sayfa açılınca klavye otomatik açılsın
        />

        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Onayla ve Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.resendButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.resendText}>E-postayı yanlış mı girdiniz? Geri dön.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Tasarım (Styles)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8, // Rakamların arasını açar
    color: '#333',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    height: 55,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: '#007AFF',
    fontSize: 13,
  },
});

export default Verify;