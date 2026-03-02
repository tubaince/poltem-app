import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  FlatList,
  Alert,
  RefreshControl
} from 'react-native';

// Custom Hook ve Sidebar importları
import { useHomeData } from '../../hooks/useHomeData'; 
import Sidebar from '../../components/Sidebar';

const { width } = Dimensions.get('window');

const Home = ({ navigation }: any) => {

  const [activeTab, setActiveTab] = useState('Araştırmalar');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;


  const { 
    loading, 
    refreshing, 
    isResearcher, 
    surveys, 
    userResponses, 
    fetchData,
    handleSignOut 
  } = useHomeData(navigation);

  // --- 2. YARDIMCI FONKSİYONLAR ---
  const toggleMenu = useCallback(() => {
    if (isMenuOpen) {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true
      }).start(() => setIsMenuOpen(false));
    } else {
      setIsMenuOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [isMenuOpen, slideAnim]);

  const onRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#EC7928" />
      </View>
    );
  }

  const renderSurveyItem = ({ item }: any) => {
    const response = userResponses.find(r => r.survey_id === item.id);
    const isPending = response?.status === 'pending';
    const isApproved = response?.status === 'approved';
    const isRejected = response?.status === 'rejected';

    return (
      <TouchableOpacity
        style={[styles.surveyCard, (isPending || isApproved) && styles.completedCard]}
        onPress={() => {
          if (isPending) {
            Alert.alert("Bilgi", "Bu araştırmayı tamamladınız. Veriler kontrol edildikten sonra bakiyenize eklenecektir.");
          } else if (isApproved) {
            Alert.alert("Bilgi", "Bu araştırma başarıyla onaylandı.");
          } else if (isRejected) {
            Alert.alert("Bilgi", "Katılımınız reddedildi. Destek ile iletişime geçebilirsiniz.");
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
          {item.description || 'Açıklama bulunmuyor.'}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.timeText}>~{item.estimated_time || '5'} dk</Text>
          {isPending && <View style={styles.pendingBadge}><Text style={styles.pendingBadgeText}>Onay Bekliyor</Text></View>}
          {isApproved && <View style={styles.approvedBadge}><Text style={styles.approvedBadgeText}>✅ Onaylandı</Text></View>}
          {isRejected && <View style={styles.rejectedBadge}><Text style={styles.rejectedBadgeText}>❌ Reddedildi</Text></View>}
        </View>
      </TouchableOpacity>
    );
  };

  // --- 4. ANA UI RENDER ---
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
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EC7928']} tintColor={'#EC7928'} />
            }
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.emptyState}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={'#EC7928'} />}
          >
            <View style={styles.searchCircle}><Text style={styles.emptySearchEmoji}>🔍</Text></View>
            <Text style={styles.emptyText}>Henüz uygun bir araştırma bulunmuyor.</Text>
          </ScrollView>
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

      <Sidebar 
        isMenuOpen={isMenuOpen}
        slideAnim={slideAnim}
        toggleMenu={toggleMenu}
        navigation={navigation}
        handleSignOut={handleSignOut}
      />
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
  completedCard: { opacity: 0.85, backgroundColor: '#FBFBFB', borderColor: '#EAEAEA' },
  pendingBadge: { backgroundColor: '#FFF4E5', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#FFD591' },
  pendingBadgeText: { color: '#D48806', fontSize: 11, fontWeight: 'bold' },
  approvedBadge: { backgroundColor: '#F6FFED', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#B7EB8F' },
  approvedBadgeText: { color: '#389E0D', fontSize: 11, fontWeight: 'bold' },
  rejectedBadge: { backgroundColor: '#FFF1F0', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#FFA39E' },
  rejectedBadgeText: { color: '#CF1322', fontSize: 11, fontWeight: 'bold' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  surveyTitle: { fontSize: 16, fontWeight: 'bold', color: '#33435D', flex: 1 },
  rewardText: { fontSize: 14, fontWeight: 'bold', color: '#33435D' },
  surveyDescription: { fontSize: 13, color: '#777', lineHeight: 18, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeText: { fontSize: 11, color: '#EC7928' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  searchCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: '#EEE', justifyContent: 'center', alignItems: 'center', marginBottom: 20, backgroundColor: '#FFF' },
  emptySearchEmoji: { fontSize: 40, opacity: 0.2 },
  emptyText: { textAlign: 'center', color: '#888', lineHeight: 22 },
  bottomNav: { flexDirection: 'row', height: 70, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingBottom: 10, backgroundColor: '#FFF' },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 14, color: '#999', fontWeight: '500' },
  activeNav: { color: '#EC7928' },
  fab: { position: 'absolute', bottom: 90, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#EC7928', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#FFF', fontSize: 32, fontWeight: '300' },
});

export default Home;