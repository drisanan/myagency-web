'use client';

import React from 'react';
import { Box, Typography, Container, Chip, IconButton, CircularProgress } from '@mui/material';
import { FaInstagram, FaTiktok, FaTwitter, FaFacebook, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaRunning } from 'react-icons/fa';
import { getPublicProfile, PublicProfile } from '@/services/profilePublic';
import { formatSportLabel } from '@/features/recruiter/divisionMapping';
import { normalizeYouTubeUrl, normalizeHudlUrl, normalizeInstagramUrl } from '@/services/urlNormalize';

// Sporty color palette
const colors = {
  bg: '#0a0a0a',
  surface: '#141414',
  surfaceLight: '#1a1a1a',
  accent: '#00ff87',
  accentAlt: '#00d4ff',
  text: '#ffffff',
  textMuted: '#888888',
  gradient: 'linear-gradient(135deg, #00ff87 0%, #00d4ff 100%)',
  gradientAlt: 'linear-gradient(135deg, #ff3366 0%, #ff6b35 100%)',
};

function StatCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <Box
      sx={{
        p: 3,
        bgcolor: colors.surfaceLight,
        borderRadius: 3,
        border: `1px solid ${colors.surface}`,
        textAlign: 'center',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: colors.accent,
          boxShadow: `0 8px 32px rgba(0, 255, 135, 0.15)`,
        },
      }}
    >
      {icon && (
        <Box sx={{ color: colors.accent, mb: 1, fontSize: 24 }}>
          {icon}
        </Box>
      )}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          background: colors.gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 0.5,
        }}
      >
        {value || '-'}
      </Typography>
      <Typography variant="body2" sx={{ color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 }}>
        {label}
      </Typography>
    </Box>
  );
}

function SocialButton({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <IconButton
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      sx={{
        bgcolor: colors.surfaceLight,
        color: colors.text,
        width: 56,
        height: 56,
        transition: 'all 0.3s ease',
        '&:hover': {
          bgcolor: colors.accent,
          color: colors.bg,
          transform: 'scale(1.1)',
        },
      }}
    >
      {icon}
    </IconButton>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="h5"
      sx={{
        fontWeight: 700,
        color: colors.text,
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        '&::after': {
          content: '""',
          flex: 1,
          height: 1,
          background: `linear-gradient(to right, ${colors.accent}40, transparent)`,
        },
      }}
    >
      {children}
    </Typography>
  );
}

