import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Welcome = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Poltem Akademi</Text>
        <Text style={styles.subtitle}>Geleceğin eğitim platformuna hoş geldiniz.</Text>
        
        <View style={styles.buttonContainer}>
          {/* Giriş Yap Butonu - Artik Login sayfasına gider */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('Login')} 
          >
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>
          
          {/* Kayıt Ol Butonu - Register sayfasına gider */}
          <TouchableOpacity 
            style={[styles.button, styles.registerButton]} 
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    // Eğer butonlar birbirine yapışık çıkarsa buradaki gap: 15 kalsın. 
    // Eğer hata verirse gap yerine butonlara marginHorizontal: 7.5 verebilirsin.
    gap: 15, 
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    backgroundColor: '#007bff',
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  registerButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Welcome;