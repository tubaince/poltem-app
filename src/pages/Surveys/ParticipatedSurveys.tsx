import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  StatusBar,
  ScrollView
} from 'react-native';
import { supabase } from '../../lib/supabase';

const ParticipatedSurveys = ({ navigation }: any) => {
  // 1. Tüm Hook'ları en üstte ve her zaman aynı sırada tanımlıyoruz (Hatanın çözümü burası)
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myParticipations, setMyParticipations] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('TÜMÜ');

  const filters = [
    { id: 'TÜMÜ', label: 'Tümü' },
    { id: 'approved', label: 'ONAYLANAN' },
    { id: 'pending', label: 'ONAY BEKLEYEN' },
    { id: 'rejected', label: 'REDDEDİLEN' },
  ];

  // Veri çekme fonksiyonu
  const fetchParticipatedSurveys = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('submissions')
          .select(`
            status,
            created_at,
            surveys (
              id,
              title,
              description,
              reward_amount,
              estimated_time
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMyParticipations(data || []);
      }
    } catch (error) {
      console.error("Katılım verileri çekilemedi:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Filtreleme işlemi (Hook kuralına uygun şekilde useMemo kullanımı)
  const filteredData = useMemo(() => {
    if (activeFilter === 'TÜMÜ') return myParticipations;
    return myParticipations.filter(item => item.status === activeFilter);
  }, [myParticipations, activeFilter]);

  useEffect(() => {
    fetchParticipatedSurveys();
  }, [fetchParticipatedSurveys]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchParticipatedSurveys(true);
  }, [fetchParticipatedSurveys]);

  const renderItem = ({ item }: any) => {
    const survey = item.surveys;
    const status = item.status;

    return (
      <View style={styles.surveyCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.surveyTitle}>{survey?.title}</Text>
          <Text style={styles.rewardText}>{survey?.reward_amount || '0'} TL</Text>
        </View>

        <Text style={styles.surveyDescription} numberOfLines={2}>
          {survey?.description || 'Açıklama bulunmuyor.'}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            Katılım: {new Date(item.created_at).toLocaleDateString('tr-TR')}
          </Text>
          
          {status === 'pending' && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>Onay Bekliyor</Text>
            </View>
          )}
          {status === 'approved' && (
            <View style={styles.approvedBadge}>
              <Text style={styles.approvedBadgeText}>✅ Onaylandı</Text>
            </View>
          )}
          {status === 'rejected' && (
            <View style={styles.rejectedBadge}>
              <Text style={styles.rejectedBadgeText}>❌ Reddedildi</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Katıldığım Araştırmalar</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filtre Çubuğu */}
      <View style={styles.filterWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterScroll}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                activeFilter === filter.id && styles.activeFilterTab
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text style={[
                styles.filterTabText,
                activeFilter === filter.id && styles.activeFilterTabText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.mainArea}>
        {loading ? (
          <ActivityIndicator size="large" color="#EC7928" style={{ marginTop: 50 }} />
        ) : filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EC7928']} />
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
                {activeFilter === 'TÜMÜ' 
                    ? "Henüz hiçbir araştırmaya katılmadınız." 
                    : "Bu kategoride kayıt bulunamadı."}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#FFF'
  },
  backButton: { padding: 5 },
  backButtonText: { fontSize: 24, color: '#333' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  filterWrapper: { backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  filterScroll: { paddingHorizontal: 10, paddingVertical: 12 },
  filterTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F0F2F5', marginHorizontal: 5, borderWidth: 1, borderColor: '#E4E6EB',
  },
  activeFilterTab: { backgroundColor: '#EC7928', borderColor: '#EC7928' },
  filterTabText: { fontSize: 12, fontWeight: '700', color: '#65676B' },
  activeFilterTabText: { color: '#FFF' },
  mainArea: { flex: 1 },
  listContent: { padding: 15 },
  surveyCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#F0F0F0', elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  surveyTitle: { fontSize: 16, fontWeight: 'bold', color: '#33435D', flex: 1 },
  rewardText: { fontSize: 14, fontWeight: 'bold', color: '#33435D' },
  surveyDescription: { fontSize: 13, color: '#777', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 11, color: '#999' },
  pendingBadge: { backgroundColor: '#FFF4E5', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#FFD591' },
  pendingBadgeText: { color: '#D48806', fontSize: 11, fontWeight: 'bold' },
  approvedBadge: { backgroundColor: '#F6FFED', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#B7EB8F' },
  approvedBadgeText: { color: '#389E0D', fontSize: 11, fontWeight: 'bold' },
  rejectedBadge: { backgroundColor: '#FFF1F0', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#FFA39E' },
  rejectedBadgeText: { color: '#CF1322', fontSize: 11, fontWeight: 'bold' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 15 }
});

export default ParticipatedSurveys;