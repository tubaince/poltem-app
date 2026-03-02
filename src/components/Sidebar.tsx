import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  StyleSheet,
  Pressable 
} from 'react-native';

const { width } = Dimensions.get('window');

interface SidebarProps {
  isMenuOpen: boolean;
  slideAnim: Animated.Value;
  toggleMenu: () => void;
  navigation: any;
  handleSignOut: () => void;
}

const Sidebar = ({ isMenuOpen, slideAnim, toggleMenu, navigation, handleSignOut }: SidebarProps) => {
  if (!isMenuOpen) return null;

  return (
    <>
      {/* Karartma Efekti (Overlay) */}
      <Pressable style={styles.overlay} onPress={toggleMenu} />
      
      {/* Menü İçeriği */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.topSection}>
          <View style={styles.logoSection}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.myCustomLogo}
              resizeMode="contain"
            />
          </View>
        </View>

        <ScrollView style={styles.menuList}>
          {[
            { title: "Yeni Araştırmalar", route: 'Home' },
            { title: "Katıldığım Araştırmalar", route: 'ParticipatedSurveys' },
            { title: "Ödemeler", route: 'Payments' },
            { title: "Bildirimler" },
            { title: "İstatistikler" },
            { title: "Profil", route: 'Profile' },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                if (item.route) navigation.navigate(item.route);
                toggleMenu();
              }}
            >
              <Text style={styles.menuItemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    zIndex: 10 
  },
  drawer: { 
    position: 'absolute', 
    left: 0, top: 0, bottom: 0, 
    width: width * 0.75, 
    backgroundColor: '#FFF', 
    zIndex: 20, 
    paddingTop: 40 
  },
  menuList: { flex: 1, paddingVertical: 10 },
  menuItem: { paddingVertical: 18, paddingHorizontal: 25 },
  menuItemText: { fontSize: 16, color: '#333' },
  signOutButton: { padding: 25, borderTopWidth: 1, borderTopColor: '#EEE' },
  signOutText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 16 },
  topSection: { marginTop: 10 },
  logoSection: { alignItems: 'center', marginBottom: 15 },
  myCustomLogo: { width: 140, height: 70 },
});

export default Sidebar;