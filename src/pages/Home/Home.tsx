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
  Pressable,
  FlatList,
  Alert
} from 'react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

const Home = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [isResearcher, setIsResearcher] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('Araştırmalar');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [userResponses, setUserResponses] = useState<any[]>([]); // Katılım durumlarını tutacak

  const slideAnim = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const calculateAgeGroup = (birthDate: string) => {
    if (!birthDate) return 'Hepsi';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    if (age >= 18 && age <= 24) return '18-24';
    if (age >= 25 && age <= 34) return '25-34';
    if (age >= 35 && age <= 44) return '35-44';
    if (age >= 45 && age <= 54) return '45-54';
    if (age >= 55) return '55+';
    return 'Dışı';
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setIsResearcher(profile.is_researcher);
          // Hem anketleri hem de kullanıcının geçmiş katılımlarını (submissions) çekiyoruz
          await Promise.all([
            fetchCompatibleSurveys(profile),
            fetchUserResponses(user.id)
          ]);
        }
      }
    } catch (error) {
      console.error("Başlatma hatası:", error);
    } finally {
      setLoading(false);
    }
  };


  const fetchUserResponses = async (userId: string) => {
    const { data, error } = await supabase
      .from('submissions')
      .select('survey_id, status')
      .eq('user_id', userId);

    if (error) {
      console.error("Katılım verisi çekilemedi:", error);
    } else if (data) {
      setUserResponses(data);
    }
  };

  const fetchCompatibleSurveys = async (userProfile: any) => {
    try {
      let { data: allSurveys, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (allSurveys) {
        const userAgeGroup = calculateAgeGroup(userProfile.birth_date);
        const filtered = allSurveys.filter(survey => {
          if (userProfile.is_researcher) return true;
          const genderMatch = survey.target_gender === 'Hepsi' || survey.target_gender === userProfile.gender;
          const ageMatch = survey.target_age_group === 'Hepsi' || survey.target_age_group === userAgeGroup;
          const cityMatch = survey.target_city === 'Hepsi' || survey.target_city === userProfile.city;
          const eduMatch = survey.target_education === 'Hepsi' || survey.target_education === userProfile.education_level;
          const occMatch = !survey.target_occupation ||
            survey.target_occupation.toLowerCase() === userProfile.occupation?.toLowerCase();

          return genderMatch && ageMatch && cityMatch && eduMatch && occMatch;
        });
        setSurveys(filtered);
      }
    } catch (error) {
      console.error("Anket çekme hatası:", error);
    }
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      Animated.timing(slideAnim, { toValue: -width, duration: 300, useNativeDriver: true }).start(() => setIsMenuOpen(false));
    } else {
      setIsMenuOpen(true);
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };


  const renderSurveyItem = ({ item }: any) => {
    const response = userResponses.find(r => r.survey_id === item.id);
    const isPending = response?.status === 'pending';
    const isApproved = response?.status === 'approved';
    const isRejected = response?.status === 'rejected';

    return (
      <TouchableOpacity
        style={[
          styles.surveyCard,
          (isPending || isApproved) && styles.completedCard
        ]}
        onPress={() => {
          if (isPending) {
            Alert.alert("Bilgi", "Bu araştırmayı tamamladınız. Veriler araştırmacı tarafından kontrol edildikten sonra bakiyenize eklenecektir.");
          } else if (isApproved) {
            Alert.alert("Bilgi", "Bu araştırma başarıyla onaylandı ve ödemeniz yansıtıldı.");
          } else if (isRejected) {
            Alert.alert("Bilgi", "Bu katılımınız reddedildi. Detaylar için destek ile iletişime geçebilirsiniz.");
          } else {
            navigation.navigate('AnswerSurvey', { survey: item });
          }
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.surveyTitle}>{item.title}</Text>
          <Text style={styles.rewardText}>{item.reward_amount || '25'} TL</Text>
        </View>


        <Text style={styles.surveyDescription} numberOfLines={2}>
          {item.description || 'Bu araştırma için detaylı açıklama bulunmuyor.'}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.timeText}>~{item.estimated_time || '5'} dk</Text>
          {/* DURUM ETİKETLERİ */}
          {isPending && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>Onay Bekliyor</Text>
            </View>
          )}
          {isApproved && (
            <View style={styles.approvedBadge}>
              <Text style={styles.approvedBadgeText}>✅ Onaylandı</Text>
            </View>
          )}
          {isRejected && (
            <View style={styles.rejectedBadge}>
              <Text style={styles.rejectedBadgeText}>❌ Reddedildi</Text>
            </View>
          )}

        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#EC7928" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu} style={styles.iconButton}>
          <Text style={styles.menuBurgerText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeTab}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mainArea}>
        {surveys.length > 0 ? (
          <FlatList
            data={surveys}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderSurveyItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.searchCircle}>
              <Text style={styles.emptySearchEmoji}>🔍</Text>
            </View>
            <Text style={styles.emptyText}>
              Hedef kitlesinde yer aldığınız araştırmalar yayınlandığında sizi bilgilendireceğiz.
            </Text>
          </View>
        )}
      </View>

      {isResearcher && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateSurvey')}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Araştırmalar')}>
          <Text style={[styles.navLabel, activeTab === 'Araştırmalar' && styles.activeNav]}>Araştırmalar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>

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
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#FFF'
  },
  menuBurgerText: { fontSize: 28, color: '#333', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  iconButton: { padding: 5 },
  mainArea: { flex: 1 },
  listContent: { padding: 15 },
  surveyCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#F0F0F0', elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  completedCard: {
    opacity: 0.85,
    backgroundColor: '#FBFBFB',
    borderColor: '#EAEAEA'
  },
  pendingBadge: {
    backgroundColor: '#FFF4E5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFD591'
  },
  pendingBadgeText: {
    color: '#D48806',
    fontSize: 11,
    fontWeight: 'bold'
  },
  approvedBadge: {
    backgroundColor: '#F6FFED',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#B7EB8F'
  },
  approvedBadgeText: {
    color: '#389E0D',
    fontSize: 11,
    fontWeight: 'bold'
  },
  rejectedBadge: {
    backgroundColor: '#FFF1F0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFA39E'
  },
  rejectedBadgeText: {
    color: '#CF1322',
    fontSize: 11,
    fontWeight: 'bold'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  surveyTitle: { fontSize: 16, fontWeight: 'bold', color: '#33435D', flex: 1 },
  rewardText: { fontSize: 14, fontWeight: 'bold', color: '#33435D' },
  surveyDescription: { fontSize: 13, color: '#777', lineHeight: 18, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeText: { fontSize: 11, color: '#EC7928' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  searchCircle: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: '#EEE',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20, backgroundColor: '#FFF'
  },
  emptySearchEmoji: { fontSize: 40, opacity: 0.2 },
  emptyText: { textAlign: 'center', color: '#888', lineHeight: 22, marginBottom: 30 },
  createSurveyButton: { backgroundColor: '#EC7928', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
  createSurveyButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  bottomNav: { flexDirection: 'row', height: 70, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingBottom: 10, backgroundColor: '#FFF' },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 14, color: '#999', fontWeight: '500' },
  activeNav: { color: '#EC7928' },
  fab: {
    position: 'absolute', bottom: 90, right: 20, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#EC7928', justifyContent: 'center', alignItems: 'center', elevation: 5
  },
  fabText: { color: '#FFF', fontSize: 32, fontWeight: '300' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10 },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: width * 0.75, backgroundColor: '#FFF', zIndex: 20, paddingTop: 40 },
  menuList: { flex: 1, paddingVertical: 10 },
  menuItem: { paddingVertical: 18, paddingHorizontal: 25 },
  menuItemText: { fontSize: 16, color: '#333' },
  signOutButton: { padding: 25, borderTopWidth: 1, borderTopColor: '#EEE' },
  signOutText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 16 },
  topSection: { marginTop: 10 },
  logoSection: { alignItems: 'center', marginBottom: 15 },
  myCustomLogo: { width: 140, height: 70 },
});

export default Home;