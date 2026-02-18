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
  ActivityIndicator
} from 'react-native';
import { supabase } from '../../lib/supabase'; // Yolunu kontrol etmeyi unutma

const CreateSurvey = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [googleFormLink, setGoogleFormLink] = useState('');
  const [completionCode, setCompletionCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Hedef Kitle Seçimleri
  const [gender, setGender] = useState('Hepsi'); // Hepsi, Kadın, Erkek
  const [ageGroup, setAgeGroup] = useState('Hepsi'); // Hepsi, 18-24, 25-34, 35+

  const handleSubmit = async () => {
    // Basit doğrulama
    if (!title.trim() || !googleFormLink.trim() || !completionCode.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen anket başlığı, linki ve tamamlama kodunu doldurun.');
      return;
    }

    setLoading(true);

    try {
      // Mevcut giriş yapmış kullanıcı bilgisini alalım
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.');
      }

      // Veritabanına kayıt işlemi
      const { error } = await supabase
        .from('surveys')
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
            survey_link: googleFormLink.trim(),
            completion_code: completionCode.trim(),
            target_gender: gender,
            target_age_group: ageGroup,
            creator_id: user.id,
            status: 'active', // Varsayılan olarak aktif başlasın
            platform: 'Google Forms'
          }
        ]);

      if (error) throw error;

      Alert.alert('Başarılı', 'Anketiniz oluşturuldu ve yayına alındı.', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);

    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Anket oluşturulurken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
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
          
          {/* 1. Kısım: Temel Bilgiler */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Temel Bilgiler</Text>
            
            <Text style={styles.label}>Araştırma Başlığı</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Örn: Parti yorumu" 
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Kısa Açıklama</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="Araştırma hakkında detaylı bilgi..." 
              multiline 
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* 2. Kısım: Hedef Kitle */}
          <View style={styles.card}>
            <Text style={styles.label}>Hedef Cinsiyet</Text>
            <View style={styles.chipGroup}>
              {['Hepsi', 'Kadın', 'Erkek'].map((item) => (
                <SelectionButton key={item} label={item} current={gender} setter={setGender} />
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 15 }]}>Hedef Yaş Grubu</Text>
            <View style={styles.chipGroup}>
              {['Hepsi', '18-24', '25-34', '35+'].map((item) => (
                <SelectionButton key={item} label={item} current={ageGroup} setter={setAgeGroup} />
              ))}
            </View>
          </View>

          {/* 3. Kısım: Anket Bağlantısı */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Anket Bağlantısı</Text>
            
           <Text style={styles.label}>Google Form Linki</Text>
            <View style={styles.linkRow}>
              <TextInput 
                style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                placeholder="https://forms.gle/..." 
                value={googleFormLink}
                onChangeText={setGoogleFormLink}
              />
              <TouchableOpacity style={styles.pasteBtn}>
                <Text style={styles.pasteBtnText}>📋 Yapıştır</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { marginTop: 15 }]}>Tamamlama Kodu (Sabit)</Text>
            <Text style={styles.subLabel}>Anketin sonundaki onay sayfasına yazdığınız kodu buraya da girin.</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Örn: KAHVE2026" 
              value={completionCode}
              onChangeText={setCompletionCode}
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && { backgroundColor: '#ccc' }]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>ANKETİ OLUŞTUR</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  scrollContent: { padding: 15 },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#EAECEF' },
  cardHeader: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 5 },
  label: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 },
  subLabel: { fontSize: 11, color: '#999', marginBottom: 8 },
  input: { backgroundColor: '#F8F9FB', borderWidth: 1, borderColor: '#EAECEF', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 15 },
  textArea: { height: 100, textAlignVertical: 'top' },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { backgroundColor: '#E9ECEF', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, marginRight: 10, marginBottom: 10 },
  chipActive: { backgroundColor: '#3498DB' },
  chipText: { color: '#666', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  linkRow: { flexDirection: 'row', alignItems: 'center' },
  pasteBtn: { backgroundColor: '#3498DB', padding: 12, borderRadius: 10, marginLeft: 10 },
  pasteBtnText: { color: '#fff', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 30 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default CreateSurvey;