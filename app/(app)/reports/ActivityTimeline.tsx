'use client';

import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import { colors, gradients } from '@/theme/colors';
import type { Activity, ActivityType } from '@/services/activity';
import {
  IoPaperPlaneOutline,
  IoMailOpenOutline,
  IoLogInOutline,
  IoCheckmarkCircleOutline,
  IoEyeOutline,
  IoListOutline,
  IoCalendarOutline,
  IoDocumentOutline,
  IoPersonOutline,
  IoTimeOutline,
} from 'react-icons/io5';

/* ---------- icon + color mapping ---------- */

const activityMeta: Record<
  ActivityType,
  { icon: React.ReactNode; color: string; label: string }
> = {
  email_sent: {
    icon: <IoPaperPlaneOutline size={16} />,
    color: colors.lime,
    label: 'Email',
  },
  email_opened: {
    icon: <IoMailOpenOutline size={16} />,
    color: '#6366F1',
    label: 'Open',
  },
  login: {
    icon: <IoLogInOutline size={16} />,
    color: '#10B981',
    label: 'Login',
  },
  task_completed: {
    icon: <IoCheckmarkCircleOutline size={16} />,
    color: '#F59E0B',
    label: 'Task',
  },
  profile_viewed_by_coach: {
    icon: <IoEyeOutline size={16} />,
    color: '#EC4899',
    label: 'View',
  },
  list_created: {
    icon: <IoListOutline size={16} />,
    color: '#8B5CF6',
    label: 'List',
  },
  meeting_requested: {
    icon: <IoCalendarOutline size={16} />,
    color: '#06B6D4',
    label: 'Meeting',
  },
  form_submitted: {
    icon: <IoDocumentOutline size={16} />,
    color: '#F97316',
    label: 'Form',
  },
  profile_update: {
    icon: <IoPersonOutline size={16} />,
    color: '#64748B',
    label: 'Profile',
  },
};

/* ---------- relative time helper ---------- */

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ---------- component ---------- */

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
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
      {/* Header */}
      <Box
        sx={{
          background: gradients.darkCard,
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IoTimeOutline color={colors.lime} size={18} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: '0.8rem',
            color: colors.white,
          }}
        >
          Recent Activity
        </Typography>
        <Chip
          label={`${activities.length} events`}
          size="small"
          sx={{
            ml: 'auto',
            bgcolor: `${colors.lime}20`,
            color: colors.lime,
            fontWeight: 700,
            fontSize: 11,
            height: 22,
          }}
        />
      </Box>

      {/* Timeline items */}
      <Stack sx={{ maxHeight: 480, overflowY: 'auto' }}>
        {activities.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#0A0A0A60' }}>
              No recent activity
            </Typography>
          </Box>
        )}
        {activities.map((act, i) => {
          const meta = activityMeta[act.activityType] || {
            icon: <IoDocumentOutline size={16} />,
            color: '#94A3B8',
            label: act.activityType,
          };
          return (
            <Box
              key={act.id || i}
              sx={{
                display: 'flex',
                gap: 1.5,
                px: 2.5,
                py: 1.5,
                borderBottom: i < activities.length - 1 ? '1px solid #F0F0F0' : 'none',
                transition: 'background 0.15s ease',
                '&:hover': { bgcolor: '#CCFF0006' },
              }}
            >
              {/* Icon dot */}
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: `${meta.color}15`,
                  color: meta.color,
                  clipPath:
                    'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
                }}
              >
                {meta.icon}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {act.description}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                  <Chip
                    label={meta.label}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: 10,
                      fontWeight: 700,
                      bgcolor: `${meta.color}12`,
                      color: meta.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  />
                  {act.actorEmail && (
                    <Typography variant="caption" sx={{ color: '#0A0A0A60' }}>
                      {act.actorEmail}
                    </Typography>
                  )}
                </Stack>
              </Box>

              {/* Timestamp */}
              <Typography
                variant="caption"
                sx={{
                  color: '#0A0A0A50',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  pt: 0.25,
                }}
              >
                {timeAgo(act.createdAt)}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
