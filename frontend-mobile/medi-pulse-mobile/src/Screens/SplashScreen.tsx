import React from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';

const SplashScreen = ({ navigation }: any) => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      // Simulate a delay for splash screen
      const timer = setTimeout(() => {
        navigation.replace('AuthLoading');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isFocused, navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.appName}>MediPulse AI</Text>
      <ActivityIndicator size="large" color="#0066cc" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
  },
});

export default SplashScreen;