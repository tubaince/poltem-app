import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Sayfaları İçeri Aktarıyoruz
import Welcome from './pages/Welcome/Welcome';
import Register from './pages/Auth/Register'; 
import Login from './pages/Auth/Login';   // Yeni ekledik
import Verify from './pages/Auth/Verify'; // Yeni ekledik

// Not: Home/Surveys sayfanın yolunu kendine göre ayarla
// import Home from './pages/Home/Home'; 

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false, // Üst barı gizler, temiz bir görünüm sağlar
        }}
      >
        {/* Karşılama Ekranı */}
        <Stack.Screen name="Welcome" component={Welcome} />
        
        {/* Kayıt Ol Ekranı */}
        <Stack.Screen name="Register" component={Register} />

        {/* Giriş Yap Ekranı */}
        <Stack.Screen name="Login" component={Login} />

        {/* Doğrulama (OTP) Ekranı */}
        <Stack.Screen name="Verify" component={Verify} />

        {/* Giriş başarılı olduktan sonra gidilecek sayfa. 
           Eğer Home isminde bir sayfan yoksa şimdilik yorumda kalsın 
           veya mevcut bir sayfanı buraya bağla.
        */}
        {/* <Stack.Screen name="Home" component={Home} /> */}

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;