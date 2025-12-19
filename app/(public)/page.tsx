'use client';
import React from 'react';
import { MarketingHeader } from '@/features/marketing/MarketingHeader';
import { Container, Typography, Box, Button, Stack } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

export default function MarketingPage() {
  return (
    <>
      <MarketingHeader />
      <Box sx={{ position: 'relative', height: { xs: 280, md: 540 }, overflow: 'hidden' }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src="/marketing/hero.mp4" type="video/mp4" />
        </video>
        <Box className="marketing-hero-title" sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.25))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        </Box>
      </Box>
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom>Get recruited with Athlete Narrative</Typography>
        <Typography variant="body1" sx={{ maxWidth: 720 }}>
          Showcase performance, social proof, and growth. Connect with recruiters across divisions.
          White-label backoffice lets agencies manage clients at scale.
        </Typography>
        <Box sx={{ my: 6 }}>
          <Image src="/marketing/available.png" alt="Available banner" width={960} height={98} style={{ width: '100%', height: 'auto' }} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, alignItems: 'center', mb: 8 }}>
          <Box>
            <Image src="/marketing/why1.jpg" alt="Why section 1" width={716} height={800} style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
          </Box>
          <Box>
            <Typography variant="h4" gutterBottom>WHY Athlete Narrative Matters</Typography>
            <Typography>
              The college recruiting process is stressful and broken for most families. Athlete Narrative simplifies recruiting into one easy system that saves time, reduces stress, and gives your athlete a real chance to be seen.
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, alignItems: 'center', mb: 8 }}>
          <Box>
            <Typography variant="h4" gutterBottom>Built for Athletes First</Typography>
            <Typography>
              Profiles are quick to build, highlight reels are easy to upload, and every feature feels natural. Research any school, compare options, and send personalized emails to coaches with a tap.
            </Typography>
          </Box>
          <Box>
            <Image src="/marketing/app4.png" alt="App preview" width={589} height={800} style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, alignItems: 'center', mb: 8 }}>
          <Box>
            <Image src="/marketing/why2.jpg" alt="Why section 2" width={800} height={724} style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
          </Box>
          <Box>
            <Typography variant="h4" gutterBottom>The Parent Advantage</Typography>
            <Typography>
              Weekly updates keep you in the loop without micromanaging. Know exactly where your child stands, which schools they’re targeting, and how coaches are responding.
            </Typography>
          </Box>
        </Box>
        {/* CTAs intentionally limited to sign in/sign up in header */}
        <Box sx={{ my: 6, display: 'flex', justifyContent: 'center' }}>
          <Image src="/marketing/as-seen-on.png" alt="As seen on" width={1024} height={36} style={{ width: '100%', maxWidth: 1024, height: 'auto' }} />
        </Box>
        <Box sx={{ my: 6 }}>
          <Typography variant="h4" gutterBottom>How It Works</Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <span aria-hidden style={{ color: '#1976d2', fontWeight: 700 }}>✓</span>
              <Typography><b>Create Your Profile</b> – Add highlight videos, metrics, academics, achievements, etc.</Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <span aria-hidden style={{ color: '#1976d2', fontWeight: 700 }}>✓</span>
              <Typography><b>Get Seen</b> – Coaches view, like, and reach out to athletes directly.</Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <span aria-hidden style={{ color: '#1976d2', fontWeight: 700 }}>✓</span>
              <Typography><b>Get Recruited</b> – Move from hope to committed with the right fit.</Typography>
            </Stack>
          </Stack>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, mt: 6 }}>
          <Box>
            <Image src="/marketing/avery.png" alt="Avery Howell" width={600} height={534} style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
            <Typography variant="h6" sx={{ mt: 1 }}>Avery Howell</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              “I’m a 5-star basketball player who has had a wild recruiting journey, resulting in me playing for USC Basketball. Athlete Narrative is the best platform to help you manage and navigate everything recruiting.”
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Image src="/marketing/colleges.png" alt="Colleges row" width={600} height={152} style={{ width: '100%', height: 'auto' }} />
            </Box>
          </Box>
          <Box>
            <Image src="/marketing/gavin.png" alt="Gavin Grahovac" width={600} height={534} style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
            <Typography variant="h6" sx={{ mt: 1 }}>Gavin Grahovac</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              “The AN app has helped me achieve bigger goals and really swing for the fences on what is next for me.”
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Image src="/marketing/tamu.png" alt="Texas A&M" width={400} height={329} style={{ width: '60%', height: 'auto' }} />
            </Box>
          </Box>
          <Box>
            <Image src="/marketing/drisan.png" alt="Drisan James" width={600} height={534} style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
            <Typography variant="h6" sx={{ mt: 1 }}>Drisan James</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              “As a former football player, Athlete Narrative’s support could have made a huge difference in my career. It empowers athletes to build strong personal brands, unlocking opportunities both on and off the field.”
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, alignItems: 'center', my: 8 }}>
          <Box>
            <Typography variant="h4" gutterBottom>Become an Ambassador</Typography>
            <Typography>
              Athlete Narrative is more than an app. It’s a movement to change how recruiting works for families everywhere. Ambassadors help spread the word in their communities.
            </Typography>
          </Box>
          <Box>
            <Image src="/marketing/ambassador.png" alt="Ambassador" width={747} height={800} style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
          </Box>
        </Box>

        <Box component="footer" sx={{ borderTop: '1px solid #e0e0e0', pt: 3, mt: 8, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">© {new Date().getFullYear()} MyRecruiterAgency</Typography>
          <Stack direction="row" spacing={2}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </Stack>
        </Box>
      </Container>
    </>
  );
}