export function AthleteProfileClient({ username }: { username: string }) {
  const [profile, setProfile] = React.useState<PublicProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getPublicProfile(username);
        if (!data) {
          setError('Profile not found');
        } else {
          setProfile(data);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: colors.accent }} />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: colors.bg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h2" sx={{ color: colors.accent, fontWeight: 800 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ color: colors.text }}>
          Athlete not found
        </Typography>
        <Typography variant="body1" sx={{ color: colors.textMuted }}>
          The profile @{username} doesn&apos;t exist or hasn&apos;t been set up yet.
        </Typography>
      </Box>
    );
  }

  const { radar } = profile;
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  // Check multiple possible profile image sources
  const profileImage = radar.profileImage || profile.photoUrl || profile.profileImageUrl || profile.galleryImages?.[0];
  const hasUploadedVideos = (profile.highlightVideos?.length ?? 0) > 0;
  const hasHighlights = radar.youtubeHighlightUrl || radar.hudlLink || hasUploadedVideos;
  const hasSocials = radar.instagramProfileUrl || radar.tiktokProfileUrl || radar.twitterUrl || radar.facebookUrl;
  const hasMetrics = (radar.metrics?.length ?? 0) > 0;
  const hasGallery = (profile.galleryImages?.length ?? 0) > 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bg }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 500, md: 600 },
          background: `linear-gradient(180deg, ${colors.bg} 0%, ${colors.surface} 100%)`,
          overflow: 'hidden',
        }}
      >
        {/* Animated background pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.05,
            backgroundImage: `
              radial-gradient(circle at 20% 50%, ${colors.accent} 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, ${colors.accentAlt} 0%, transparent 50%)
            `,
          }}
        />
        
        {/* Diagonal stripe */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            background: colors.gradient,
            clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)',
            opacity: 0.1,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: { xs: 6, md: 10 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 6,
              alignItems: 'center',
            }}
          >
            {/* Profile Image */}
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: 280, md: 400 },
                  height: { xs: 280, md: 400 },
                }}
              >
                {/* Glow effect */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: -20,
                    background: colors.gradient,
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    opacity: 0.3,
                  }}
                />
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `4px solid ${colors.accent}`,
                    boxShadow: `0 0 60px ${colors.accent}40`,
                  }}
                >
                  {profileImage ? (
                    <Box
                      component="img"
                      src={profileImage}
                      alt={fullName}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        bgcolor: colors.surfaceLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FaRunning size={80} color={colors.accent} />
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Info */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Chip
                label={formatSportLabel(profile.sport)}
                sx={{
                  bgcolor: colors.accent,
                  color: colors.bg,
                  fontWeight: 700,
                  fontSize: 12,
                  mb: 2,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 900,
                  color: colors.text,
                  lineHeight: 1.1,
                  mb: 1,
                  textTransform: 'uppercase',
                  letterSpacing: -1,
                }}
              >
                {fullName}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: colors.accent,
                  fontWeight: 500,
                  mb: 2,
                }}
              >
                @{profile.username}
              </Typography>
              
              {radar.school && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' }, mb: 1 }}>
                  <FaMapMarkerAlt color={colors.textMuted} />
                  <Typography variant="body1" sx={{ color: colors.textMuted }}>
                    {radar.school}
                  </Typography>
                </Box>
              )}
              
              {radar.graduationYear && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' }, mb: 3 }}>
                  <FaGraduationCap color={colors.textMuted} />
                  <Typography variant="body1" sx={{ color: colors.textMuted }}>
                    Class of {radar.graduationYear}
                  </Typography>
                </Box>
              )}

              {radar.description && (
                <Typography
                  variant="body1"
                  sx={{
                    color: colors.textMuted,
                    maxWidth: 500,
                    lineHeight: 1.8,
                    mx: { xs: 'auto', md: 0 },
                  }}
                >
                  {radar.description}
                </Typography>
              )}

              {/* Social Links */}
              {hasSocials && (
                <Box sx={{ display: 'flex', gap: 1.5, mt: 4, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  {radar.instagramProfileUrl && (
                    <SocialButton
                      href={normalizeInstagramUrl(radar.instagramProfileUrl)}
                      icon={<FaInstagram size={24} />}
                      label="Instagram"
                    />
                  )}
                  {radar.tiktokProfileUrl && (
                    <SocialButton
                      href={`https://tiktok.com/@${radar.tiktokProfileUrl}`}
                      icon={<FaTiktok size={24} />}
                      label="TikTok"
                    />
                  )}
                  {radar.twitterUrl && (
                    <SocialButton
                      href={`https://twitter.com/${radar.twitterUrl}`}
                      icon={<FaTwitter size={24} />}
                      label="Twitter"
                    />
                  )}
                  {radar.facebookUrl && (
                    <SocialButton
                      href={`https://facebook.com/${radar.facebookUrl}`}
                      icon={<FaFacebook size={24} />}
                      label="Facebook"
                    />
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 3,
          }}
        >
          {radar.preferredPosition && (
            <StatCard label="Position" value={radar.preferredPosition} />
          )}
          {radar.athleteheight && (
            <StatCard label="Height" value={radar.athleteheight} />
          )}
          {radar.athleteWeight && (
            <StatCard label="Weight" value={`${radar.athleteWeight} lbs`} />
          )}
          {radar.gpa && (
            <StatCard label="GPA" value={radar.gpa} icon={<FaGraduationCap />} />
          )}
        </Box>
      </Container>

      {/* Athletic Metrics */}
      {hasMetrics && (
        <Box sx={{ bgcolor: colors.surface, py: 8 }}>
          <Container maxWidth="lg">
            <SectionTitle>Athletic Metrics</SectionTitle>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 3,
              }}
            >
              {radar.metrics?.map((m, i) => (
                <StatCard key={i} label={m.title} value={m.value} />
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* Highlights Section */}
      {hasHighlights && (
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <SectionTitle>Highlights</SectionTitle>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {radar.youtubeHighlightUrl && (
              <Box
                component="a"
                href={normalizeYouTubeUrl(radar.youtubeHighlightUrl)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 4,
                  py: 2,
                  bgcolor: colors.surfaceLight,
                  borderRadius: 3,
                  color: colors.text,
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#ff0000',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <FaYoutube size={28} />
                <Typography fontWeight={600}>Watch on YouTube</Typography>
              </Box>
            )}
            {radar.hudlLink && (
              <Box
                component="a"
                href={normalizeHudlUrl(radar.hudlLink)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 4,
                  py: 2,
                  bgcolor: colors.surfaceLight,
                  borderRadius: 3,
                  color: colors.text,
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#ff6b00',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography fontWeight={700} sx={{ color: '#ff6b00' }}>HUDL</Typography>
                <Typography fontWeight={600}>View Profile</Typography>
              </Box>
            )}
          </Box>
          {/* Uploaded Highlight Videos */}
          {hasUploadedVideos && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ color: colors.text, mb: 2, fontWeight: 600 }}>
                Uploaded Highlights
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                {profile.highlightVideos?.map((video, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      bgcolor: colors.surfaceLight,
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: `1px solid ${colors.surface}`,
                    }}
                  >
                    <Box
                      component="video"
                      controls
                      preload="metadata"
                      sx={{ width: '100%', maxHeight: 300, bgcolor: '#000' }}
                    >
                      <source src={video.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </Box>
                    {video.title && (
                      <Box sx={{ p: 2 }}>
                        <Typography fontWeight={600} sx={{ color: colors.text }}>
                          {video.title}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Container>
      )}

      {/* Gallery Section */}
      {hasGallery && (
        <Box sx={{ bgcolor: colors.surface, py: 8 }}>
          <Container maxWidth="lg">
            <SectionTitle>Gallery</SectionTitle>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2,
              }}
            >
              {profile.galleryImages?.map((img, i) => (
                <Box
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  sx={{
                    aspectRatio: '1',
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: `0 8px 32px ${colors.accent}30`,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={img}
                    alt={`Gallery ${i + 1}`}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* Motivation Section */}
      {(radar.myMotivator || radar.athleteAdvice || radar.differenceMaker) && (
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <SectionTitle>What Drives Me</SectionTitle>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {radar.myMotivator && (
              <Box
                sx={{
                  p: 4,
                  bgcolor: colors.surfaceLight,
                  borderRadius: 3,
                  borderLeft: `4px solid ${colors.accent}`,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: colors.text,
                    fontStyle: 'italic',
                    fontWeight: 300,
                    lineHeight: 1.6,
                  }}
                >
                  &ldquo;{radar.myMotivator}&rdquo;
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textMuted, mt: 2 }}>
                  — Favorite Motivational Quote
                </Typography>
              </Box>
            )}
            {radar.differenceMaker && (
              <Box>
                <Typography variant="subtitle1" sx={{ color: colors.accent, fontWeight: 600, mb: 1 }}>
                  What Makes Me Different
                </Typography>
                <Typography variant="body1" sx={{ color: colors.textMuted, lineHeight: 1.8 }}>
                  {radar.differenceMaker}
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      )}

      {/* Contact Section */}
      <Box
        sx={{
          background: colors.gradient,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: colors.bg,
                mb: 2,
                textTransform: 'uppercase',
              }}
            >
              Get In Touch
            </Typography>
            <Typography variant="body1" sx={{ color: colors.bg, opacity: 0.8, mb: 4 }}>
              Interested in recruiting {profile.firstName}? Reach out directly.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              {profile.email && (
                <Box
                  component="a"
                  href={`mailto:${profile.email}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 4,
                    py: 2,
                    bgcolor: colors.bg,
                    borderRadius: 3,
                    color: colors.text,
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  <FaEnvelope />
                  {profile.email}
                </Box>
              )}
              {profile.phone && (
                <Box
                  component="a"
                  href={`tel:${profile.phone}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 4,
                    py: 2,
                    bgcolor: colors.bg,
                    borderRadius: 3,
                    color: colors.text,
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  <FaPhone />
                  {profile.phone}
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: colors.bg, py: 4, borderTop: `1px solid ${colors.surface}` }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: colors.textMuted, textAlign: 'center' }}>
            Powered by <Box component="span" sx={{ color: colors.accent, fontWeight: 600 }}>Athlete Narrative</Box>
          </Typography>
        </Container>
      </Box>

      {/* Lightbox */}
      {selectedImage && (
        <Box
          onClick={() => setSelectedImage(null)}
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Box
            component="img"
            src={selectedImage}
            alt="Gallery preview"
            sx={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 2,
            }}
          />
        </Box>
      )}
    </Box>
  );
}

