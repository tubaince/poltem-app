import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  Pressable
} from 'react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

const Home = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [isResearcher, setIsResearcher] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('Araştırmalar');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_researcher')
          .eq('id', user.id)
          .single();
        if (data) setIsResearcher(data.is_researcher);
      }
    } catch (error) {
      console.error("Profil çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsMenuOpen(false));
    } else {
      setIsMenuOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2176FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ÜST HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu} style={styles.iconButton}>
          <Text style={styles.menuBurgerText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeTab}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ANA İÇERİK ALANI */}
      <View style={styles.mainArea}>
        <View style={styles.emptyState}>
          <View style={styles.searchCircle}>
            <Text style={styles.emptySearchEmoji}>🔍</Text>
          </View>
          <Text style={styles.emptyText}>
            Hedef kitlesinde yer aldığınız araştırmalar yayınlandığında sizi e-posta ile bilgilendireceğiz.
          </Text>

          {/* ARAŞTIRMACILAR İÇİN EK BUTON */}
          {isResearcher && (
            <TouchableOpacity 
              style={styles.createSurveyButton}
              onPress={() => navigation.navigate('CreateSurvey')}
            >
              <Text style={styles.createSurveyButtonText}>Yeni Araştırma Başlat</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* SAĞ ALT "+" BUTONU (Dinamik) */}
      {isResearcher && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateSurvey')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* ALT NAVBAR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Araştırmalar')}>
          <Text style={[styles.navLabel, activeTab === 'Araştırmalar' && styles.activeNav]}>Araştırmalar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>

      {/* SOL AÇILIR MENÜ (DRAWER) */}
      {isMenuOpen && <Pressable style={styles.overlay} onPress={toggleMenu} />}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.topSection}>
          <View style={styles.logoSection}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.myCustomLogo}
              resizeMode="contain"
            />
          </View>
        </View>

        <ScrollView style={styles.menuList}>
          {[
            { title: "Yeni Araştırmalar" },
            { title: "Katıldığım Araştırmalar" },
            { title: "Ödemeler" },
            { title: "Bildirimler" },
            { title: "İstatistikler" },
            { title: "Profil", route: 'Profile' },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                if (item.route) navigation.navigate(item.route);
                toggleMenu();
              }}
            >
              <Text style={styles.menuItemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0'
  },
  menuBurgerText: { fontSize: 28, color: '#333', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: '500', color: '#333' },
  iconButton: { padding: 5 },
  mainArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyState: { alignItems: 'center', width: '100%' },
  searchCircle: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: '#EEE',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20
  },
  emptySearchEmoji: { fontSize: 40, opacity: 0.2 },
  emptyText: { textAlign: 'center', color: '#888', lineHeight: 22, marginBottom: 30 },
  
  // YENİ ARAŞTIRMA BUTONU STİLİ
  createSurveyButton: {
    backgroundColor: '#2176FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createSurveyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  bottomNav: { flexDirection: 'row', height: 70, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingBottom: 10 },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 14, color: '#999', fontWeight: '500' },
  activeNav: { color: '#2176FF' },
  fab: {
    position: 'absolute', bottom: 90, right: 20, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#2176FF', justifyContent: 'center', alignItems: 'center', elevation: 5
  },
  fabText: { color: '#FFF', fontSize: 32, fontWeight: 'light' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10 },
  drawer: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: width * 0.75,
    backgroundColor: '#FFF', zIndex: 20, paddingTop: 40
  },
  menuList: { flex: 1, paddingVertical: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 25 },
  menuItemText: { fontSize: 16, color: '#333', fontWeight: '400' },
  signOutButton: { padding: 25, borderTopWidth: 1, borderTopColor: '#EEE' },
  signOutText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 16 },
  topSection: { marginTop: 10 },
  logoSection: { alignItems: 'center', marginBottom: 15 },
  myCustomLogo: { width: 140, height: 70 },
});

export default Home;