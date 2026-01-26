import React from 'react';

interface AgentsPageTestProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const AgentsPageTest: React.FC<AgentsPageTestProps> = ({ style, children }) => {
  return (
    <div style={{ ...styles.container, ...style }}>
      {children || <span>AgentsPageTest</span>}
    </div>
  );
};

const styles: { container: React.CSSProperties } = {
  container: {
    // Add your styles here
  },
};

export default AgentsPageTest;
