'use client';

import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  FaEnvelope,
  FaPhone,
  FaRunning,
  FaGraduationCap,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaFacebook,
  FaYoutube,
  FaSpotify,
  FaLink,
  FaQuoteLeft,
  FaCalendarAlt,
  FaTachometerAlt,
  FaUserFriends,
  FaPen,
  FaGoogle,
} from 'react-icons/fa';
import { colors } from '@/theme/colors';
import { formatSportLabel } from '@/features/recruiter/divisionMapping';

/* ─────────────── types (mirror ClientWizard) ─────────────── */
type EventItem = {
  name: string;
  startTime?: string;
  endTime?: string;
  website?: string;
  playerNumber?: string;
  location?: string;
};
type MetricItem = { title: string; value: string };
type ReferenceItem = { name: string; email?: string; phone?: string };
type HighlightVideoItem = { url: string; title?: string };

interface ClientProfileViewProps {
  client: any;
  onEdit: () => void;
}

/* ─── small helper: show value or a muted placeholder ─── */
const Val = ({ children, placeholder = 'Not set' }: { children?: React.ReactNode; placeholder?: string }) =>
  children ? (
    <Typography variant="body2" sx={{ color: colors.black, wordBreak: 'break-word' }}>
      {children}
    </Typography>
  ) : (
    <Typography variant="body2" sx={{ color: '#0A0A0A40', fontStyle: 'italic' }}>
      {placeholder}
    </Typography>
  );

/* ─── section card ─── */
const Section = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      bgcolor: colors.white,
      borderRadius: 0,
      clipPath:
        'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
      p: { xs: 2, sm: 2.5 },
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '3px',
        background: `linear-gradient(180deg, ${colors.lime} 0%, ${colors.lime}40 100%)`,
      },
    }}
  >
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
      <Box sx={{ color: colors.lime, display: 'flex', fontSize: 16 }}>{icon}</Box>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, letterSpacing: '-0.01em', color: colors.black }}
      >
        {title}
      </Typography>
    </Stack>
    {children}
  </Box>
);

/* ─── field row ─── */
const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <Box sx={{ display: 'flex', gap: 1, py: 0.5, alignItems: 'baseline' }}>
    <Typography
      variant="caption"
      sx={{ fontWeight: 600, color: '#0A0A0A80', minWidth: 120, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 11 }}
    >
      {label}
    </Typography>
    <Val>{value || undefined}</Val>
  </Box>
);

/* ─── link field — clickable when populated ─── */
const LinkField = ({ label, value }: { label: string; value?: string | null }) => (
  <Box sx={{ display: 'flex', gap: 1, py: 0.5, alignItems: 'baseline' }}>
    <Typography
      variant="caption"
      sx={{ fontWeight: 600, color: '#0A0A0A80', minWidth: 120, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 11 }}
    >
      {label}
    </Typography>
    {value ? (
      <Typography
        variant="body2"
        component="a"
        href={value.startsWith('http') ? value : `https://${value}`}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ color: colors.black, textDecoration: 'underline', wordBreak: 'break-all', '&:hover': { color: colors.lime } }}
      >
        {value}
      </Typography>
    ) : (
      <Val />
    )}
  </Box>
);

/* ═══════════════════════════════════════════════════════════
   ClientProfileView — read-only summary of all client data
   ═══════════════════════════════════════════════════════════ */
