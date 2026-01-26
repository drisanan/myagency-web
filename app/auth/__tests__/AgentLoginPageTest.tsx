import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface AgentLoginPageTestProps {
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const AgentLoginPageTest: React.FC<AgentLoginPageTestProps> = ({ style, children }) => {
  return (
    <View style={[styles.container, style]}>
      {children || <Text>AgentLoginPageTest</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Add your styles here
  },
});

export default AgentLoginPageTest;
