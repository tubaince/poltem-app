import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { supabase } from '../../lib/supabase';

const Payments = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);

  const fetchPaymentData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('submissions')
          .select(`
            status,
            created_at,
            surveys:survey_id (
              title,
              reward_amount
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setPaymentHistory(data);
          const total = data.reduce((sum, item) => {
            const surveyData = Array.isArray(item.surveys) ? item.surveys[0] : item.surveys;
            const amount = Number(surveyData?.reward_amount) || 0;
            return sum + amount;
          }, 0);
          setTotalBalance(total);
        }
      }
    } catch (error) {
      console.error("Ödeme verileri çekilemedi:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPaymentData(true);
  }, []);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const renderPaymentItem = ({ item }: any) => {
    const surveyData = Array.isArray(item.surveys) ? item.surveys[0] : item.surveys;
    return (
      <View style={styles.historyCard}>
        <View style={styles.historyInfo}>
          <Text style={styles.historyTitle}>{surveyData?.title || 'Bilinmeyen Araştırma'}</Text>
          <Text style={styles.historyDate}>
            {new Date(item.created_at).toLocaleDateString('tr-TR')}
          </Text>
        </View>
        <Text style={styles.historyAmount}>+{surveyData?.reward_amount || 0} TL</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <FlatList
        data={paymentHistory}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderPaymentItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EC7928']} />
        }
        ListHeaderComponent={
          <View>
            {/* Üst Görsel Alanı */}
            <View style={styles.imageContainer}>
              <Image 
                source={require('../../assets/payment2.png')} 
                style={styles.headerImage}
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backText}>←</Text>
              </TouchableOpacity>
            </View>

            {/* Kazanç Kartı */}
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Toplam Kazancınız</Text>
              <Text style={styles.balanceAmount}>{totalBalance} TL</Text>
              <View style={styles.divider} />
            </View>

            <Text style={styles.sectionTitle}>Ödeme Geçmişi</Text>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz onaylanmış bir ödemeniz bulunmuyor.</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.scrollContent}
      />
      
      {loading && !refreshing && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#EC7928" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingBottom: 30 },
  imageContainer: { 
    width: '100%', 
    height: 400,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden'
  },
  headerImage: { 
    width: '95%', 
    height: '95%',
    transform: [{ translateY: -20 }] 
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  backText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  balanceContainer: {
    alignItems: 'center',
    marginTop: -60,
    backgroundColor: '#FFF',
    marginHorizontal: 25,
    borderRadius: 24,
    padding: 25,
    elevation: 12,
    shadowColor: '#EC7928',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  balanceLabel: { fontSize: 13, color: '#999', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2 },
  balanceAmount: { fontSize: 42, fontWeight: 'bold', color: '#1A1A1A', marginTop: 5 },
  divider: { width: 45, height: 4, backgroundColor: '#EC7928', borderRadius: 2, marginTop: 15 },
  sectionTitle: { fontSize: 19, fontWeight: 'bold', color: '#333', marginLeft: 25, marginTop: 35, marginBottom: 15 },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5'
  },
  historyInfo: { flex: 1 },
  historyTitle: { fontSize: 15, fontWeight: '600', color: '#444' },
  historyDate: { fontSize: 12, color: '#BBB', marginTop: 4 },
  historyAmount: { fontSize: 17, fontWeight: 'bold', color: '#2ECC71' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#AAA', fontSize: 15 },
  loader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)' }
});

export default Payments;