export function ClientProfileView({ client, onEdit }: ClientProfileViewProps) {
  const radar = client?.radar ?? {};
  const events: EventItem[] = radar.events ?? [];
  const metrics: MetricItem[] = radar.metrics ?? [];
  const references: ReferenceItem[] = radar.references ?? [];
  const galleryImages: string[] = client?.galleryImages ?? [];
  const highlightVideos: HighlightVideoItem[] = client?.highlightVideos ?? [];
  const photoUrl = client?.photoUrl || client?.profileImageUrl || radar?.profileImageUrl || radar?.photoUrl || '';
  const fullName = [client?.firstName, client?.lastName].filter(Boolean).join(' ') || 'Athlete';
  const sport = client?.sport ? formatSportLabel(client.sport) : null;

  return (
    <Box>
      {/* ── Hero header ── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.black} 0%, #181818 100%)`,
          borderRadius: 0,
          clipPath:
            'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
          p: { xs: 3, sm: 4 },
          position: 'relative',
          overflow: 'hidden',
          mb: 3,
        }}
      >
        {/* Lime glow overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: '50%',
            height: '160%',
            background: `radial-gradient(ellipse, ${colors.lime}12 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'center', sm: 'flex-start' }}
          spacing={3}
          sx={{ position: 'relative', zIndex: 1 }}
        >
          {/* Avatar */}
          <Avatar
            src={photoUrl || undefined}
            alt={fullName}
            sx={{
              width: { xs: 100, sm: 120 },
              height: { xs: 100, sm: 120 },
              border: `3px solid ${colors.lime}`,
              bgcolor: '#1a1a1a',
              fontSize: 40,
              fontWeight: 800,
              color: colors.lime,
            }}
          >
            {!photoUrl && fullName.charAt(0).toUpperCase()}
          </Avatar>

          {/* Name & basics */}
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: colors.white,
                lineHeight: 1.2,
              }}
            >
              {fullName}
            </Typography>

            {sport && (
              <Chip
                label={sport}
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: colors.lime,
                  color: colors.black,
                  fontWeight: 700,
                  fontSize: 12,
                  borderRadius: 0,
                }}
              />
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 1.5, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              {client?.email && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <FaEnvelope size={12} color={colors.lime} />
                  <Typography variant="body2" sx={{ color: '#ffffff99' }}>
                    {client.email}
                  </Typography>
                </Stack>
              )}
              {client?.phone && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <FaPhone size={12} color={colors.lime} />
                  <Typography variant="body2" sx={{ color: '#ffffff99' }}>
                    {client.phone}
                  </Typography>
                </Stack>
              )}
            </Stack>

            {client?.username && (
              <Typography variant="body2" sx={{ color: colors.lime, mt: 0.5, fontWeight: 600 }}>
                @{client.username}
              </Typography>
            )}

            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              {client?.gmailConnected && (
                <Chip
                  icon={<FaGoogle size={10} />}
                  label="Gmail"
                  size="small"
                  sx={{
                    bgcolor: '#ffffff14',
                    color: '#ffffffcc',
                    fontSize: 11,
                    '& .MuiChip-icon': { color: '#ffffffcc' },
                  }}
                />
              )}
              {radar?.graduationYear && (
                <Chip
                  label={`Class of ${radar.graduationYear}`}
                  size="small"
                  sx={{ bgcolor: '#ffffff14', color: '#ffffffcc', fontSize: 11 }}
                />
              )}
              {radar?.school && (
                <Chip
                  label={radar.school}
                  size="small"
                  sx={{ bgcolor: '#ffffff14', color: '#ffffffcc', fontSize: 11 }}
                />
              )}
            </Stack>
          </Box>

          {/* Edit button */}
          <Button
            variant="contained"
            startIcon={<FaPen size={13} />}
            onClick={onEdit}
            sx={{
              bgcolor: colors.lime,
              color: colors.black,
              fontWeight: 700,
              px: 3,
              py: 1,
              borderRadius: 0,
              textTransform: 'none',
              fontSize: 14,
              whiteSpace: 'nowrap',
              alignSelf: { xs: 'center', sm: 'flex-start' },
              '&:hover': { bgcolor: '#B8E600' },
            }}
          >
            Edit Profile
          </Button>
        </Stack>
      </Box>

      {/* ── Sections grid ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {/* About */}
        {radar?.description && (
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Section icon={<FaQuoteLeft />} title="About">
              <Typography variant="body2" sx={{ color: colors.black, whiteSpace: 'pre-line' }}>
                {radar.description}
              </Typography>
            </Section>
          </Box>
        )}

        {/* Personal Info */}
        <Section icon={<FaRunning />} title="Personal Info">
          <Field label="Position" value={radar?.preferredPosition} />
          <Field label="Height" value={radar?.athleteheight} />
          <Field label="Weight" value={radar?.athleteWeight} />
          <Field label="School" value={radar?.school} />
          <Field label="GPA" value={radar?.gpa} />
          <Field label="ACT" value={radar?.act} />
          <Field label="SAT" value={radar?.sat} />
          <Field label="Grad Year" value={radar?.graduationYear} />
        </Section>

        {/* Social Media */}
        <Section icon={<FaInstagram />} title="Social Media">
          <LinkField label="Instagram" value={radar?.instagramProfileUrl} />
          <LinkField label="TikTok" value={radar?.tiktokProfileUrl} />
          <LinkField label="Twitter" value={radar?.twitterUrl} />
          <LinkField label="Facebook" value={radar?.facebookUrl} />
        </Section>

        {/* Content Links */}
        <Section icon={<FaYoutube />} title="Content & Links">
          <LinkField label="YouTube" value={radar?.youtubeHighlightUrl} />
          <LinkField label="Spotify" value={radar?.spotifySong} />
          <LinkField label="Hudl" value={radar?.hudlLink} />
          <LinkField label="Jungo" value={radar?.jungoLink} />
          <LinkField label="Stats" value={radar?.additionalStatsLink} />
        </Section>

        {/* Events */}
        <Section icon={<FaCalendarAlt />} title="Upcoming Events">
          {events.length > 0 ? (
            <Stack spacing={1.5}>
              {events.map((ev, i) => (
                <Box
                  key={i}
                  sx={{
                    pl: 1.5,
                    borderLeft: `2px solid ${colors.lime}40`,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: colors.black }}>
                    {ev.name || 'Untitled Event'}
                  </Typography>
                  {ev.startTime && (
                    <Typography variant="caption" sx={{ color: '#0A0A0A80' }}>
                      {ev.startTime}
                      {ev.endTime ? ` — ${ev.endTime}` : ''}
                    </Typography>
                  )}
                  {ev.location && (
                    <Typography variant="caption" display="block" sx={{ color: '#0A0A0A80' }}>
                      {ev.location}
                    </Typography>
                  )}
                  {ev.playerNumber && (
                    <Typography variant="caption" display="block" sx={{ color: '#0A0A0A80' }}>
                      Player #{ev.playerNumber}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: '#0A0A0A40', fontStyle: 'italic' }}>
              No upcoming events
            </Typography>
          )}
        </Section>

        {/* Metrics */}
        <Section icon={<FaTachometerAlt />} title="Metrics">
          {metrics.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {metrics.map((m, i) => (
                <Box
                  key={i}
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    bgcolor: '#0A0A0A08',
                    clipPath:
                      'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#0A0A0A80', textTransform: 'uppercase', fontSize: 10 }}>
                    {m.title || 'Metric'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.black }}>
                    {m.value || '-'}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: '#0A0A0A40', fontStyle: 'italic' }}>
              No metrics added
            </Typography>
          )}
        </Section>

        {/* Motivation & References */}
        <Section icon={<FaQuoteLeft />} title="Motivation & References">
          <Field label="Quote" value={radar?.myMotivator} />
          <Field label="Advice" value={radar?.athleteAdvice} />
          <Field label="Difference" value={radar?.differenceMaker} />
          {references.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: '#0A0A0A80', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 11, mb: 0.5, display: 'block' }}
              >
                References
              </Typography>
              <Stack spacing={0.5}>
                {references.map((r, i) => (
                  <Box key={i} sx={{ pl: 1.5, borderLeft: `2px solid ${colors.lime}40` }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {r.name || 'Reference'}
                    </Typography>
                    {(r.email || r.phone) && (
                      <Typography variant="caption" sx={{ color: '#0A0A0A80' }}>
                        {[r.email, r.phone].filter(Boolean).join(' · ')}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Section>

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Section icon={<FaLink />} title={`Gallery (${galleryImages.length})`}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {galleryImages.map((img: string, i: number) => (
                  <Box
                    key={i}
                    component="img"
                    src={img}
                    alt={`Gallery ${i + 1}`}
                    sx={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 0,
                      clipPath:
                        'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                    }}
                  />
                ))}
              </Box>
            </Section>
          </Box>
        )}

        {/* Highlight Videos */}
        {highlightVideos.length > 0 && (
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Section icon={<FaYoutube />} title={`Highlight Videos (${highlightVideos.length})`}>
              <Stack spacing={1}>
                {highlightVideos.map((video: HighlightVideoItem, i: number) => (
                  <Box key={i} sx={{ pl: 1.5, borderLeft: `2px solid ${colors.lime}40` }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {video.title || `Video ${i + 1}`}
                    </Typography>
                    {video.url && (
                      <Typography
                        variant="caption"
                        component="a"
                        href={video.url.startsWith('http') ? video.url : `https://${video.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: '#0A0A0A80', wordBreak: 'break-all', '&:hover': { color: colors.lime } }}
                      >
                        {video.url}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </Section>
          </Box>
        )}
      </Box>
    </Box>
  );
}
