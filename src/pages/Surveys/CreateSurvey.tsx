import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Clipboard
} from 'react-native';

import { supabase } from '../../lib/supabase';

const CITIES = [
  "Hepsi", "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
  "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
  "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir",
  "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa",
  "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak", "Diğer"
];
const EDUCATION_LEVELS = ["Hepsi", "İlkokul", "Ortaokul", "Lise", "Önlisans", "Lisans", "Yüksek Lisans", "Doktora"];

const CreateSurvey = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [googleFormLink, setGoogleFormLink] = useState('');
  const [completionCode, setCompletionCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Hedef Kitle State'leri
  const [gender, setGender] = useState('Hepsi');
  const [ageGroup, setAgeGroup] = useState('Hepsi');
  const [targetCity, setTargetCity] = useState('Hepsi');
  const [targetEducation, setTargetEducation] = useState('Hepsi');
  const [targetOccupation, setTargetOccupation] = useState('');

  // Modal Kontrolü
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'city' | 'education' | null>(null);

  // Yapıştırma Fonksiyonu
  const fetchCopiedText = async () => {
    try {
      const text = await Clipboard.getString();
      setGoogleFormLink(text);
    } catch (err) {
      Alert.alert('Hata', 'Panodan metin alınamadı.');
    }
  };
  const handleSubmit = async () => {
    if (!title.trim() || !googleFormLink.trim() || !completionCode.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen anket başlığı, linki ve onay kodunu doldurun.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı.');

      const { error } = await supabase
        .from('surveys')
        .insert([{
          title: title.trim(),
          description: description.trim(),
          survey_link: googleFormLink.trim(),
          completion_code: completionCode.trim(),
          target_gender: gender,
          target_age_group: ageGroup,
          target_city: targetCity,
          target_education: targetEducation,
          target_occupation: targetOccupation.trim(),
          creator_id: user.id,
          status: 'active',
          platform: 'Google Forms',
          reward_amount: 25,
          estimated_time: 5
        }]);

      if (error) throw error;

      Alert.alert('Başarılı', 'Anketiniz oluşturuldu!', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'city' | 'education') => {
    setModalType(type);
    setModalVisible(true);
  };

  const SelectionButton = ({ label, current, setter }: any) => (
    <TouchableOpacity
      style={[styles.chip, current === label && styles.chipActive]}
      onPress={() => setter(label)}
    >
      <Text style={[styles.chipText, current === label && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yeni Araştırma Başlat</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>Temel Bilgiler</Text>
            <Text style={styles.label}>Araştırma Başlığı</Text>
            <TextInput style={styles.input} placeholder="Başlık" value={title} onChangeText={setTitle} />

            <Text style={styles.label}>Kısa Açıklama</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Detaylar..." multiline value={description} onChangeText={setDescription} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>Hedef Kitle (Filtreler)</Text>

            <Text style={styles.label}>Cinsiyet</Text>
            <View style={styles.chipGroup}>
              {['Hepsi', 'Kadın', 'Erkek'].map((item) => (
                <SelectionButton key={item} label={item} current={gender} setter={setGender} />
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 15 }]}>Yaş Grubu</Text>
            <View style={styles.chipGroup}>
              {['Hepsi', '18-24', '25-34', '35+'].map((item) => (
                <SelectionButton key={item} label={item} current={ageGroup} setter={setAgeGroup} />
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 15 }]}>Şehir</Text>
            <TouchableOpacity style={styles.selector} onPress={() => openModal('city')}>
              <Text style={styles.selectorText}>{targetCity}</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 15 }]}>Eğitim Seviyesi</Text>
            <TouchableOpacity style={styles.selector} onPress={() => openModal('education')}>
              <Text style={styles.selectorText}>{targetEducation}</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 15 }]}>Meslek (Filtrelemek için yazın)</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Mühendis (Herkes için boş bırakın)"
              value={targetOccupation}
              onChangeText={setTargetOccupation}
            />
          </View>

          <View style={styles.card}>
           <Text style={styles.cardHeader}>Anket Bağlantısı</Text>
            <Text style={styles.label}>Google Form Linki *</Text>
            <View style={styles.linkRow}>
              <TextInput 
                style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                placeholder="https://forms.gle/..." 
                value={googleFormLink}
                onChangeText={setGoogleFormLink}
              />
              <TouchableOpacity style={styles.pasteBtn} onPress={fetchCopiedText}>
                <Text style={styles.pasteBtnText}>📋 Yapıştır</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Onay Kodu</Text>
            <TextInput style={styles.input} placeholder="KAHVE2026" value={completionCode} onChangeText={setCompletionCode} autoCapitalize="characters" />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>ANKETİ YAYINLA</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Seçim Modalı */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalType === 'city' ? 'Şehir Seç' : 'Eğitim Seç'}</Text>
            <FlatList
              data={modalType === 'city' ? CITIES : EDUCATION_LEVELS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    modalType === 'city' ? setTargetCity(item) : setTargetEducation(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  scrollContent: { padding: 15 },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHeader: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 5 },
  label: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 },
  input: { backgroundColor: '#F8F9FB', borderWidth: 1, borderColor: '#EAECEF', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 15 },
  textArea: { height: 80, textAlignVertical: 'top' },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { backgroundColor: '#E9ECEF', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, marginRight: 10, marginBottom: 10 },
  chipActive: { backgroundColor: '#EC7928' },
  chipText: { color: '#666', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  selector: { backgroundColor: '#F8F9FB', borderWidth: 1, borderColor: '#EAECEF', borderRadius: 10, padding: 12, marginBottom: 15 },
  selectorText: { fontSize: 15, color: '#333' },
  submitBtn: { backgroundColor: '#EC7928', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 30 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '70%', padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalItemText: { fontSize: 16, color: '#333', textAlign: 'center' },
  closeBtn: { marginTop: 10, padding: 15, alignItems: 'center' },
  closeBtnText: { color: '#EC7928', fontWeight: 'bold' },
  linkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  pasteBtn: { backgroundColor: '#EC7928', padding: 14, borderRadius: 10, marginLeft: 5 },
  pasteBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});

export default CreateSurvey;