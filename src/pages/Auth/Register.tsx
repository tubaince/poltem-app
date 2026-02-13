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
  Platform
} from 'react-native';
import { supabase } from '../../lib/supabase';


const AgreementRow = ({ title, desc, value, onValueChange }: any) => (
  <View style={styles.agreementCard}>
    <View style={{ flex: 1 }}>
      <Text style={styles.agreementTitle}>{title}</Text>
      <Text style={styles.agreementDesc} numberOfLines={1}>{desc}</Text>
    </View>
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

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
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
        options: {
          data: {
            full_name: fullName,
          }
        }
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.centeredContent}>
            
            <View style={styles.header}>
             
              <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
              <Text style={styles.title}>Yeni Hesap Oluştur</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.cardItem}>
                <Text style={styles.label}>Ad Soyad</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Adınız Soyadınız" 
                  value={fullName} 
                  onChangeText={setFullName}
                />
              </View>

              <View style={[styles.cardItem, styles.borderTop]}>
                <Text style={styles.label}>Kullanıcı Adı veya E-posta</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="kullanıcı adı veya eposta" 
                  value={email} 
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
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
                    <Text style={styles.eyeText}>{showPassword ? '👁️' : '🔒'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.agreementSection}>
              <AgreementRow 
                title="KVKK Onay Sözleşmesi" 
                desc="Verilerimin işlenmesini kabul ediyorum." 
                value={kvkkApprove} 
                onValueChange={setKvkkApprove} 
              />
              <AgreementRow 
                title="Kullanıcı Koşulları" 
                desc="Şartları okudum ve kabul ediyorum." 
                value={userTermsApprove} 
                onValueChange={setUserTermsApprove} 
              />
            </View>

            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerBtnText}>KAYIT OL VE BAŞLA</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackBtn}>
              <Text style={styles.goBackText}>« Giriş Ekranına Dön</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 25, paddingVertical: 30 },
  centeredContent: { width: '100%', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 140, height: 60 },
  title: { fontSize: 22, fontWeight: '600', color: '#1A1A1A', marginTop: 10 },
  inputGroup: { backgroundColor: '#F8F9FB', borderRadius: 12, borderWidth: 1, borderColor: '#EAECEF', overflow: 'hidden' },
  cardItem: { paddingHorizontal: 16, paddingVertical: 8 },
  borderTop: { borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  label: { fontSize: 12, color: '#666', marginBottom: 2 },
  input: { fontSize: 15, color: '#333', height: 40 },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { padding: 6, backgroundColor: '#007AFF', borderRadius: 6 },
  eyeText: { fontSize: 12 },
  agreementSection: { marginTop: 15 },
  agreementCard: { backgroundColor: '#F8F9FB', padding: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#EAECEF' },
  agreementTitle: { fontSize: 13, fontWeight: '700' },
  agreementDesc: { fontSize: 11, color: '#888' },
  registerBtn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, marginTop: 15, alignItems: 'center' },
  registerBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  goBackBtn: { marginTop: 20, alignItems: 'center' },
  goBackText: { color: '#007AFF', fontSize: 14, fontWeight: '500' }
});

export default Register;