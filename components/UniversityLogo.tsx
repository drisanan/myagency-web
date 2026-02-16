'use client';

import React from 'react';
import { Box } from '@mui/material';
import { IoSchoolOutline } from 'react-icons/io5';

/**
 * University logo with lazy loading, error fallback, and placeholder.
 *
 * @param src   - Image URL (optional).
 * @param alt   - Accessible alt text.
 * @param size  - Height constraint in px (default 40).
 */
export function UniversityLogo({
  src,
  alt,
  size = 40,
}: {
  src?: string;
  alt: string;
  size?: number;
}) {
  const [failed, setFailed] = React.useState(false);

  if (!src || failed) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: size,
          width: '100%',
          bgcolor: '#E0E0E0',
          borderRadius: 1,
        }}
      >
        <IoSchoolOutline size={Math.round(size * 0.6)} color="#0A0A0A60" />
      </Box>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ maxHeight: size, maxWidth: '100%', objectFit: 'contain' }}
    />
  );
}
