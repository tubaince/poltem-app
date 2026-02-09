import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const Register = ({ navigation }: any) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>
      <Text style={styles.subtitle}>Poltem Akademi'ye katılmak için bilgileri doldur.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ad Soyad</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Adınız Soyadınız"
          onChangeText={(val) => setForm({...form, name: val})}
        />

        <Text style={styles.label}>E-posta</Text>
        <TextInput 
          style={styles.input} 
          placeholder="ornek@mail.com"
          keyboardType="email-address"
          onChangeText={(val) => setForm({...form, email: val})}
        />

        <Text style={styles.label}>Şifre</Text>
        <TextInput 
          style={styles.input} 
          placeholder="******"
          secureTextEntry
          onChangeText={(val) => setForm({...form, password: val})}
        />
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Verify')} // Kayıt sonrası onay sayfasına
      >
        <Text style={styles.buttonText}>Devam Et</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#333', marginBottom: 5, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default Register;