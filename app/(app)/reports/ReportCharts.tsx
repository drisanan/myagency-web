'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { colors } from '@/theme/colors';

/* ---------- types ---------- */

export type DailyEmailPoint = {
  date: string; // e.g. "Jan 12"
  sends: number;
  opens: number;
};

export type DailyViewPoint = {
  date: string;
  views: number;
};

/* ---------- shared card wrapper ---------- */

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        borderRadius: 0,
        clipPath:
          'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
        bgcolor: colors.white,
        overflow: 'hidden',
        position: 'relative',
        transition: 'box-shadow 0.25s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '3px',
          background: `linear-gradient(180deg, ${colors.black} 0%, ${colors.black}40 100%)`,
          zIndex: 1,
        },
        '&:hover': {
          boxShadow: `0 4px 20px rgba(0,0,0,0.08), 0 0 16px ${colors.lime}06`,
        },
      }}
    >
      <Box sx={{ px: 3, pt: 2.5, pb: 0.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: '0.8rem',
            color: colors.black,
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ px: 1, pb: 2, height: 260 }}>{children}</Box>
    </Box>
  );
}

/* ---------- custom tooltip ---------- */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: colors.black,
        color: colors.white,
        px: 1.5,
        py: 1,
        borderRadius: 0,
        clipPath:
          'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
        fontSize: 12,
      }}
    >
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}>
        {label}
      </Typography>
      {payload.map((entry: any) => (
        <Typography
          key={entry.dataKey}
          variant="caption"
          sx={{ display: 'block', color: entry.color }}
        >
          {entry.name}: {entry.value}
        </Typography>
      ))}
    </Box>
  );
}

/* ---------- Email Activity Chart ---------- */

export function EmailActivityChart({ data }: { data: DailyEmailPoint[] }) {
  return (
    <ChartCard title="Email Activity (30 days)">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradSends" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.lime} stopOpacity={0.4} />
              <stop offset="100%" stopColor={colors.lime} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradOpens" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#0A0A0A99' }}
            axisLine={{ stroke: '#E0E0E0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#0A0A0A99' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
          />
          <Area
            type="monotone"
            dataKey="sends"
            name="Sends"
            stroke={colors.lime}
            fill="url(#gradSends)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="opens"
            name="Opens"
            stroke="#6366F1"
            fill="url(#gradOpens)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/* ---------- Profile Views Chart ---------- */

export function ProfileViewsChart({ data }: { data: DailyViewPoint[] }) {
  return (
    <ChartCard title="Profile Views (30 days)">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.lime} stopOpacity={0.4} />
              <stop offset="100%" stopColor={colors.lime} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#0A0A0A99' }}
            axisLine={{ stroke: '#E0E0E0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#0A0A0A99' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="views"
            name="Views"
            stroke={colors.lime}
            fill="url(#gradViews)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
