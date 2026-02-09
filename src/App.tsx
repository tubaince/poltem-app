import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Sayfaları İçeri Aktarıyoruz
import Welcome from './pages/Welcome/Welcome';
import Register from './pages/Auth/Register'; 
// Not: Login, Verify ve Surveys sayfalarını oluşturduğunda aşağıya ekleyeceğiz.

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false, // Sayfaların üstündeki varsayılan başlığı kapatır
        }}
      >
        {/* Karşılama Ekranı */}
        <Stack.Screen name="Welcome" component={Welcome} />
        
        {/* Kayıt Ol Ekranı */}
        <Stack.Screen name="Register" component={Register} />

        {/* Diğer sayfaları oluşturduğunda buraya şu şekilde ekleyebilirsin:
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Verify" component={Verify} />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;