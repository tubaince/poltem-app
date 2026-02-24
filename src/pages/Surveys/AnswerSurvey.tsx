import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  Linking,
  TextInput,
  ActivityIndicator
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { supabase } from '../../lib/supabase';

const AnswerSurvey = ({ route, navigation }: any) => {
  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [issubmitting, setIsSubmitting] = useState(false);
  
  const [uniqueId] = useState(`AC-${Math.floor(100000 + Math.random() * 900000)}`);

  const survey = route.params?.survey || { 
    id: '', 
    title: 'Anket Yüklenemedi', 
    description: 'Lütfen geri dönüp tekrar deneyin.', 
    survey_link: '', 
    completion_code: '' 
  };

  const copyToClipboard = () => {
    if (step < 2) {
      Alert.alert('Uyarı', 'Lütfen önce katılım beyanını onaylayın.');
      return;
    }
    
    try {
      Clipboard.setString(uniqueId);
      Alert.alert('Başarılı', `ID Kopyalandı: ${uniqueId}\n\nLütfen Google Form'un ilk sorusuna bu kodu yapıştırın.`);
    } catch (error) {
      Alert.alert('Hata', 'Kopyalama işlemi başarısız oldu.');
      console.error(error);
    }
  };

  const handleStartSurvey = () => {
    if (!survey.survey_link) {
      Alert.alert('Hata', 'Anket linki bulunamadı.');
      return;
    }
    setStep(3); 
    Linking.openURL(survey.survey_link);
  };


  const handleVerify = async () => {
    const correctCode = survey.completion_code ? survey.completion_code.toString().trim().toUpperCase() : '';
    const enteredCode = inputCode.trim().toUpperCase();

    if (enteredCode === correctCode) {
      setIsSubmitting(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error("Kullanıcı oturumu bulunamadı.");

        // survey_responses yerine güncel submissions tablosuna kayıt ekliyoruz
        const { error } = await supabase
          .from('submissions') 
          .insert([
            { 
              survey_id: survey.id, 
              user_id: user.id, 
              unique_id: uniqueId,
              status: 'pending', // SQL'de oluşturduğumuz ENUM tipine uygun
              created_at: new Date() 
            }
          ]);

        if (error) throw error;

        Alert.alert('Tebrikler!', 'Anket başarıyla tamamlandı. Kaydınız incelemeye alındı.', [
          { text: 'Tamam', onPress: () => navigation.navigate('Home') }
        ]);
      } catch (error: any) {
        console.error(error);
        Alert.alert('Hata', 'Kayıt oluşturulurken bir sorun oluştu: ' + error.message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      Alert.alert('Hata', 'Girdiğiniz tamamlama kodu hatalı. Lütfen kontrol edip tekrar deneyin.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Araştırma Detayı</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <Text style={styles.title}>{survey.title}</Text>
          <Text style={styles.description}>{survey.description}</Text>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>{survey.reward_amount || '25'} TL Kazanacaksınız</Text>
          </View>
        </View>

        {/* 1. ADIM */}
        <View style={styles.stepCard}>
          <View style={styles.stepRow}>
            <Text style={styles.stepIcon}>🛡️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>1. Araştırmaya Katıl</Text>
              {step > 1 ? (
                <Text style={styles.completedText}>✅ Beyan Onaylandı</Text>
              ) : (
                <Text style={styles.pendingText}>Onaylamanız gerekmektedir.</Text>
              )}
            </View>
          </View>
          {step === 1 && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.actionBtnText}>Beyanı Oku ve Onayla</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 2. ADIM */}
        <View style={[styles.stepCard, step < 2 && styles.disabledCard]}>
          <View style={styles.stepRow}>
            <Text style={styles.stepIcon}>📋</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>2. Unique ID'nizi Kopyalayın</Text>
              <Text style={styles.subLabel}>Formun başına bu ID'yi yapıştırmalısınız.</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.idContainer} 
            onPress={copyToClipboard}
            activeOpacity={0.7}
            disabled={step < 2}
          >
            <Text style={styles.idText}>{uniqueId}</Text>
            <View style={styles.copyBadge}>
                <Text style={styles.copyBadgeText}>KOPYALA</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 3. ADIM */}
        <View style={[styles.stepCard, step < 2 && styles.disabledCard]}>
          <View style={styles.stepRow}>
            <Text style={styles.stepIcon}>🚀</Text>
            <Text style={styles.stepTitle}>3. Araştırmaya Başla</Text>
          </View>
          {step === 3 ? (
             <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>🌙 Anket dolduruluyor... Formu bitirip dönün.</Text>
             </View>
          ) : (
            <TouchableOpacity 
              style={[styles.startBtn, step < 2 && styles.disabledBtn]} 
              onPress={handleStartSurvey}
              disabled={step < 2}
            >
              <Text style={styles.startBtnText}>Anketi Başlat (Google Forms)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 4. ADIM */}
        <View style={[styles.stepCard, step < 3 && styles.disabledCard]}>
          <View style={styles.stepRow}>
            <Text style={styles.stepIcon}>🔑</Text>
            <Text style={styles.stepTitle}>4. Araştırmayı Tamamla</Text>
          </View>
          <TextInput 
            style={styles.codeInput}
            placeholder="Tamamlama Kodunu Girin"
            value={inputCode}
            onChangeText={setInputCode}
            autoCapitalize="characters"
            editable={step >= 3 && !issubmitting}
          />
          <TouchableOpacity 
            style={[styles.finishBtn, (step < 3 || !inputCode || issubmitting) && styles.disabledBtn]} 
            onPress={handleVerify}
            disabled={step < 3 || !inputCode || issubmitting}
          >
            {issubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.finishBtnText}>Doğrula ve Bitir</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Gönüllü Katılım Beyanı</Text>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>
                Bu araştırma çalışmasına katılmayı kabul eden kişinin onay beyanıdır. {"\n\n"}
                • Araştırmanın amacını anladım.{"\n"}
                • Katılmam tamamen gönüllüdür.{"\n"}
                • Bilgilerimin gizli tutulacağını kabul ediyorum.
              </Text>
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalConfirmBtn} 
              onPress={() => { setStep(2); setShowModal(false); }}
            >
              <Text style={styles.modalConfirmText}>ARAŞTIRMAYA KATIL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  backButton: { padding: 5 },
  backArrow: { fontSize: 24, color: '#333' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  scrollContent: { padding: 15 },
  infoSection: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2C3E50' },
  description: { fontSize: 14, color: '#7F8C8D', marginTop: 5 },
  rewardBadge: { backgroundColor: '#E8F8F5', alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginTop: 10 },
  rewardText: { color: '#27AE60', fontWeight: 'bold', fontSize: 13 },
  stepCard: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 3 },
  disabledCard: { opacity: 0.5 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepIcon: { fontSize: 24, marginRight: 15 },
  stepTitle: { fontSize: 16, fontWeight: 'bold', color: '#34495E' },
  pendingText: { color: '#E74C3C', fontSize: 12, marginTop: 2 },
  completedText: { color: '#27AE60', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  subLabel: { fontSize: 12, color: '#95A5A6', marginTop: 2 },
  actionBtn: { backgroundColor: '#EC7928', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  actionBtnText: { color: '#fff', fontWeight: 'bold' },
  idContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#F0F7FF', 
    padding: 15, 
    borderRadius: 10, 
    borderStyle: 'dashed', 
    borderWidth: 1, 
    borderColor: '#EC7928', 
    marginTop: 15 
  },
  idText: { color: '#EC7928', fontWeight: 'bold', fontSize: 20, letterSpacing: 1 },
  copyBadge: { backgroundColor: '#EC7928', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  copyBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  startBtn: { backgroundColor: '#F39C12', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  disabledBtn: { backgroundColor: '#BDC3C7' },
  startBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  waitingContainer: { backgroundColor: '#FFF5E6', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  waitingText: { color: '#D35400', fontWeight: 'bold', fontSize: 14 },
  codeInput: { borderWidth: 1, borderColor: '#DDD', backgroundColor: '#F9F9F9', padding: 15, borderRadius: 10, marginTop: 15, textAlign: 'center', fontSize: 20, fontWeight: 'bold' },
  finishBtn: { backgroundColor: '#2ECC71', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  finishBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 25 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalBody: { maxHeight: 300, marginBottom: 20 },
  modalText: { fontSize: 15, color: '#444', lineHeight: 24 },
  modalConfirmBtn: { backgroundColor: '#EC7928', padding: 16, borderRadius: 12, alignItems: 'center' },
  modalConfirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default AnswerSurvey;