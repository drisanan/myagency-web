import React from 'react';

interface LoginFormTestProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const LoginFormTest: React.FC<LoginFormTestProps> = ({ style, children }) => {
  return (
    <div style={{ ...styles.container, ...style }}>
      {children || <span>LoginFormTest</span>}
    </div>
  );
};

const styles: { container: React.CSSProperties } = {
  container: {
    // Add your styles here
  },
};

export default LoginFormTest;
