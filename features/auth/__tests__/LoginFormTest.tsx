import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface LoginFormTestProps {
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const LoginFormTest: React.FC<LoginFormTestProps> = ({ style, children }) => {
  return (
    <View style={[styles.container, style]}>
      {children || <Text>LoginFormTest</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Add your styles here
  },
});

export default LoginFormTest;
