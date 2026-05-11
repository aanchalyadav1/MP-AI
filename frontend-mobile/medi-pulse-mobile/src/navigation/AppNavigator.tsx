import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MedicineListScreen } from '../screens/medicine/MedicineListScreen';
import { AddMedicineScreen } from '../screens/medicine/AddMedicineScreen';
import { PrescriptionScreen } from '../screens/prescription/PrescriptionScreen';
import { AdherenceScreen } from '../screens/adherence/AdherenceScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { EmergencySOSScreen } from '../screens/EmergencySOSScreen';
import { AuthLoadingScreen } from '../screens/auth/AuthLoadingScreen';

export type RootStackParamList = {
  Splash: undefined;
  AuthLoading: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  MedicineList: undefined;
  AddMedicine: undefined;
  Prescription: undefined;
  Adherence: undefined;
  Profile: undefined;
  Settings: undefined;
  EmergencySOS: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="MedicineList" component={MedicineListScreen} />
      <Stack.Screen name="AddMedicine" component={AddMedicineScreen} />
      <Stack.Screen name="Prescription" component={PrescriptionScreen} />
      <Stack.Screen name="Adherence" component={AdherenceScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EmergencySOS" component={EmergencySOSScreen} />
    </Stack.Navigator>
  );
};