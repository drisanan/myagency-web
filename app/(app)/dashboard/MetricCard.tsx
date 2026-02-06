'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import React from 'react';
import { colors, gradients } from '@/theme/colors';

type MetricCardProps = {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  bgColor?: string;
  textColor?: string;
};

export function MetricCard({
  title,
  value,
  icon,
  footer,
  bgColor,
  textColor,
}: MetricCardProps) {
  const bg = bgColor || colors.black;
  const text = textColor || colors.white;
  const accent = textColor || colors.lime;

  return (
    <Card
      sx={{
        borderRadius: 0,
        // Nike angular clip-path — sliced corners
        clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
        boxShadow: 'none',
        background: bgColor ? bg : gradients.darkCard,
        color: text,
        overflow: 'hidden',
        position: 'relative',
        transition: 'box-shadow 0.3s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 24px ${colors.lime}10`,
          transform: 'translateY(-2px)',
        },
        // Lime accent bar on left (angled)
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '4px',
          background: `linear-gradient(180deg, ${colors.lime} 0%, ${colors.lime}60 100%)`,
        },
        // Subtle gradient glow in top-right corner
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '50%',
          height: '60%',
          background: `radial-gradient(ellipse, ${colors.lime}08 0%, transparent 70%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <CardContent sx={{ p: 0, position: 'relative', zIndex: 1 }}>
        <Box sx={{ px: 2.5, pt: 2, pb: footer ? 1.5 : 2 }}>
          {/* Title row with optional icon */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            {icon && (
              <Box sx={{ color: `${text}80`, display: 'flex', alignItems: 'center' }}>
                {icon}
              </Box>
            )}
            <Typography
              variant="h6"
              sx={{ color: `${text}80` }}
            >
              {title}
            </Typography>
          </Box>
          {/* Big scoreboard number */}
          <Typography
            variant="h3"
            sx={{ color: accent, lineHeight: 1 }}
          >
            {value}
          </Typography>
        </Box>
        {footer && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2.5,
              pb: 1.5,
              pt: 0.5,
              borderTop: `1px solid ${text}10`,
              color: `${text}60`,
            }}
          >
            {footer}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
