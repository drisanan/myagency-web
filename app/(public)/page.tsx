'use client';
import React from 'react';
import { MarketingHeader } from '@/features/marketing/MarketingHeader';
import { Container, Typography, Box, Button, Stack } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

/* ─── Shared angular image wrapper ─── */
function AngularImage({ src, alt, width, height, ...rest }: { src: string; alt: string; width: number; height: number; style?: React.CSSProperties }) {
  return (
    <Box
      sx={{
        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
        overflow: 'hidden',
        lineHeight: 0,
      }}
    >
      <Image src={src} alt={alt} width={width} height={height} style={{ width: '100%', height: 'auto', display: 'block', ...rest.style }} />
    </Box>
  );
}

/* ─── Section divider — angular lime accent ─── */
function SectionDivider() {
  return (
    <Box
      sx={{
        height: '3px',
        my: 6,
        background: 'linear-gradient(90deg, transparent 0%, #CCFF00 20%, #CCFF00 80%, transparent 100%)',
        clipPath: 'polygon(2% 0, 98% 0, 100% 100%, 0 100%)',
        opacity: 0.3,
      }}
    />
  );
}

export default function MarketingPage() {
  return (
    <>
      <MarketingHeader />

      {/* ════════ HERO ════════ */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 340, md: 600 },
          overflow: 'hidden',
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src="/marketing/hero.mp4" type="video/mp4" />
        </video>
        {/* Dark gradient overlay */}
        <Box
          className="marketing-hero-title"
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.3) 40%, rgba(10,10,10,0.7) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
{/* Speed-lines intentionally omitted from hero to keep video clean */}
          <Box sx={{ textAlign: 'center', px: 2, position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h1"
              sx={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: { xs: '2.5rem', md: '4.5rem' },
                letterSpacing: '0.04em',
                lineHeight: 1,
                color: '#FFFFFF',
                mb: 2,
              }}
            >
              <Box component="span" sx={{ color: '#CCFF00' }}>Your</Box> Recruiting Agency
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: { xs: '1.2rem', md: '2rem' },
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: '0.06em',
                mb: 3,
              }}
            >
              Your Brand. Your System.
            </Typography>
            <Button
              LinkComponent={Link}
              href="https://marketing.myrecruiteragency.com/mrastart"
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #CCFF00 0%, #B8E600 60%, #A0CC00 100%)',
                color: '#0A0A0A',
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '1.3rem',
                letterSpacing: '0.08em',
                px: 5,
                py: 1.5,
                borderRadius: 0,
                clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
                boxShadow: '0 4px 24px rgba(204,255,0,0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #D4FF1A 0%, #CCFF00 100%)',
                  boxShadow: '0 8px 36px rgba(204,255,0,0.45)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Get Started
            </Button>
          </Box>
        </Box>
        {/* Bottom angular clip */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -1,
            left: 0,
            right: 0,
            height: 60,
            background: '#0A0A0A',
            clipPath: 'polygon(0 100%, 100% 100%, 100% 0)',
          }}
        />
      </Box>

      {/* ════════ INTRO ════════ */}
      <Container sx={{ py: 8 }}>
        <Box sx={{ maxWidth: 760, mb: 6 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#CCFF00',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              mb: 1,
            }}
          >
            My Recruiter Agency
          </Typography>
          <Typography variant="h3" sx={{ fontFamily: '"Bebas Neue", sans-serif', color: '#FFFFFF', mb: 2 }}>
            The Complete Recruiting HQ
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: 1.7 }}>
            A complete recruiting headquarters that organizes athletes, automates communication, and gives you a scalable,
            professional workflow under your brand. Connect Gmail and Google Calendar to send outreach emails and schedule
            recruiting meetings with user approval.
          </Typography>
        </Box>

        <SectionDivider />

        {/* ════════ INTRODUCING MRA ════════ */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, alignItems: 'center', mb: 10 }}>
          <AngularImage src="/marketing/why1.jpg" alt="Why section 1" width={716} height={800} />
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: '#CCFF00',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                mb: 1,
              }}
            >
              Introducing
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: '"Bebas Neue", sans-serif', color: '#FFFFFF', mb: 2 }}>
              My Recruiter Agency
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Bebas Neue", sans-serif',
                color: 'rgba(255,255,255,0.5)',
                mb: 2,
                letterSpacing: '0.04em',
              }}
            >
              The First White-Labeled Recruiting CRM
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, mb: 1 }}>
              Built for Advisors and Agencies — a complete recruiting headquarters that organizes athletes, automates communication,
              and gives you a scalable, professional workflow — all under your brand, not someone else&apos;s.
            </Typography>
          </Box>
        </Box>

        {/* ════════ THE PROBLEM ════════ */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, alignItems: 'center', mb: 10 }}>
          <Box>
            <Typography variant="h3" sx={{ fontFamily: '"Bebas Neue", sans-serif', color: '#FFFFFF', mb: 2 }}>
              Why Do You Need This?
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, lineHeight: 1.7 }}>
              Recruiting isn&apos;t overwhelming because of the athletes. It&apos;s overwhelming because the system around them is fragmented.
              Most advisors are forced to manage:
            </Typography>
            <Stack spacing={1} sx={{ mb: 3 }}>
              {[
                'Film on five platforms',
                'Grades in screenshots',
                'Communication in scattered emails',
                'Schedules in notes apps',
                'Coach replies buried in threads',
                'Parents asking for updates',
                'Athletes sending midnight messages',
                'Zero centralized structure',
              ].map((item) => (
                <Stack key={item} direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      background: '#CCFF00',
                      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>{item}</Typography>
                </Stack>
              ))}
            </Stack>
            <Typography
              variant="h5"
              sx={{ fontFamily: '"Bebas Neue", sans-serif', color: '#CCFF00', mb: 1.5, letterSpacing: '0.04em' }}
            >
              Which Leads To...
            </Typography>
            <Stack spacing={0.75}>
              {[
                'Dropped conversations',
                'Missed opportunities',
                'Frustrated families',
                'Directors drowning in admin',
                'Advisors burning out',
              ].map((item) => (
                <Typography key={item} sx={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                  — {item}
                </Typography>
              ))}
            </Stack>
          </Box>
          <AngularImage src="/marketing/app4.png" alt="App preview" width={589} height={800} />
        </Box>

        {/* ════════ THE SOLUTION ════════ */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, alignItems: 'center', mb: 10 }}>
          <AngularImage src="/marketing/why2.jpg" alt="Why section 2" width={800} height={724} />
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: '#CCFF00',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                mb: 1,
              }}
            >
              The Solution
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: '"Bebas Neue", sans-serif', color: '#FFFFFF', mb: 2 }}>
              Built for Advisors, Directors, and Clubs
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, lineHeight: 1.7 }}>
              The first recruiting CRM designed for real-world workflow.
            </Typography>
            <Button
              LinkComponent={Link}
              href="https://marketing.myrecruiteragency.com/mrastart"
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #CCFF00 0%, #B8E600 60%, #A0CC00 100%)',
                color: '#0A0A0A',
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '1.1rem',
                letterSpacing: '0.08em',
                px: 4,
                py: 1.2,
                borderRadius: 0,
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                boxShadow: '0 4px 20px rgba(204,255,0,0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #D4FF1A 0%, #CCFF00 100%)',
                  boxShadow: '0 6px 28px rgba(204,255,0,0.4)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Learn More Now
            </Button>
          </Box>
        </Box>

        {/* ════════ FOOTER ════════ */}
        <Box
          component="footer"
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            pt: 3,
            mt: 10,
            pb: 4,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            &copy; {new Date().getFullYear()} MyRecruiterAgency
          </Typography>
          <Stack direction="row" spacing={3}>
            <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.875rem' }}>
              Privacy
            </Link>
            <Link href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.875rem' }}>
              Terms
            </Link>
          </Stack>
        </Box>
      </Container>
    </>
  );
}
