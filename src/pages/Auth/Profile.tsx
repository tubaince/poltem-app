import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Modal,
  FlatList
} from 'react-native';
import { supabase } from '../../lib/supabase';

// Türkiye'deki popüler bankalar listesi
const TURKISH_BANKS = [
  "Akbank", "Denizbank", 
  "Garanti BBVA", "Halkbank", "Kuveyt Türk", 
  "QNB Finansbank", "Türkiye İş Bankası", "Vakıfbank", 
  "Yapı Kredi", "Ziraat Bankası", "Diğer"
].sort();

interface ProfileData {
  id: string;
  full_name: string;
  phone: string;
  iban: string;
  bank_name: string;
  full_name_bank: string;
  is_researcher: boolean; 
  gender: string;
  birth_date: string;
}

const Profile = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false); // Modal kontrolü
  
  const [formData, setFormData] = useState<Partial<ProfileData>>({
    full_name: '',
    phone: '',
    iban: '',
    bank_name: '',
    full_name_bank: '',
    is_researcher: false,
    gender: '',
    birth_date: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigation.replace('Login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          iban: data.iban || '',
          bank_name: data.bank_name || '',
          full_name_bank: data.full_name_bank || '',
          is_researcher: data.is_researcher || false,
          gender: data.gender || '',
          birth_date: data.birth_date || ''
        });
      }
    } catch (error) {
      console.log('Hata:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!formData.full_name || !formData.phone || !formData.gender || !formData.birth_date) {
      Alert.alert('Eksik Bilgi', 'Lütfen yıldızlı (*) alanların tamamını doldurunuz.');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      const updates = {
        id: user.id,
        ...formData,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
      navigation.goBack();
      
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setSaving(false);
    }
  }

  const selectBank = (bank: string) => {
    setFormData({ ...formData, bank_name: bank });
    setBankModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2176FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Bilgileri</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollPadding}>
        <Text style={styles.subText}>Hedef kitle analizi ve ödemeler için bilgilerinizi eksiksiz doldurunuz.</Text>

        {formData.is_researcher && (
          <View style={styles.researcherBadge}>
            <Text style={styles.researcherBadgeText}>✓ Onaylı Araştırmacı Hesabı</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad Soyad *</Text>
            <TextInput
              style={styles.input}
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              placeholder="Ad Soyad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cinsiyet *</Text>
            <View style={styles.genderContainer}>
              {['Kadın', 'Erkek'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderOption, formData.gender === g && styles.genderSelected]}
                  onPress={() => setFormData({ ...formData, gender: g })}
                >
                  <Text style={[styles.genderText, formData.gender === g && styles.genderTextSelected]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Doğum Tarihi *</Text>
            <TextInput
              style={styles.input}
              value={formData.birth_date}
              onChangeText={(text) => setFormData({ ...formData, birth_date: text })}
              placeholder="YYYY-AA-GG (Örn: 1995-05-20)"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              placeholder="05xx xxx xx xx"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ödeme Bilgileri (İsteğe Bağlı)</Text>
          
          {/* BANKA SEÇİM ALANI (YENİ DROPDOWN MANTIĞI) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Banka Adı</Text>
            <TouchableOpacity 
              style={styles.input} 
              onPress={() => setBankModalVisible(true)}
            >
              <Text style={{ color: formData.bank_name ? '#333' : '#999' }}>
                {formData.bank_name || "Banka seçmek için dokunun"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>IBAN</Text>
            <TextInput
              style={styles.input}
              value={formData.iban}
              onChangeText={(text) => setFormData({ ...formData, iban: text })}
              autoCapitalize="characters"
              placeholder="TRxx xxxx..."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hesap Sahibi</Text>
            <TextInput
              style={styles.input}
              value={formData.full_name_bank}
              onChangeText={(text) => setFormData({ ...formData, full_name_bank: text })}
              placeholder="Banka hesabındaki isim"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>PROFİLİ GÜNCELLE</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* BANKA SEÇİM MODALI */}
      <Modal visible={bankModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Banka Seçiniz</Text>
              <TouchableOpacity onPress={() => setBankModalVisible(false)}>
                <Text style={styles.closeText}>Kapat</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={TURKISH_BANKS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.bankItem} onPress={() => selectBank(item)}>
                  <Text style={styles.bankItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  backButton: { padding: 5, width: 40 },
  backButtonText: { fontSize: 24, color: '#333', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  scrollPadding: { padding: 20, paddingBottom: 50 },
  subText: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', paddingBottom: 5 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 13, color: '#444', marginBottom: 6, fontWeight: '500' },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 16, color: '#333', justifyContent: 'center' },
  saveBtn: { backgroundColor: '#2176FF', paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  researcherBadge: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2176FF',
    alignItems: 'center'
  },
  researcherBadgeText: { color: '#2176FF', fontWeight: 'bold', fontSize: 14 },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  genderOption: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, alignItems: 'center', marginHorizontal: 5, backgroundColor: '#fff' },
  genderSelected: { backgroundColor: '#2176FF', borderColor: '#2176FF' },
  genderText: { color: '#666', fontWeight: '500' },
  genderTextSelected: { color: '#fff' },

  // Modal Stilleri
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '70%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  closeText: { color: '#2176FF', fontWeight: 'bold' },
  bankItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  bankItemText: { fontSize: 16, color: '#333' }
});

export default Profile;