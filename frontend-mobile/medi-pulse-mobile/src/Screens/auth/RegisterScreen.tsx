import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as Yup from 'yup';
import { Formik } from 'formik';

const RegisterScreen = () => {
  const { register } = useAuth();
  const navigation = useNavigation();

  const validationSchema = Yup.object().shape({
    name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .required('Password is required'),
    phone: Yup.string()
      .matches(/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number')
      .optional(),
    dateOfBirth: Yup.string().optional(),
    gender: Yup.string()
      .oneOf(['male', 'female', 'other', 'prefer_not_to_say'], 'Please select a valid gender')
      .optional(),
    role: Yup.string()
      .oneOf(['patient', 'family_member', 'caregiver', 'doctor', 'admin'], 'Please select a valid role')
      .default('patient'),
  });

  const onSubmit = async (values: any) => {
    try {
      await register(values);
      navigation.replace('Home');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>MediPulse AI</Text>
        <Text style={styles.subtitle}>Medication Adherence Platform</Text>
        
        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            phone: '',
            dateOfBirth: '',
            gender: '',
            role: 'patient'
          }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View style={styles.formContainer}>
              <TextInput
                placeholder="Full Name"
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                style={[styles.input, errors.name && touched.name && styles.inputError]}
                autoCapitalize="words"
              />
              {errors.name && touched.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
              
              <TextInput
                placeholder="Email Address"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                style={[styles.input, errors.email && touched.email && styles.inputError]}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {errors.email && touched.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
              
              <TextInput
                placeholder="Password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                style={[styles.input, errors.password && touched.password && styles.inputError]}
                secureTextEntry
              />
              {errors.password && touched.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
              
              <TextInput
                placeholder="Phone Number (optional)"
                value={values.phone}
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                style={[styles.input, errors.phone && touched.phone && styles.inputError]}
                keyboardType="phone-pad"
              />
              {errors.phone && touched.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
              
              <TextInput
                placeholder="Date of Birth (YYYY-MM-DD, optional)"
                value={values.dateOfBirth}
                onChangeText={handleChange('dateOfBirth')}
                onBlur={handleBlur('dateOfBirth')}
                style={[styles.input, errors.dateOfBirth && touched.dateOfBirth && styles.inputError]}
              />
              {errors.dateOfBirth && touched.dateOfBirth && (
                <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
              )}
              
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Gender:</Text>
                <View style={styles.picker}>
                  {['male', 'female', 'other', 'prefer_not_to_say'].map((gender, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.pickerOption,
                        values.gender === gender ? styles.pickerOptionSelected : undefined
                      ]}
                      onPress={() => handleChange('gender')(gender)}
                    >
                      <Text style={{ color: values.gender === gender ? '#fff' : '#666' }}>
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {errors.gender && touched.gender && (
                <Text style={styles.errorText}>{errors.gender}</Text>
              )}
              
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Role:</Text>
                <View style={styles.picker}>
                  {['patient', 'family_member', 'caregiver', 'doctor', 'admin'].map((role, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.pickerOption,
                        values.role === role ? styles.pickerOptionSelected : undefined
                      ]}
                      onPress={() => handleChange('role')(role)}
                    >
                      <Text style={{ color: values.role === role ? '#fff' : '#666' }}>
                        {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {errors.role && touched.role && (
                <Text style={styles.errorText}>{errors.role}</Text>
              )}
              
              <Button
                title="Register"
                onPress={handleSubmit}
                disabled={isSubmitting}
                color="#0066cc"
              />
              
              <View style={styles.links}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  style={styles.linkText}
                >
                  <Text>Already have an account? Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    alignSelf: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0066cc',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginBottom: 10,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pickerOption: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  pickerOptionSelected: {
    backgroundColor: '#0066cc',
  },
  links: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#0066cc',
  },
});

export default RegisterScreen;