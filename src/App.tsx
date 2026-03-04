import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';

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
import AnswerSurvey from './pages/Surveys/AnswerSurvey';
import ParticipatedSurveys from './pages/Surveys/ParticipatedSurveys';
import Payments from './pages/Pay/Payments';
import Completed from './pages/Surveys/Completed';

const Stack = createStackNavigator();

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(data.session ?? null);
      setIsBootstrapping(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsBootstrapping(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isBootstrapping) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#EC7928" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="CreateSurvey" component={CreateSurvey} />
            <Stack.Screen name="AnswerSurvey" component={AnswerSurvey} />
            <Stack.Screen name="ParticipatedSurveys" component={ParticipatedSurveys} />
            <Stack.Screen name="Payments" component={Payments} />
            <Stack.Screen name="Completed" component={Completed} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="PhoneLogin" component={PhoneLogin} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTP} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default App;
