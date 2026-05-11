import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeContext as PaperThemeContext } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { LightTheme, DarkTheme } from '@react-navigation/native';
import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

// Configure fonts for Paper
configureFonts({
  default: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '200',
    },
  },
});

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const reactNavigationTheme = isDarkMode ? DarkTheme : LightTheme;
  const paperTheme = isDarkMode ? MD3DarkTheme : MD3LightTheme;

  const theme = {
    ...reactNavigationTheme,
    ...paperTheme,
    colors: {
      ...reactNavigationTheme.colors,
      ...paperTheme.colors,
    },
  };

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PaperProvider theme={theme} as={PaperThemeContext.Provider}>
          <NavigationContainer theme={theme}>
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;