'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import React from 'react';

type MetricCardProps = {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  bgColor?: string;
  textColor?: string;
  bgImage?: string;
  overlayOpacity?: number;
};

function toRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function MetricCard({
  title,
  value,
  icon,
  footer,
  bgColor,
  textColor,
  bgImage,
  overlayOpacity = 0.82,
}: MetricCardProps) {
  const blendedBackground = bgImage
    ? `linear-gradient(${toRgba(bgColor || '#000000', overlayOpacity)}, ${toRgba(
        bgColor || '#000000',
        overlayOpacity,
      )}), url(${bgImage})`
    : undefined;

  return (
    <Card
      sx={{
        borderRadius: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: `1px solid ${bgColor || '#dcdfe4'}`,
        backgroundColor: bgColor,
        backgroundImage: blendedBackground,
        backgroundSize: blendedBackground ? 'cover' : undefined,
        backgroundPosition: blendedBackground ? 'center' : undefined,
        backgroundRepeat: blendedBackground ? 'no-repeat' : undefined,
        color: textColor,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            px: 2,
            pt: 1,
            pb: 0.6,
            borderBottom: footer ? '1px solid #dcdfe4' : 'none',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: icon ? 'auto 1fr' : '1fr',
              gridTemplateRows: 'auto auto',
              columnGap: icon ? 1.5 : 0,
              rowGap: 0.75,
              alignItems: 'start',
            }}
          >
            {icon ? (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: textColor ? `${textColor}1a` : '#FFFFFF',
                  color: textColor || '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                  gridRow: '1 / span 2',
                }}
              >
                {icon}
              </Box>
            ) : null}
            <Typography
              variant="subtitle2"
              color={textColor ? undefined : 'text.secondary'}
              sx={{ fontSize: '0.95rem', color: textColor }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{ fontSize: '2.1rem', lineHeight: 1.05, color: textColor }}
            >
              {value}
            </Typography>
          </Box>
        </Box>
        {footer ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 1,
              px: 2,
              pb: 0.35,
              color: '#667085',
            }}
          >
            {footer}
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
}

