import React from 'react';

interface AgentLoginPageTestProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const AgentLoginPageTest: React.FC<AgentLoginPageTestProps> = ({ style, children }) => {
  return (
    <div style={{ ...styles.container, ...style }}>
      {children || <span>AgentLoginPageTest</span>}
    </div>
  );
};

const styles: { container: React.CSSProperties } = {
  container: {
    // Add your styles here
  },
};

export default AgentLoginPageTest;
