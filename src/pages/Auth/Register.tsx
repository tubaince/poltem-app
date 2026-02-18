import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { supabase } from '../../lib/supabase';


const InfoModal = ({ visible, title, content, onClose }: any) => (
  <Modal visible={visible} animationType="fade" transparent={true}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        <ScrollView style={styles.modalBody}>
          <Text style={styles.modalText}>{content}</Text>
        </ScrollView>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
          <Text style={styles.modalCloseText}>Kapat</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const AgreementRow = ({ title, value, onValueChange, onPressTitle }: any) => (
  <View style={styles.agreementCard}>
    <TouchableOpacity style={{ flex: 1 }} onPress={onPressTitle}>
      <Text style={styles.agreementTitle}>{title}</Text>
      <Text style={styles.agreementLink}>Detayları okumak için dokunun</Text>
    </TouchableOpacity>
    <Switch
      trackColor={{ false: "#D1D1D1", true: "#007AFF" }}
      thumbColor={"#fff"}
      ios_backgroundColor="#D1D1D1"
      onValueChange={onValueChange}
      value={value}
    />
  </View>
);

const Register = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kvkkApprove, setKvkkApprove] = useState(false);
  const [userTermsApprove, setUserTermsApprove] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ title: '', content: '' });


  // En az 8 Karakter, 1 Büyük, 1 Küçük, 1 Rakam ve Özel Karakterleri destekler
  const isPasswordValid = (pass: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
    // Eğer özel karakter zorunlu olmasın derseler aşadaki
    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; 
    return passwordRegex.test(pass);
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (!isPasswordValid(password)) {
      Alert.alert(
        'Zayıf Şifre',
        'Şifreniz en az 8 karakter olmalı; bir büyük harf, bir küçük harf, bir rakam ve en az bir özel karakter (. , ! ? * vb.) içermelidir.'
      );
      return;
    }

    if (!kvkkApprove || !userTermsApprove) {
      Alert.alert('Onay Gerekli', 'Sözleşmeleri onaylamanız gerekmektedir.');
      return;
    }

    setLoading(true);
    try {
      const finalEmail = email.includes('@') ? email.trim() : `${email.trim()}@poltemakademi.com`;
      const { data, error } = await supabase.auth.signUp({
        email: finalEmail,
        password: password,
        options: { data: { full_name: fullName } }
      });

      if (error) throw error;
      if (data) {
        Alert.alert('Başarılı', 'Hesabınız oluşturuldu.');
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }
    } catch (err: any) {
      Alert.alert('Kayıt Hatası', err.message);
    } finally {
      setLoading(false);
    }
  };

  const showContract = (type: 'kvkk' | 'terms') => {
    if (type === 'kvkk') {
      setModalData({
        title: 'KVKK Aydınlatma Metni',
        content: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında verileriniz işlenmektedir...'
      });
    } else {
      setModalData({
        title: 'Kullanıcı Sözleşmesi',
        content: 'PolTem Akademi kullanım şartları ve yasal sorumluluklar...'
      });
    }
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Yeni Hesap Oluştur</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.cardItem}>
              <Text style={styles.label}>Ad Soyad</Text>
              <TextInput style={styles.input} placeholder="Ad Soyad" value={fullName} onChangeText={setFullName} />
            </View>
            <View style={[styles.cardItem, styles.borderTop]}>
              <Text style={styles.label}>E-posta</Text>
              <TextInput style={styles.input} placeholder="eposta" value={email} onChangeText={setEmail} autoCapitalize="none" />
            </View>
            <View style={[styles.cardItem, styles.borderTop]}>
              <Text style={styles.label}>Şifre</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Text>{showPassword ? '👁️' : '🔒'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.agreementSection}>
            <AgreementRow title="KVKK Onayı" value={kvkkApprove} onValueChange={setKvkkApprove} onPressTitle={() => showContract('kvkk')} />
            <AgreementRow title="Kullanıcı Koşulları" value={userTermsApprove} onValueChange={setUserTermsApprove} onPressTitle={() => showContract('terms')} />
          </View>

          <TouchableOpacity
            style={[styles.registerBtn, (!kvkkApprove || !userTermsApprove) && styles.disabledBtn]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerBtnText}>KAYIT OL</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.footerText}>
              Zaten hesabınız var mı? <Text style={styles.footerLinkText}>Giriş Yap</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <InfoModal visible={modalVisible} title={modalData.title} content={modalData.content} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  footerLink: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLinkText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 25 },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 140, height: 60 },
  title: { fontSize: 22, fontWeight: '600', marginTop: 10 },
  inputGroup: { backgroundColor: '#F8F9FB', borderRadius: 12, borderWidth: 1, borderColor: '#EAECEF' },
  cardItem: { padding: 12 },
  borderTop: { borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  label: { fontSize: 12, color: '#666' },
  input: { fontSize: 15, height: 40 },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { padding: 5 },
  agreementSection: { marginTop: 15 },
  agreementCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FB', padding: 12, borderRadius: 12, marginBottom: 10 },
  agreementTitle: { fontWeight: '600' },
  agreementLink: { fontSize: 11, color: '#007AFF' },
  registerBtn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  disabledBtn: { backgroundColor: '#ccc' },
  registerBtnText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalBody: { marginBottom: 15 },
  modalText: { lineHeight: 20 },
  modalCloseBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 10, alignItems: 'center' },
  modalCloseText: { color: '#fff', fontWeight: 'bold' }
});

export default Register;