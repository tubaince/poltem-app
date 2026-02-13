import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ForgotPassword from './pages/Auth/ForgotPassword';


import Welcome from './pages/Welcome/Welcome';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import Home from './pages/Home/Home';
import PhoneLogin from './pages/Auth/PhoneLogin';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false, 
        }}
      >
        {/* Karşılama Ekranı */}
        <Stack.Screen name="Welcome" component={Welcome} />

        {/* Kayıt Ol Ekranı */}
        <Stack.Screen name="Register" component={Register} />

        {/* Giriş Yap Ekranı */}
        <Stack.Screen name="Login" component={Login} />

        {/* Ana Sayfa - Kayıt veya Giriş başarılı olunca buraya yönlenir */}
        <Stack.Screen name="Home" component={Home} />

        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

        <Stack.Screen name="PhoneLogin" component={PhoneLogin} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;