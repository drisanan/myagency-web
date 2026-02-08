'use client';
import React from 'react';
import { Box, Typography, Chip, Stack, Avatar } from '@mui/material';
import { IoEyeOutline, IoSchoolOutline, IoPeopleOutline } from 'react-icons/io5';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/features/auth/session';
import { getProfileViews, getWeeklyDigest } from '@/services/profileViews';
import { MetricCard } from '@/app/(app)/dashboard/MetricCard';
import { colors, gradients } from '@/theme/colors';
import { LoadingState } from '@/components/LoadingState';

export default function ClientProfileViewsPage() {
  const { session } = useSession();
  const clientId = session?.clientId || '';

  const viewsQuery = useQuery({
    queryKey: ['profileViews', clientId],
    queryFn: () => getProfileViews(clientId, { limit: 50 }),
    enabled: Boolean(clientId),
    staleTime: 60000,
  });

  const digestQuery = useQuery({
    queryKey: ['profileViewsDigest', clientId],
    queryFn: () => getWeeklyDigest(clientId),
    enabled: Boolean(clientId),
    staleTime: 300000,
  });

  const views = viewsQuery.data?.views || [];
  const stats = viewsQuery.data?.stats;

  if (viewsQuery.isLoading) {
    return <LoadingState message="Loading profile views..." />;
  }

  return (
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: colors.black,
          mb: 3,
        }}
      >
        Who's Viewing Your Profile
      </Typography>

      {/* Stats Summary - MetricCards */}
      {stats && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
            mb: 4,
          }}
        >
          <MetricCard
            title="Total Views"
            value={stats.totalViews}
            icon={<IoEyeOutline size={20} />}
          />
          <MetricCard
            title="Coaches Interested"
            value={stats.uniqueViewers}
            icon={<IoPeopleOutline size={20} />}
          />
          <MetricCard
            title="Different Schools"
            value={stats.uniqueUniversities}
            icon={<IoSchoolOutline size={20} />}
          />
        </Box>
      )}

      {/* Top Universities */}
      {stats?.topUniversities && stats.topUniversities.length > 0 && (
        <Box
          sx={{
            borderRadius: 0,
            clipPath:
              'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
            bgcolor: colors.white,
            overflow: 'hidden',
            position: 'relative',
            mb: 4,
            boxShadow: 'none',
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
          <Box sx={{ background: gradients.darkCard, px: 3, py: 1.5 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: '0.8rem',
                color: colors.white,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <IoSchoolOutline size={16} /> Top Schools Showing Interest
            </Typography>
          </Box>
          <Box sx={{ px: 3, py: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {stats.topUniversities.slice(0, 10).map((uni, i) => (
                <Chip
                  key={uni.university}
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: i < 3 ? colors.lime : '#E0E0E0',
                        color: i < 3 ? colors.black : '#666',
                        fontWeight: 700,
                        fontSize: 11,
                      }}
                    >
                      {i + 1}
                    </Avatar>
                  }
                  label={`${uni.university} (${uni.count})`}
                  sx={{
                    borderRadius: 0,
                    clipPath:
                      'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
                    fontWeight: 600,
                    fontSize: 12,
                    bgcolor: i < 3 ? `${colors.lime}10` : '#F5F5F5',
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Box>
      )}

      {/* Recent Views List */}
      <Box
        sx={{
          borderRadius: 0,
          clipPath:
            'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
          bgcolor: colors.white,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'none',
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
        <Box
          sx={{
            background: gradients.darkCard,
            px: 3,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <IoEyeOutline color={colors.lime} size={18} />
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
            Recent Profile Views
          </Typography>
          <Chip
            label={`${views.length} views`}
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

        <Stack sx={{ maxHeight: 500, overflowY: 'auto' }}>
          {views.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography sx={{ color: '#0A0A0A60' }}>
                No profile views yet. Keep working on your profile and reaching out to coaches!
              </Typography>
            </Box>
          ) : (
            views.map((view, i) => (
              <Box
                key={view.id}
                data-testid="profile-view-item"
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  px: 3,
                  py: 1.5,
                  borderBottom: i < views.length - 1 ? '1px solid #F0F0F0' : 'none',
                  transition: 'background 0.15s ease',
                  '&:hover': { bgcolor: `${colors.lime}06` },
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: view.university ? colors.black : '#E0E0E0',
                    color: view.university ? colors.lime : '#666',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {view.viewerName?.[0]?.toUpperCase() || 'C'}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {view.viewerName || 'A Coach'}
                    </Typography>
                    {view.position && (
                      <Chip
                        size="small"
                        label={view.position}
                        sx={{
                          height: 18,
                          fontSize: 10,
                          fontWeight: 700,
                          bgcolor: '#F0F0F0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      />
                    )}
                  </Stack>
                  {view.university && (
                    <Typography variant="caption" sx={{ color: '#0A0A0A80', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IoSchoolOutline size={11} /> {view.university}
                    </Typography>
                  )}
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: '#0A0A0A50', whiteSpace: 'nowrap', pt: 0.25 }}
                >
                  {new Date(view.viewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Typography>
              </Box>
            ))
          )}
        </Stack>
      </Box>

      {/* Weekly Digest */}
      {digestQuery.data && (
        <Box
          sx={{
            mt: 3,
            borderRadius: 0,
            clipPath:
              'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
            bgcolor: colors.white,
            overflow: 'hidden',
            position: 'relative',
            boxShadow: 'none',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '3px',
              background: `linear-gradient(180deg, ${colors.lime} 0%, ${colors.lime}60 100%)`,
              zIndex: 1,
            },
            p: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontSize: '0.8rem',
              color: colors.black,
              mb: 1,
            }}
          >
            This Week's Activity
          </Typography>
          <Typography variant="body1" sx={{ color: '#0A0A0A99' }}>
            You had <strong>{digestQuery.data.summary.totalViews}</strong> profile views this week
            from <strong>{digestQuery.data.summary.uniqueUniversities}</strong> different schools!
          </Typography>
        </Box>
      )}
    </Box>
  );
}
