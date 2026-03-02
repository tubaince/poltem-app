import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  StatusBar
} from 'react-native';

const Completed = ({ navigation }: any) => {
  return (
    <ImageBackground 
      source={require('../../assets/backgraund.jpeg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.overlay}>
        <View style={styles.container}>
          
          {/* Görseldeki Onay İkonu Tasarımı */}
          <View style={styles.iconCircle}>
            <View style={styles.innerCircle}>
               <Text style={styles.checkMark}>✓</Text>
            </View>
          </View>

          {/* Bilgi Metni */}
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>
              Anketi tamamladığınız için teşekkürler!
            </Text>
          </View>

          {/* Alt Buton */}
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Ana sayfaya dön</Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)', // Resmin üzerine hafif bir katman
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  innerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  checkMark: {
    fontSize: 60,
    color: '#E67E22', // Görseldeki turuncu/altın tonu
    fontWeight: 'bold',
  },
  textContainer: {
    marginBottom: 60,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 38,
  },
  button: {
    backgroundColor: '#FFF',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 35,
    position: 'absolute',
    bottom: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Completed;