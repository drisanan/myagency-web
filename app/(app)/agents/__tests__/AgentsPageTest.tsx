import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface AgentsPageTestProps {
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const AgentsPageTest: React.FC<AgentsPageTestProps> = ({ style, children }) => {
  return (
    <View style={[styles.container, style]}>
      {children || <Text>AgentsPageTest</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Add your styles here
  },
});

export default AgentsPageTest;
