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
  SafeAreaView
} from 'react-native';
import { supabase } from '../../lib/supabase';

// Arayüze is_researcher eklendi
interface ProfileData {
  id: string;
  full_name: string;
  phone: string;
  iban: string;
  bank_name: string;
  full_name_bank: string;
  is_researcher: boolean; 
}

const Profile = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<ProfileData>>({
    full_name: '',
    phone: '',
    iban: '',
    bank_name: '',
    full_name_bank: '',
    is_researcher: false
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
          is_researcher: data.is_researcher || false
        });
      }
    } catch (error) {
      console.log('Hata:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!formData.full_name || !formData.phone) {
      Alert.alert('Eksik Bilgi', 'Lütfen Ad-Soyad ve Telefon alanlarını doldurunuz.');
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

      if (error) {
        if (error.message.includes("row level security")) {
             Alert.alert('Bilgi', 'Kayıt işlemi veritabanı izni bekliyor, ama devam edebilirsiniz.');
             navigation.goBack();
             return;
        }
        throw error;
      }

      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
      navigation.goBack();
      
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setSaving(false);
    }
  }

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
        <Text style={styles.subText}>Bilgilerinizi buradan güncelleyebilirsiniz.</Text>

        {/* Araştırmacı Statüsü Göstergesi (Hata almamak için metin sarmalaması kontrol edildi) */}
        {formData.is_researcher ? (
          <View style={styles.researcherBadge}>
            <Text style={styles.researcherBadgeText}>✓ Onaylı Araştırmacı Hesabı</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad Soyad *</Text>
            <TextInput
              style={styles.input}
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Banka Bilgileri</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Banka Adı</Text>
            <TextInput
              style={styles.input}
              value={formData.bank_name}
              onChangeText={(text) => setFormData({ ...formData, bank_name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>IBAN</Text>
            <TextInput
              style={styles.input}
              value={formData.iban}
              onChangeText={(text) => setFormData({ ...formData, iban: text })}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hesap Sahibi</Text>
            <TextInput
              style={styles.input}
              value={formData.full_name_bank}
              onChangeText={(text) => setFormData({ ...formData, full_name_bank: text })}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>DEĞİŞİKLİKLERİ KAYDET</Text>}
        </TouchableOpacity>
      </ScrollView>
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
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 16, color: '#333' },
  saveBtn: { backgroundColor: '#2176FF', paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  // Yeni eklenen rozet stili
  researcherBadge: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2176FF',
    alignItems: 'center'
  },
  researcherBadgeText: { color: '#2176FF', fontWeight: 'bold', fontSize: 14 }
});

export default Profile;