import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { supabase } from '../../lib/supabase';

const Home = ({ navigation }: any) => {
  // 1. Tüm Hook'lar her zaman en üstte ve aynı sırada çalışmalı
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isResearcher, setIsResearcher] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Giriş yapmış kullanıcının auth bilgisini al
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserEmail(user.email ?? null);

          // Veritabanındaki profiles tablosundan rol kontrolü yap
          const { data, error } = await supabase
            .from('profiles')
            .select('is_researcher')
            .eq('id', user.id)
            .single();

          if (data && !error) {
            setIsResearcher(data.is_researcher);
          }
        }
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  // 2. Render akışını bozmamak için koşullu görünümü ana return içinde yönetiyoruz
  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2176FF" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>Hoş Geldiniz!</Text>
          <Text style={styles.subtitle}>{userEmail ? userEmail : 'Başarıyla giriş yaptınız.'}</Text>

          {/* ARAŞTIRMACI ÖZEL BUTONU */}
          {isResearcher && (
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate('CreateSurvey')}
            >
              <Text style={styles.createBtnText}>Anket Oluştur +</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileButtonText}>👤 Profil Bilgilerimi Düzenle</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#2176FF' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 10, marginBottom: 20 },
  profileButton: {
    backgroundColor: '#2176FF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3
  },
  profileButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  createBtn: {
    backgroundColor: '#2176FF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 5
  },
  createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  button: { marginTop: 10, backgroundColor: '#dc3545', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});

export default Home;