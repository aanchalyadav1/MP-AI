import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const AuthLoadingScreen = () => {
  const { loading, user } = useAuth();
  const navigation = useNavigation();

  // This screen is used to check if the user is already logged in
  // In a real app, you would check the token and user data here
  // For now, we just wait for the auth context to load

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  // If we have a user, go to home, else go to login
  if (user) {
    // Delay a bit to let the splash screen finish (if any)
    setTimeout(() => {
      navigation.replace('Home');
    }, 500);
    return null; // Prevent rendering while navigating
  } else {
    setTimeout(() => {
      navigation.replace('Login');
    }, 500);
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default AuthLoadingScreen;