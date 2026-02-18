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
  TextInput
} from 'react-native';
// CLI için doğru kütüphane
import Clipboard from '@react-native-clipboard/clipboard'; 

const AnswerSurvey = ({ route, navigation }: any) => {
  // Hook'ları her zaman en üstte ve koşulsuz tanımlıyoruz
  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [inputCode, setInputCode] = useState('');
  
  // Sayfa her render olduğunda ID'nin değişmemesi için başlangıç değeri
  const [uniqueId] = useState(`AC-${Math.floor(100000 + Math.random() * 900000)}`);

  // Parametre kontrolü
  const survey = route.params?.survey || { 
    title: 'Anket Yüklenemedi', 
    description: 'Lütfen geri dönüp tekrar deneyin.', 
    survey_link: '', 
    completion_code: '' 
  };

  const copyToClipboard = () => {
    Clipboard.setString(uniqueId);
    Alert.alert('Başarılı', 'Unique ID kopyalandı! Formun başına yapıştırmayı unutmayın.');
  };

  const handleStartSurvey = () => {
    if (!survey.survey_link) {
      Alert.alert('Hata', 'Anket linki bulunamadı.');
      return;
    }
    setStep(3); // Adımı "Anket dolduruluyor" yap
    Linking.openURL(survey.survey_link);
  };

  const handleVerify = () => {
    if (inputCode.trim().toUpperCase() === survey.completion_code.toUpperCase()) {
      Alert.alert('Tebrikler!', 'Anket başarıyla tamamlandı.', [
        { text: 'Tamam', onPress: () => navigation.navigate('Home') }
      ]);
    } else {
      Alert.alert('Hata', 'Girdiğiniz tamamlama kodu hatalı. Lütfen kontrol edin.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Araştırma Detayı</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Anket Bilgileri */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{survey.title}</Text>
          <Text style={styles.description}>{survey.description}</Text>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>100 TL Kazanacaksınız</Text>
          </View>
        </View>

        {/* 1. ADIM: KATILIM BEYANI */}
        <View style={styles.stepCard}>
          <View style={styles.stepRow}>
            <Text style={styles.stepIcon}>🛡️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>1. Araştırmaya Katıl</Text>
              {step > 1 ? (
                <Text style={styles.completedText}>✅ Katılım Beyanı Onaylandı</Text>
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

        {/* 2. ADIM: UNIQUE ID */}
        <View style={[styles.stepCard, step < 2 && styles.disabledCard]}>
          <View style={styles.stepRow}>
            <Text style={styles.stepIcon}>📋</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>2. Unique ID'nizi Kopyalayın</Text>
              <Text style={styles.subLabel}>Formun başında bu ID'yi ilgili alana yapıştırın.</Text>
            </View>
          </View>
          <View style={styles.idContainer}>
            <Text style={styles.idText}>{uniqueId}</Text>
            <TouchableOpacity onPress={copyToClipboard} disabled={step < 2}>
              <Text style={styles.copyIcon}>📄</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. ADIM: BAŞLA */}
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

        {/* 4. ADIM: TAMAMLA */}
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
            editable={step >= 3}
          />
          <TouchableOpacity 
            style={[styles.finishBtn, (step < 3 || !inputCode) && styles.disabledBtn]} 
            onPress={handleVerify}
            disabled={step < 3 || !inputCode}
          >
            <Text style={styles.finishBtnText}>Doğrula ve Bitir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BEYANNAME MODALI */}
      <Modal visible={showModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Gönüllü Katılım Beyanı</Text>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>
                Bu araştırma çalışmasına katılmayı kabul eden kişinin onay beyanıdır. {"\n\n"}
                • Araştırmanın amacını, yöntemlerini ve sürecini anladım.{"\n"}
                • Katılmam tamamen gönüllüdür ve herhangi bir zorlama altında değilim.{"\n"}
                • Bilgilerimin gizli tutulacağını ve sadece araştırma amaçlı kullanılacağını kabul ediyorum.{"\n"}
                • İstediğim an araştırmadan çekilme hakkına sahibim.
              </Text>
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalConfirmBtn} 
              onPress={() => { setStep(2); setShowModal(false); }}
            >
              <Text style={styles.modalConfirmText}>ARAŞTIRMAYA KATIL</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)} style={{ marginTop: 15 }}>
              <Text style={styles.modalCloseText}>İPTAL</Text>
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
  stepCard: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  disabledCard: { opacity: 0.5 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepIcon: { fontSize: 24, marginRight: 15 },
  stepTitle: { fontSize: 16, fontWeight: 'bold', color: '#34495E' },
  pendingText: { color: '#E74C3C', fontSize: 12, marginTop: 2 },
  completedText: { color: '#27AE60', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  subLabel: { fontSize: 12, color: '#95A5A6', marginTop: 2 },
  actionBtn: { backgroundColor: '#3498DB', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  actionBtnText: { color: '#fff', fontWeight: 'bold' },
  idContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F0F7FF', padding: 15, borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#3498DB', marginTop: 15 },
  idText: { color: '#3498DB', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
  copyIcon: { fontSize: 20 },
  startBtn: { backgroundColor: '#F39C12', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  disabledBtn: { backgroundColor: '#BDC3C7' },
  startBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  waitingContainer: { backgroundColor: '#FFF5E6', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  waitingText: { color: '#D35400', fontWeight: 'bold', fontSize: 14 },
  codeInput: { borderWidth: 1, borderColor: '#DDD', backgroundColor: '#F9F9F9', padding: 15, borderRadius: 10, marginTop: 15, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#2C3E50' },
  finishBtn: { backgroundColor: '#2ECC71', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  finishBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 25 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, elevation: 10 },
  modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#1A1A1A' },
  modalBody: { maxHeight: 300, marginBottom: 20 },
  modalText: { fontSize: 15, color: '#444', lineHeight: 24 },
  modalConfirmBtn: { backgroundColor: '#2176FF', padding: 16, borderRadius: 12, alignItems: 'center' },
  modalConfirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalCloseText: { textAlign: 'center', color: '#95A5A6', fontWeight: 'bold', fontSize: 14 }
});

export default AnswerSurvey;