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

// Sabit Veriler
const TURKISH_BANKS = [
  "Akbank", "Denizbank", "Garanti BBVA", "Halkbank", "Kuveyt Türk",
  "QNB Finansbank", "Türkiye İş Bankası", "Vakıfbank", "Yapı Kredi", "Ziraat Bankası", "Diğer"
].sort();

const CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
  "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
  "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir",
  "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa",
  "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak", "Diğer"
].sort();

const EDUCATION_LEVELS = [
  "İlkokul", "Ortaokul", "Lise", "Önlisans", "Lisans", "Yüksek Lisans", "Doktora"
];

const EMPLOYMENT_STATUSES = [
  "Çalışıyor",
  "Çalışmıyor",
  "Belirtmek istemiyorum"
];

const OCCUPATIONS = [
  "Akademisyen", "Bankacı", "Doktor", "Eczacı", "Esnaf", "Finans Uzmanı", 
  "Grafik Tasarımcı", "Hemşire", "İnsan Kaynakları", "İşçi", "Mimar", "Muhasebeci", 
  "Mühendis", "Öğretmen", "Öğrenci", "Satış Temsilcisi", "Yazılımcı", "Diğer"
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
  city: string;
  education_level: string;
  occupation: string;
}

const Profile = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalType, setModalType] = useState<'bank' | 'city' | 'education' | 'occupation' | null>(null);

  const [formData, setFormData] = useState<Partial<ProfileData>>({
    full_name: '',
    phone: '',
    iban: '',
    bank_name: '',
    full_name_bank: '',
    is_researcher: false,
    gender: '',
    birth_date: '',
    city: '',
    education_level: '',
    occupation: ''
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
          birth_date: data.birth_date || '',
          city: data.city || '',
          education_level: data.education_level || '',
          occupation: data.occupation || ''
        });
      }
    } catch (error) {
      console.log('Hata:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!formData.full_name || !formData.phone || !formData.gender || !formData.birth_date || !formData.city || !formData.education_level || !formData.occupation) {
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

  const renderModalContent = () => {
    let data: string[] = [];
    let title = "";
    let field: keyof ProfileData;

    switch (modalType) {
      case 'bank': data = TURKISH_BANKS; title = "Banka Seçiniz"; field = "bank_name"; break;
      case 'city': data = CITIES; title = "Şehir Seçiniz"; field = "city"; break;
      case 'education': data = EDUCATION_LEVELS; title = "Eğitim Düzeyi"; field = "education_level"; break;
      case 'occupation': title = "Çalışma Durumu"; field = "occupation"; break;
      default: return null;
    }

    // ÖZEL DURUM: ÇALIŞMA DURUMU VE MESLEK SEÇİMİ
    if (modalType === 'occupation') {
      return (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <Text style={styles.closeText}>Kapat</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {EMPLOYMENT_STATUSES.map((status) => {
                const isSelected = formData.occupation === status || (status === "Çalışıyor" && OCCUPATIONS.includes(formData.occupation || ""));
                
                return (
                  <View key={status}>
                    <TouchableOpacity
                      style={styles.selectionItem}
                      onPress={() => {
                        if (status === "Çalışıyor") {
                          setFormData({ ...formData, occupation: "Çalışıyor" });
                        } else {
                          setFormData({ ...formData, occupation: status });
                          setModalType(null);
                        }
                      }}
                    >
                      <Text style={styles.selectionItemText}>{status}</Text>
                      <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>

                    {/* KOŞULLU MESLEK LİSTESİ */}
                    {status === "Çalışıyor" && isSelected && (
                      <View style={styles.jobSubList}>
                        <Text style={styles.jobSubTitle}>Mesleğinizi Seçiniz:</Text>
                        {OCCUPATIONS.map((job) => (
                          <TouchableOpacity
                            key={job}
                            style={styles.subSelectionItem}
                            onPress={() => {
                              setFormData({ ...formData, occupation: job });
                              setModalType(null);
                            }}
                          >
                            <Text style={styles.subSelectionText}>{job}</Text>
                            <View style={[styles.radioOuter, formData.occupation === job && styles.radioOuterSelected, { width: 18, height: 18 }]}>
                              {formData.occupation === job && <View style={[styles.radioInner, { width: 10, height: 10 }]} />}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      );
    }

    // DİĞER STANDART LİSTELER (ŞEHİR, BANKA VB.)
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setModalType(null)}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.selectionItem}
                onPress={() => {
                  setFormData({ ...formData, [field]: item });
                  setModalType(null);
                }}
              >
                <Text style={styles.selectionItemText}>{item}</Text>
                <View style={[styles.radioOuter, formData[field] === item && styles.radioOuterSelected]}>
                  {formData[field] === item && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    );
  };

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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demografik Bilgiler</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şehir *</Text>
            <TouchableOpacity style={styles.input} onPress={() => setModalType('city')}>
              <Text style={{ color: formData.city ? '#333' : '#999' }}>{formData.city || "Şehir seçiniz"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Eğitim Düzeyi *</Text>
            <TouchableOpacity style={styles.input} onPress={() => setModalType('education')}>
              <Text style={{ color: formData.education_level ? '#333' : '#999' }}>{formData.education_level || "Eğitim düzeyi seçiniz"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Çalışma Durumu *</Text>
            <TouchableOpacity style={styles.input} onPress={() => setModalType('occupation')}>
              <Text style={{ color: formData.occupation ? '#333' : '#999' }}>{formData.occupation || "Seçiniz"}</Text>
            </TouchableOpacity>
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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Banka Adı</Text>
            <TouchableOpacity style={styles.input} onPress={() => setModalType('bank')}>
              <Text style={{ color: formData.bank_name ? '#333' : '#999' }}>{formData.bank_name || "Banka seçmek için dokunun"}</Text>
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

      <Modal visible={modalType !== null} animationType="slide" transparent={true}>
        {renderModalContent()}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  backButton: { padding: 5, width: 40 },
  backButtonText: { fontSize: 24, color: '#333', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  scrollPadding: { padding: 20, paddingBottom: 50 },
  subText: { fontSize: 13, color: '#888', marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#33435D', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', paddingBottom: 5 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 12, color: '#555', marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 15, color: '#333', minHeight: 48, justifyContent: 'center' },
  saveBtn: { backgroundColor: '#EC7928', paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  genderOption: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, alignItems: 'center', marginHorizontal: 5, backgroundColor: '#fff' },
  genderSelected: { backgroundColor: '#EC7928', borderColor: '#EC7928' },
  genderText: { color: '#666', fontWeight: '500' },
  genderTextSelected: { color: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '80%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  closeText: { color: '#EC7928', fontWeight: 'bold' },
  selectionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  selectionItemText: { fontSize: 16, color: '#333', flex: 1 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  radioOuterSelected: { borderColor: '#EC7928' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#EC7928' },

  jobSubList: { backgroundColor: '#F0F2F5', paddingLeft: 15, borderRadius: 10, marginTop: 5, marginBottom: 10, paddingBottom: 10 },
  jobSubTitle: { fontSize: 13, fontWeight: 'bold', color: '#EC7928', marginTop: 15, marginBottom: 5 },
  subSelectionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingRight: 15, borderBottomWidth: 0.5, borderBottomColor: '#D1D1D1' },
  subSelectionText: { fontSize: 15, color: '#444' }
});

export default Profile;