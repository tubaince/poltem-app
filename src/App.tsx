import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Sayfalarınızı içe aktarın 
import Welcome from './pages/Welcome/Welcome';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import Home from './pages/Home/Home';
import ForgotPassword from './pages/Auth/ForgotPassword';
import PhoneLogin from './pages/Auth/PhoneLogin';
import CreateSurvey from './pages/Surveys/CreateSurvey';


import VerifyOTP from './pages/Auth/VerifyOTP';
import Profile from './pages/Auth/Profile';
import ResetPassword from './pages/Auth/ResetPassword';

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
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="PhoneLogin" component={PhoneLogin} />
        <Stack.Screen name="Profile" component={Profile} />

        {/* --- YENİ EKLENEN ANKET OLUŞTURMA SAYFASI --- */}
        <Stack.Screen name="CreateSurvey" component={CreateSurvey} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTP} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;