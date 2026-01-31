'use client';
import React from 'react';
import { Box, Button, Step, StepLabel, Stepper, Typography, CircularProgress, Stack, StepButton, Alert, Chip, InputAdornment, IconButton } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { upsertClient, setClientGmailTokens } from '@/services/clients';
import { MenuItem, TextField } from '@mui/material';
import { getSports, formatSportLabel } from '@/features/recruiter/divisionMapping';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaCheck, FaTimes, FaTrash, FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import { checkUsernameAvailability } from '@/services/profilePublic';
import { uploadMedia, validateVideoFile } from '@/services/uploads';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

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
type RadarDraft = {
  events?: EventItem[];
  metrics?: MetricItem[];
  references?: ReferenceItem[];
} & Record<string, any>;

const steps = [
  'Basic Info',
  'Personal Info',
  'Social Media',
  'Content Links',
  'Gallery',
  'Events & Metrics',
  'Motivation & References',
  'Review',
];

function PersonalInfoStep({ value, onChange }: { value: RadarDraft; onChange: (k: string, v: any) => void }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <TextField size="small" label="Preferred Position" value={value.preferredPosition ?? ''} onChange={(e)=>onChange('preferredPosition', e.target.value)} />
      <TextField size="small" label="Height" value={value.athleteheight ?? ''} onChange={(e)=>onChange('athleteheight', e.target.value)} />
      <TextField size="small" label="Weight (lb)" value={value.athleteWeight ?? ''} onChange={(e)=>onChange('athleteWeight', e.target.value)} />
      <TextField size="small" label="School / Team / Club" value={value.school ?? ''} onChange={(e)=>onChange('school', e.target.value)} />
      <TextField size="small" label="ACT" value={value.act ?? ''} onChange={(e)=>onChange('act', e.target.value)} />
      <TextField size="small" label="SAT" value={value.sat ?? ''} onChange={(e)=>onChange('sat', e.target.value)} />
      <TextField size="small" label="Graduation Year" value={value.graduationYear ?? ''} onChange={(e)=>onChange('graduationYear', e.target.value)} />
      <TextField size="small" label="GPA" value={value.gpa ?? ''} onChange={(e)=>onChange('gpa', e.target.value)} />
      <TextField size="small" label="Short Description" value={value.description ?? ''} onChange={(e)=>onChange('description', e.target.value)} multiline rows={3} sx={{ gridColumn: '1 / -1' }} />
    </Box>
  );
}

function SocialStep({ value, onChange }: { value: RadarDraft; onChange: (k: string, v: any) => void }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <TextField size="small" label="Instagram Handle" value={value.instagramProfileUrl ?? ''} onChange={(e)=>onChange('instagramProfileUrl', e.target.value)} />
      <TextField size="small" label="TikTok Handle" value={value.tiktokProfileUrl ?? ''} onChange={(e)=>onChange('tiktokProfileUrl', e.target.value)} />
      <TextField size="small" label="Twitter Handle" value={value.twitterUrl ?? ''} onChange={(e)=>onChange('twitterUrl', e.target.value)} />
      <TextField size="small" label="Facebook Handle" value={value.facebookUrl ?? ''} onChange={(e)=>onChange('facebookUrl', e.target.value)} />
    </Box>
  );
}

function ContentLinksStep({ value, onChange }: { value: RadarDraft; onChange: (k: string, v: any) => void }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <TextField size="small" label="YouTube Highlight URL" value={value.youtubeHighlightUrl ?? ''} onChange={(e)=>onChange('youtubeHighlightUrl', e.target.value)} />
      <TextField size="small" label="Spotify Song URL" value={value.spotifySong ?? ''} onChange={(e)=>onChange('spotifySong', e.target.value)} />
      <TextField size="small" label="Hudl Link" value={value.hudlLink ?? ''} onChange={(e)=>onChange('hudlLink', e.target.value)} />
      <TextField size="small" label="Jungo Link" value={value.jungoLink ?? ''} onChange={(e)=>onChange('jungoLink', e.target.value)} />
      <TextField size="small" label="Additional Stats Link" value={value.additionalStatsLink ?? ''} onChange={(e)=>onChange('additionalStatsLink', e.target.value)} />
    </Box>
  );
}

// Image size constants - DynamoDB has 400KB item limit, base64 adds ~33% overhead
const MAX_SINGLE_IMAGE_KB = 150; // 150KB per image max
const MAX_SINGLE_IMAGE_BYTES = MAX_SINGLE_IMAGE_KB * 1024;
const MAX_TOTAL_GALLERY_KB = 800; // 800KB total for all gallery images
const MAX_TOTAL_GALLERY_BYTES = MAX_TOTAL_GALLERY_KB * 1024;
const MAX_IMAGES = 6; // Reduced from 10 to be safer

function calculateBase64Size(base64String: string): number {
  // Base64 strings include the data:image/xxx;base64, prefix
  const base64Data = base64String.split(',')[1] || base64String;
  return Math.ceil(base64Data.length * 0.75); // Base64 to bytes approximation
}

const MAX_HIGHLIGHT_VIDEOS = 4;

function GalleryStep({ 
  images, 
  onImagesChange,
  videos,
  onVideosChange,
  clientId,
}: { 
  images: string[]; 
  onImagesChange: (images: string[]) => void;
  videos: HighlightVideoItem[];
  onVideosChange: (videos: HighlightVideoItem[]) => void;
  clientId?: string;
}) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const videoInputRef = React.useRef<HTMLInputElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = React.useState(false);
  const [urlValue, setUrlValue] = React.useState('');
  const [uploadingVideoIndex, setUploadingVideoIndex] = React.useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);

  // Calculate current total size of gallery
  const currentTotalBytes = React.useMemo(() => {
    return images.reduce((sum, img) => {
      if (img.startsWith('data:')) {
        return sum + calculateBase64Size(img);
      }
      return sum + 100; // URL strings are small
    }, 0);
  }, [images]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (images.length + files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    let addedCount = 0;
    let runningTotal = currentTotalBytes;

    Array.from(files).forEach(file => {
      if (file.size > MAX_SINGLE_IMAGE_BYTES) {
        setError(`Each image must be ${MAX_SINGLE_IMAGE_KB}KB or smaller. "${file.name}" is ${Math.round(file.size / 1024)}KB. Please compress it.`);
        return;
      }
      
      // Estimate base64 size (adds ~33% overhead)
      const estimatedBase64Size = Math.ceil(file.size * 1.37);
      if (runningTotal + estimatedBase64Size > MAX_TOTAL_GALLERY_BYTES) {
        setError(`Total gallery size would exceed ${MAX_TOTAL_GALLERY_KB}KB limit. Please remove some images or use smaller files.`);
        return;
      }
      
      runningTotal += estimatedBase64Size;
      
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const actualSize = calculateBase64Size(result);
        
        if (actualSize > MAX_SINGLE_IMAGE_BYTES) {
          setError(`Image "${file.name}" exceeds ${MAX_SINGLE_IMAGE_KB}KB after encoding. Please use a smaller image.`);
          return;
        }
        
        onImagesChange([...images, result]);
        addedCount++;
        if (addedCount === files.length) {
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddUrl = () => {
    if (!urlValue.trim()) return;
    if (images.length >= MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    // URLs are fine - they're just short strings
    onImagesChange([...images, urlValue.trim()]);
    setUrlValue('');
    setError(null);
  };

  const handleRemoveImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
    setError(null);
  };

  const totalKB = Math.round(currentTotalBytes / 1024);
  const isNearLimit = currentTotalBytes > MAX_TOTAL_GALLERY_BYTES * 0.8;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1" fontWeight={600}>Profile Gallery</Typography>
      <Typography variant="body2" color="text.secondary">
        Add up to {MAX_IMAGES} images to showcase on your public athlete profile. Each image must be under {MAX_SINGLE_IMAGE_KB}KB.
      </Typography>
      
      {error && <Alert severity="error">{error}</Alert>}
      
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {images.map((img, idx) => (
          <Box
            key={idx}
            sx={{
              position: 'relative',
              width: 120,
              height: 120,
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
            }}
          >
            <Box
              component="img"
              src={img}
              alt={`Gallery ${idx + 1}`}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <IconButton
              size="small"
              onClick={() => handleRemoveImage(idx)}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                bgcolor: 'rgba(0,0,0,0.6)',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
              }}
            >
              <FaTrash size={12} />
            </IconButton>
          </Box>
        ))}
        
        {images.length < MAX_IMAGES && (
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              width: 120,
              height: 120,
              borderRadius: 2,
              border: '2px dashed #ccc',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: '#888', bgcolor: '#f9fafb' },
            }}
          >
            <FaPlus size={24} color="#888" />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Add Image
            </Typography>
          </Box>
        )}
      </Box>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleFileUpload}
        data-testid="gallery-upload"
      />
      
      <Button
        variant="text"
        size="small"
        onClick={() => setShowUrlInput(!showUrlInput)}
        sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
      >
        {showUrlInput ? 'Hide URL input' : 'Add image via URL'}
      </Button>
      
      {showUrlInput && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            label="Image URL"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button variant="outlined" onClick={handleAddUrl}>
            Add
          </Button>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {images.length}/{MAX_IMAGES} images added
        </Typography>
        <Typography 
          variant="caption" 
          color={isNearLimit ? 'warning.main' : 'text.secondary'}
          sx={{ fontWeight: isNearLimit ? 600 : 400 }}
        >
          {totalKB}KB / {MAX_TOTAL_GALLERY_KB}KB used
        </Typography>
      </Box>
      
      <Alert severity="info" sx={{ mt: 1 }}>
        <Typography variant="caption">
          <strong>Tip:</strong> For best results, compress images before uploading. Use tools like 
          <a href="https://tinypng.com" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 4 }}>TinyPNG</a> or 
          <a href="https://squoosh.app" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 4 }}>Squoosh</a>.
          Max {MAX_SINGLE_IMAGE_KB}KB per image.
        </Typography>
      </Alert>

      {/* Highlight Videos Section */}
      <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e5e7eb' }}>
        <Typography variant="subtitle1" fontWeight={600}>Highlight Videos</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add up to {MAX_HIGHLIGHT_VIDEOS} highlight videos. Upload MP4/MOV/WebM files (max 100MB) or paste video URLs.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {videos.map((video, idx) => {
            const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (!file || !clientId) return;
              
              const validation = validateVideoFile(file);
              if (!validation.valid) {
                setError(validation.error || 'Invalid video file');
                e.target.value = ''; // Reset input
                return;
              }
              
              setUploadingVideoIndex(idx);
              setUploadProgress(0);
              setError(null);
              
              try {
                const publicUrl = await uploadMedia(clientId, file, 'video', setUploadProgress);
                onVideosChange(videos.map((v, i) => i === idx ? { ...v, url: publicUrl } : v));
              } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Upload failed';
                setError(errorMessage);
              } finally {
                setUploadingVideoIndex(null);
                setUploadProgress(0);
                e.target.value = ''; // Reset input for next upload
              }
            };

            return (
            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 1.5, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                label={`Video ${idx + 1} Title`}
                value={video.title ?? ''}
                onChange={(e) => onVideosChange(videos.map((v, i) => i === idx ? { ...v, title: e.target.value } : v))}
                sx={{ width: 180 }}
                inputProps={{ 'data-testid': `highlight-video-title-${idx}` }}
                disabled={uploadingVideoIndex === idx}
              />
              <TextField
                size="small"
                label="Video URL"
                value={video.url}
                onChange={(e) => onVideosChange(videos.map((v, i) => i === idx ? { ...v, url: e.target.value } : v))}
                sx={{ flex: 1, minWidth: 200 }}
                placeholder="https://youtube.com/watch?v=... or upload below"
                inputProps={{ 'data-testid': `highlight-video-url-${idx}` }}
                disabled={uploadingVideoIndex === idx}
              />
              {uploadingVideoIndex === idx ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="caption">{uploadProgress}%</Typography>
                </Box>
              ) : (
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => onVideosChange(videos.filter((_, i) => i !== idx))}
                  data-testid={`remove-highlight-video-${idx}`}
                >
                  <FaTrash size={14} />
                </IconButton>
              )}
              {/* Hidden file input for Selenium testing */}
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                hidden
                onChange={handleVideoFileChange}
                data-testid={`video-file-input-${idx}`}
              />
              {/* Upload button for this video slot - always visible when clientId exists */}
              {clientId && uploadingVideoIndex !== idx && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FaPlus />}
                  onClick={() => {
                    const input = document.querySelector(`[data-testid="video-file-input-${idx}"]`) as HTMLInputElement;
                    input?.click();
                  }}
                  sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                  data-testid={`upload-video-${idx}`}
                >
                  {video.url ? 'Replace' : 'Upload'}
                </Button>
              )}
            </Box>
            );
          })}
          
          {videos.length < MAX_HIGHLIGHT_VIDEOS && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<FaPlus />}
              onClick={() => onVideosChange([...videos, { url: '', title: '' }])}
              sx={{ alignSelf: 'flex-start' }}
              data-testid="add-highlight-video"
              disabled={uploadingVideoIndex !== null}
            >
              Add Highlight Video
            </Button>
          )}
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {videos.length}/{MAX_HIGHLIGHT_VIDEOS} videos added
        </Typography>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            <strong>Supported formats:</strong> MP4, MOV, WebM (max 100MB). You can also paste links from YouTube, Vimeo, or Hudl.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
}

function EventsMetricsStep({ value, onChange }: { value: RadarDraft; onChange: (k: string, v: any) => void }) {
  const events = value.events ?? [];
  const metrics = value.metrics ?? [];

  const updateEvents = (items: EventItem[]) => onChange('events', items);
  const updateMetrics = (items: MetricItem[]) => onChange('metrics', items);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="subtitle1">Upcoming Events</Typography>
          <Button size="small" data-testid="add-event" onClick={() => updateEvents([...events, { name: '', startTime: '', endTime: '', website: '', playerNumber: '', location: '' }])}>+ Add Event</Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {events.length === 0 && <Typography variant="body2" color="text.secondary">No events added</Typography>}
          {events.map((ev, idx) => (
            <Box key={idx} sx={{ p: 2, border: '1px solid #e5e7eb', borderRadius: 2, bgcolor: '#fafafa' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
                <TextField 
                  size="small" 
                  label="Event Name" 
                  value={ev.name} 
                  onChange={(e) => updateEvents(events.map((v, i) => i === idx ? { ...v, name: e.target.value } : v))}
                  inputProps={{ 'data-testid': `event-name-${idx}` }}
                />
                <TextField 
                  size="small" 
                  label="Event Website" 
                  value={ev.website ?? ''} 
                  onChange={(e) => updateEvents(events.map((v, i) => i === idx ? { ...v, website: e.target.value } : v))} 
                  placeholder="https://..."
                  inputProps={{ 'data-testid': `event-website-${idx}` }}
                />
              <TextField
                size="small"
                label="Start Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={ev.startTime ?? ''}
                  onChange={(e) => updateEvents(events.map((v, i) => i === idx ? { ...v, startTime: e.target.value } : v))}
                  inputProps={{ 'data-testid': `event-start-${idx}` }}
              />
                <TextField
                  size="small"
                  label="End Time"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={ev.endTime ?? ''}
                  onChange={(e) => updateEvents(events.map((v, i) => i === idx ? { ...v, endTime: e.target.value } : v))}
                  inputProps={{ 'data-testid': `event-end-${idx}` }}
                />
                <TextField 
                  size="small" 
                  label="Player Number / Jersey #" 
                  value={ev.playerNumber ?? ''} 
                  onChange={(e) => updateEvents(events.map((v, i) => i === idx ? { ...v, playerNumber: e.target.value } : v))}
                  inputProps={{ 'data-testid': `event-player-number-${idx}` }}
                />
                <TextField 
                  size="small" 
                  label="Location" 
                  value={ev.location ?? ''} 
                  onChange={(e) => updateEvents(events.map((v, i) => i === idx ? { ...v, location: e.target.value } : v))} 
                  placeholder="City, State or Venue"
                  inputProps={{ 'data-testid': `event-location-${idx}` }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                <Button size="small" color="error" onClick={() => updateEvents(events.filter((_, i) => i !== idx))}>Remove Event</Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="subtitle1">Metrics</Typography>
          <Button size="small" data-testid="add-metric" onClick={() => updateMetrics([...metrics, { title: '', value: '' }])}>+ Add Metric</Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {metrics.length === 0 && <Typography variant="body2" color="text.secondary">No metrics added</Typography>}
          {metrics.map((m, idx) => (
            <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, gap: 1 }}>
              <TextField size="small" label="Metric Title" value={m.title} onChange={(e)=>updateMetrics(metrics.map((v,i)=>i===idx?{...v,title:e.target.value}:v))} />
              <TextField size="small" label="Metric Value" value={m.value} onChange={(e)=>updateMetrics(metrics.map((v,i)=>i===idx?{...v,value:e.target.value}:v))} />
              <Button color="error" onClick={()=>updateMetrics(metrics.filter((_,i)=>i!==idx))}>Remove</Button>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function MotivationStep({ value, onChange }: { value: RadarDraft; onChange: (k: string, v: any) => void }) {
  const references = value.references ?? [];
  const updateReferences = (items: ReferenceItem[]) => onChange('references', items);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <TextField size="small" label="Favorite Motivational Quote" value={value.myMotivator ?? ''} onChange={(e)=>onChange('myMotivator', e.target.value)} />
      <TextField size="small" label="Advice" value={value.athleteAdvice ?? ''} onChange={(e)=>onChange('athleteAdvice', e.target.value)} />
      </Box>
      <TextField
        size="small"
        label="What makes you different from everyone else as a person?"
        value={value.differenceMaker ?? ''}
        onChange={(e)=>onChange('differenceMaker', e.target.value)}
        multiline
        rows={3}
      />

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="subtitle1">References</Typography>
          <Button size="small" data-testid="add-reference" onClick={() => updateReferences([...references, { name: '', email: '', phone: '' }])}>+ Add Reference</Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {references.length === 0 && <Typography variant="body2" color="text.secondary">No references added</Typography>}
          {references.map((ref, idx) => (
            <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr) auto' }, gap: 1 }}>
              <TextField size="small" label="Name" value={ref.name} onChange={(e)=>updateReferences(references.map((v,i)=>i===idx?{...v,name:e.target.value}:v))} />
              <TextField size="small" label="Email" value={ref.email} onChange={(e)=>updateReferences(references.map((v,i)=>i===idx?{...v,email:e.target.value}:v))} />
              <TextField size="small" label="Phone" value={ref.phone} onChange={(e)=>updateReferences(references.map((v,i)=>i===idx?{...v,phone:e.target.value}:v))} />
              <Button color="error" onClick={()=>updateReferences(references.filter((_,i)=>i!==idx))}>Remove</Button>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function BasicInfoStep({
  value,
  onChange,
  errors,
  gmailConnected,
  gmailConnecting,
  onConnectGmail,
  gmailError,
  publicMode = false,
}: {
  value: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
  errors?: { email?: string; firstName?: string; lastName?: string; sport?: string; gmail?: string; username?: string; phone?: string; accessCode?: string };
  gmailConnected: boolean;
  gmailConnecting: boolean;
  onConnectGmail: () => void;
  gmailError?: string | null;
  publicMode?: boolean;
}) {
  const sports = getSports();
  const [showUrlInput, setShowUrlInput] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [photoError, setPhotoError] = React.useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = React.useState<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');
  const usernameCheckTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check username availability with debounce
  const handleUsernameChange = (newUsername: string) => {
    const cleaned = newUsername.toLowerCase().replace(/[^a-z0-9-]/g, '');
    onChange({ ...value, username: cleaned });
    
    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }
    
    if (cleaned.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    
    setUsernameStatus('checking');
    usernameCheckTimeout.current = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(cleaned);
        if (result.reason === 'check_failed') {
          setUsernameStatus('error');
        } else {
          setUsernameStatus(result.available ? 'available' : 'taken');
        }
      } catch {
        setUsernameStatus('error');
      }
    }, 800);
  };
  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_PROFILE_IMAGE_KB = 200; // 200KB max for profile image
    const MAX_PROFILE_IMAGE_BYTES = MAX_PROFILE_IMAGE_KB * 1024;
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setPhotoError(`Profile image must be ${MAX_PROFILE_IMAGE_KB}KB or smaller. Your image is ${Math.round(file.size / 1024)}KB. Please compress it using TinyPNG or Squoosh.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        ...value,
        photoUrl: reader.result as string,
        profileImageUrl: reader.result as string,
        photoFileName: file.name,
      });
      setPhotoError(null);
    };
    reader.readAsDataURL(file);
  };
  const triggerFile = () => fileInputRef.current?.click();
  const handleSportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sport = e.target.value;
    onChange({
      ...value,
      sport,
    });
  };
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, maxWidth: 700 }}>
      <TextField
        size="small"
        label="Athlete Email"
        value={value.email ?? ''}
        onChange={(e)=>onChange({ ...value, email: e.target.value })}
        error={Boolean(errors?.email)}
        helperText={errors?.email || ''}
        inputProps={{ 'data-testid': 'athlete-email' }}
      />
      <TextField
        size="small"
        label="Access Code"
        type="password"
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6, 'data-testid': 'athlete-access-code' }}
        value={value.accessCode ?? ''}
        onChange={(e)=>onChange({ ...value, accessCode: e.target.value.slice(0, 6).replace(/\D/g, '') })}
        error={Boolean(errors?.accessCode)}
        helperText={
          errors?.accessCode || 
          (value.hasExistingAccessCode && !value.accessCode 
            ? '••••••  (existing code set - enter new 6-digit code to change)' 
            : '6-digit numeric code')
        }
      />
      <TextField size="small" label="First name" value={value.firstName ?? ''} onChange={(e)=>onChange({ ...value, firstName: e.target.value })} error={Boolean(errors?.firstName)} helperText={errors?.firstName || ''} />
      <TextField size="small" label="Last name" value={value.lastName ?? ''} onChange={(e)=>onChange({ ...value, lastName: e.target.value })} error={Boolean(errors?.lastName)} helperText={errors?.lastName || ''} />
      <TextField
        size="small"
        label="Phone"
        value={value.phone ?? ''}
        onChange={(e)=>onChange({ ...value, phone: e.target.value })}
        inputProps={{ inputMode: 'tel', 'data-testid': 'athlete-phone' }}
        error={Boolean(errors?.phone)}
        helperText={errors?.phone || ''}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          onClick={triggerFile}
          sx={{
            width: 96,
            height: 96,
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#fafafa',
            flexShrink: 0,
          }}
          data-testid="photo-preview"
        >
          {value.photoUrl || value.profileImageUrl ? (
            <Box component="img" src={value.photoUrl || value.profileImageUrl} alt="Profile" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Typography variant="caption" color="text.secondary">Add Photo</Typography>
          )}
        </Box>
        <Stack spacing={0.5}>
          <Button variant="outlined" onClick={triggerFile} sx={{ textTransform: 'none' }}>
            {value.photoFileName ? `Uploaded: ${value.photoFileName}` : 'Upload / Replace'}
          </Button>
          <Button variant="text" size="small" onClick={()=>setShowUrlInput((s)=>!s)} sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
            {showUrlInput ? 'Hide URL input' : 'Set via URL'}
      </Button>
        </Stack>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoFile} data-testid="photo-upload" />
      </Box>
      {photoError && (
        <Typography variant="caption" color="error">
          {photoError}
        </Typography>
      )}
      {showUrlInput && (
        <TextField
          size="small"
          label="Profile Image URL"
          value={value.photoUrl ?? value.profileImageUrl ?? ''}
          onChange={(e)=>onChange({ ...value, photoUrl: e.target.value, profileImageUrl: e.target.value })}
        />
      )}
      <TextField
        size="small"
        select
        label="Sport"
        value={value.sport ?? ''}
        onChange={handleSportChange}
        SelectProps={{ MenuProps: { disablePortal: true } }}
        error={Boolean(errors?.sport)}
        helperText={errors?.sport || ''}
      >
        {sports.map((s) => (
          <MenuItem key={s} value={s}>
            {formatSportLabel(s)}
          </MenuItem>
        ))}
      </TextField>

      {/* Username / Vanity URL */}
      <TextField
        size="small"
        label="Profile URL (Username)"
        value={value.username ?? ''}
        onChange={(e) => handleUsernameChange(e.target.value)}
        error={Boolean(errors?.username) || usernameStatus === 'taken'}
        helperText={
          errors?.username ||
          (usernameStatus === 'taken' ? 'Username is already taken' :
           usernameStatus === 'available' ? 'Username is available!' :
           usernameStatus === 'error' ? 'Unable to verify - will check on save' :
           `Your public profile: myrecruiteragency.com/athlete/${value.username || 'yourname'}`)
        }
        inputProps={{ 'data-testid': 'athlete-username' }}
        InputProps={{
          startAdornment: <InputAdornment position="start">@</InputAdornment>,
          endAdornment: (
            <InputAdornment position="end">
              {usernameStatus === 'checking' && <CircularProgress size={16} />}
              {usernameStatus === 'available' && <FaCheck color="green" />}
              {usernameStatus === 'taken' && <FaTimes color="red" />}
              {usernameStatus === 'error' && <FaExclamationTriangle color="orange" />}
            </InputAdornment>
          ),
        }}
        sx={{ gridColumn: '1 / -1' }}
      />

      {/* Gmail Connection Section */}
      <Box sx={{ gridColumn: '1 / -1', mt: 2, p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: errors?.gmail ? '1px solid #d32f2f' : '1px solid #e5e7eb' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Gmail Connection <Typography component="span" color="error">*</Typography>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Connect your Gmail account to allow your agency to send recruiting emails on your behalf.
        </Typography>
        
        {gmailConnected ? (
          <Chip
            icon={<FaGoogle size={14} />}
            label="Gmail Connected"
            color="success"
            sx={{ fontWeight: 500 }}
          />
        ) : (
          <Stack spacing={1}>
            <Button
              variant="contained"
              onClick={onConnectGmail}
              disabled={gmailConnecting}
              startIcon={gmailConnecting ? <CircularProgress size={16} color="inherit" /> : <FaGoogle />}
              sx={{ 
                bgcolor: '#4285f4', 
                color: '#fff', 
                '&:hover': { bgcolor: '#3367d6' },
                alignSelf: 'flex-start',
              }}
            >
              {gmailConnecting ? 'Connecting…' : 'Connect Gmail Account'}
            </Button>
            {errors?.gmail && (
              <Typography variant="caption" color="error">
                {errors.gmail}
              </Typography>
            )}
          </Stack>
        )}
        {gmailError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {gmailError}
          </Alert>
        )}
      </Box>
    </Box>
  );
}

type ClientWizardProps = {
  initialClient?: any;
  mode?: 'create' | 'edit';
  onSaved?: () => void;
  redirectOnSave?: boolean;
};

export function ClientWizard({
  initialClient,
  mode = 'create',
  onSaved,
  redirectOnSave = true,
  publicMode = false,
  publicSubmit,
  overrideAgencyEmail,
  onSubmitSuccess,
}: ClientWizardProps & {
  publicMode?: boolean;
  publicSubmit?: (payload: Record<string, any>) => Promise<void>;
  overrideAgencyEmail?: string;
  onSubmitSuccess?: () => void;
}) {
  const { session } = useSession();
  const router = useRouter();
  const [activeStep, setActiveStep] = React.useState(0);
  const [basic, setBasic] = React.useState<Record<string, any>>(initialClient ? { 
    ...initialClient, 
    password: '',
    accessCode: '', // Clear for re-entry, but track if exists
    hasExistingAccessCode: Boolean(initialClient.accessCodeHash || initialClient.authEnabled),
  } : {});
  const [radar, setRadar] = React.useState<RadarDraft>({
    events: initialClient?.radar?.events ?? [],
    metrics: initialClient?.radar?.metrics ?? [],
    references: initialClient?.radar?.references ?? [],
    ...(initialClient?.radar ?? {}),
  });
  const isLast = activeStep === steps.length - 1;
  const [errors, setErrors] = React.useState<{ email?: string; firstName?: string; lastName?: string; sport?: string; gmail?: string; phone?: string; accessCode?: string }>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [submitSuccess, setSubmitSuccess] = React.useState('');

  // Gmail connection state
  const [gmailConnecting, setGmailConnecting] = React.useState(false);
  const [gmailConnected, setGmailConnected] = React.useState(false);
  const [gmailError, setGmailError] = React.useState<string | null>(null);
  const [gmailTokens, setGmailTokens] = React.useState<any>(null);
  const popupRef = React.useRef<Window | null>(null);
  // Generate a temporary client ID for OAuth flow before the client is created
  const tempClientIdRef = React.useRef<string>(`temp-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  // Listen for OAuth popup messages
  React.useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (typeof window === 'undefined') return;
      // Allow messages from both frontend and API origins (OAuth callback posts from API domain)
      const apiOrigin = (API_BASE_URL || 'https://api.myrecruiteragency.com').replace(/\/$/, '');
      const allowedOrigins = [window.location.origin, apiOrigin];
      if (!allowedOrigins.includes(e.origin)) return;
      
      if (e.data?.type === 'google-oauth-success') {
        const id = e.data?.clientId || tempClientIdRef.current;
        console.info('[gmail-wizard:oauth-success]', { clientId: id });
        setGmailConnecting(false);
        setGmailConnected(true);
        setGmailError(null);
        setErrors(prev => ({ ...prev, gmail: undefined }));
        try { popupRef.current?.close(); } catch {}
        
        // Fetch tokens from server and store them
        (async () => {
          try {
            const r = await fetch(`${API_BASE_URL}/google/tokens?clientId=${encodeURIComponent(id)}`, { credentials: 'include' });
            const j = await r.json();
            if (j?.ok && j?.tokens) {
              setGmailTokens(j.tokens);
              console.info('[gmail-wizard:tokens:stored]', { clientId: id });
            }
          } catch { /* ignore */ }
        })();
      }
      
      if (e.data?.type === 'google-oauth-error') {
        setGmailConnecting(false);
        setGmailError('Gmail connection failed. Please try again.');
        try { popupRef.current?.close(); } catch {}
      }
    }
    
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Check Gmail status if editing existing client
  React.useEffect(() => {
    if (!initialClient?.id) return;
    if (typeof window === 'undefined') return;
    
    const statusUrl = `${API_BASE_URL}/google/status?clientId=${encodeURIComponent(initialClient.id)}`;
    fetch(statusUrl, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setGmailConnected(Boolean(d?.connected)))
      .catch(() => setGmailConnected(false));
  }, [initialClient?.id]);

  async function handleConnectGmail() {
    try {
      setGmailError(null);
      setGmailConnecting(true);
      
      // Use existing client ID if editing, otherwise use temp ID
      const clientId = initialClient?.id || tempClientIdRef.current;
      
      const oauthUrl = `${API_BASE_URL}/google/oauth/url?clientId=${encodeURIComponent(clientId)}`;
      const res = await fetch(oauthUrl, { credentials: 'include' });
      const data = await res.json();
      
      if (!data?.url) throw new Error('Failed to start Gmail connection flow');
      
      const w = 500, h = 700;
      const y = window.top?.outerHeight ? Math.max(0, (window.top.outerHeight - h) / 2) : 100;
      const x = window.top?.outerWidth ? Math.max(0, (window.top.outerWidth - w) / 2) : 100;
      
      popupRef.current = window.open(
        data.url,
        'an-google-oauth',
        `toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${w},height=${h},top=${y},left=${x}`
      );
      
      if (!popupRef.current) throw new Error('Popup blocked. Please allow popups and try again.');
    } catch (e: any) {
      setGmailConnecting(false);
      setGmailError(e?.message || 'Failed to start Gmail connection');
    }
  }

  React.useEffect(() => {
    if (!initialClient) return;
    setBasic((prev) => {
      if (!prev.id || prev.id !== initialClient.id || Object.keys(prev).length === 0) {
        return { 
          ...initialClient, 
          password: '',
          accessCode: '', // Clear for re-entry
          hasExistingAccessCode: Boolean(initialClient.accessCodeHash || initialClient.authEnabled),
        };
      }
      return prev;
    });
    setRadar((prev) => {
      const base = !prev || Object.keys(prev || {}).length === 0 ? initialClient.radar ?? {} : prev;
      return {
        events: base.events ?? [],
        metrics: base.metrics ?? [],
        references: base.references ?? [],
        ...base,
      };
    });
  }, [initialClient?.id]);

  const validateBasic = React.useCallback((value: Record<string, any>, checkGmail = true) => {
    const next: { email?: string; firstName?: string; lastName?: string; sport?: string; gmail?: string; phone?: string; accessCode?: string } = {};
    if (!value.email?.trim()) next.email = 'Email is required';
    if (!value.firstName?.trim()) next.firstName = 'First name is required';
    if (!value.lastName?.trim()) next.lastName = 'Last name is required';
    if (!value.sport?.trim()) next.sport = 'Sport is required';
    if (!value.phone?.trim()) next.phone = 'Phone number is required';
    // Access code: required for new clients, optional for edits if already set
    const hasExisting = value.hasExistingAccessCode;
    const hasNewCode = value.accessCode?.trim()?.length === 6;
    if (!hasExisting && !hasNewCode) {
      next.accessCode = 'Access code is required (6 digits)';
    } else if (value.accessCode?.trim() && value.accessCode.length !== 6) {
      next.accessCode = 'Access code must be exactly 6 digits';
    }
    return next;
  }, [gmailConnected, mode]);

  const handleNext = async () => {
    // Block advancement from the Basic Info step if required fields are missing.
    if (activeStep === 0) {
      const validation = validateBasic(basic);
      if (Object.keys(validation).length) {
        setErrors(validation);
        setSubmitError('Please fill all required fields.');
        return;
      } else {
        setErrors({});
        setSubmitError('');
      }
    }

    if (isLast) {
      // Skip Gmail validation on final submit if we've already validated in step 0
      const validation = validateBasic(basic, false);
      if (Object.keys(validation).length) {
        setErrors(validation);
        setSubmitError('Please fill all required fields.');
        setActiveStep(0);
        return;
      } else {
        setErrors({});
        setSubmitError('');
        setSubmitSuccess('');
      }
      // Copy profile photo to radar.profileImage so it displays on public profile
      const profileImage = basic.photoUrl || basic.profileImageUrl;
      const mergedRadar = {
        ...radar,
        ...(profileImage ? { profileImage } : {}),
      };
      const payload: Record<string, any> = {
        ...basic,
        radar: mergedRadar,
        agencyEmail: overrideAgencyEmail ?? initialClient?.agencyEmail ?? session?.email,
        id: initialClient?.id,
        // Include Gmail tokens if connected during this session
        gmailTokens: gmailTokens || undefined,
        tempGmailClientId: gmailConnected && !initialClient?.id ? tempClientIdRef.current : undefined,
      };
      if (!payload.password) {
        delete payload.password;
      }
      setSubmitting(true);
      setSubmitError('');
      try {
        if (publicMode && publicSubmit) {
          await publicSubmit(payload);
        } else {
          const result = await upsertClient(payload);
          // If we have Gmail tokens and a new client ID, associate them
          if (gmailTokens && result?.id) {
            try {
              await setClientGmailTokens(result.id, gmailTokens);
            } catch (e) {
              console.error('Failed to save Gmail tokens to client', e);
            }
          }
        }
        onSaved?.();
        onSubmitSuccess?.();
        if (publicMode) {
          setSubmitSuccess('Submitted!');
        } else if (redirectOnSave) {
          router.push('/clients');
        } else {
          setActiveStep(0);
          setSubmitSuccess('Profile updated!');
        }
        return;
      } catch (e: any) {
        setSubmitError(e?.message || 'Failed to save client');
      } finally {
        setSubmitting(false);
      }
    }
    setActiveStep((s) => s + 1);
  };
  const handleBack = () => setActiveStep((s)=> Math.max(0, s - 1));

  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label, idx) => (
          <Step key={label}>
            {mode === 'edit' ? (
              <StepButton onClick={() => setActiveStep(idx)}>{label}</StepButton>
            ) : (
            <StepLabel>{label}</StepLabel>
            )}
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mb: 2 }}>
        {submitError && (
          <Typography color="error" sx={{ mb: 2 }}>
            {submitError}
          </Typography>
        )}
        {!submitError && submitSuccess && (
          <Typography color="success.main" sx={{ mb: 2 }}>
            {submitSuccess}
          </Typography>
        )}
        {activeStep === 0 && (
          <BasicInfoStep
            value={basic}
            onChange={(v) => {
              setBasic(v);
              if (Object.keys(errors).length) {
                setErrors((prev) => ({
                  email: v.email ? undefined : prev.email,
                  firstName: v.firstName ? undefined : prev.firstName,
                  lastName: v.lastName ? undefined : prev.lastName,
                  sport: v.sport ? undefined : prev.sport,
                  phone: v.phone ? undefined : prev.phone,
                  accessCode: v.accessCode?.length === 6 ? undefined : prev.accessCode,
                  gmail: prev.gmail, // Keep gmail error until connected
                }));
              }
            }}
            errors={errors}
            gmailConnected={gmailConnected}
            gmailConnecting={gmailConnecting}
            onConnectGmail={handleConnectGmail}
            gmailError={gmailError}
            publicMode={publicMode}
          />
        )}
        {activeStep === 1 && (
          <PersonalInfoStep value={radar} onChange={(k,v)=>setRadar((p)=>({ ...p, [k]: v }))} />
        )}
        {activeStep === 2 && (
          <SocialStep value={radar} onChange={(k,v)=>setRadar((p)=>({ ...p, [k]: v }))} />
        )}
        {activeStep === 3 && (
          <ContentLinksStep value={radar} onChange={(k,v)=>setRadar((p)=>({ ...p, [k]: v }))} />
        )}
        {activeStep === 4 && (
          <GalleryStep 
            images={basic.galleryImages || []} 
            onImagesChange={(images) => setBasic((prev) => ({ ...prev, galleryImages: images }))}
            videos={basic.highlightVideos || []}
            onVideosChange={(videos) => setBasic((prev) => ({ ...prev, highlightVideos: videos }))}
            clientId={initialClient?.id || tempClientIdRef.current}
          />
        )}
        {activeStep === 5 && (
          <EventsMetricsStep value={radar} onChange={(k,v)=>setRadar((p)=>({ ...p, [k]: v }))} />
        )}
        {activeStep === 6 && (
          <MotivationStep value={radar} onChange={(k,v)=>setRadar((p)=>({ ...p, [k]: v }))} />
        )}
        {activeStep === 7 && (
          <Box>
            <Typography variant="h6" gutterBottom>Review</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, gap: 3, alignItems: 'start' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                <Box
                  sx={{
                    width: 160,
                    height: 160,
                    aspectRatio: '1 / 1',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    flexShrink: 0,
                  }}
                >
                  {basic.photoUrl || basic.profileImageUrl ? (
                    <Box component="img" src={basic.photoUrl || basic.profileImageUrl} alt="Profile" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No Photo</Box>
                  )}
                </Box>
                <Typography variant="h6">{[basic.firstName, basic.lastName].filter(Boolean).join(' ') || 'Athlete'}</Typography>
                <Typography variant="body2" color="text.secondary">{basic.email || 'No email'}</Typography>
                <Typography variant="body2" color="text.secondary">{basic.sport ? formatSportLabel(basic.sport) : 'No sport'}</Typography>
                {basic.username && (
                  <Typography variant="body2" color="primary" sx={{ mt: 0.5, fontWeight: 500 }}>
                    @{basic.username}
                  </Typography>
                )}
                {gmailConnected && (
                  <Chip
                    icon={<FaGoogle size={12} />}
                    label="Gmail Connected"
                    color="success"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Personal</Typography>
                <Typography>Preferred Position: {radar.preferredPosition || '-'}</Typography>
                <Typography>Height: {radar.athleteheight || '-'}</Typography>
                <Typography>Weight: {radar.athleteWeight || '-'}</Typography>
                <Typography>School / Team / Club: {radar.school || '-'}</Typography>
                <Typography>GPA: {radar.gpa || '-'}</Typography>
                <Typography>ACT: {radar.act || '-'}</Typography>
                <Typography>SAT: {radar.sat || '-'}</Typography>
                <Typography>Graduation Year: {radar.graduationYear || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Social</Typography>
                <Typography>Instagram: {radar.instagramProfileUrl || '-'}</Typography>
                <Typography>TikTok: {radar.tiktokProfileUrl || '-'}</Typography>
                <Typography>Twitter: {radar.twitterUrl || '-'}</Typography>
                <Typography>Facebook: {radar.facebookUrl || '-'}</Typography>
              </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="subtitle2" color="text.secondary">About</Typography>
                  <Typography>{radar.description || '-'}</Typography>
                </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Content</Typography>
                <Typography>YouTube Highlight: {radar.youtubeHighlightUrl || '-'}</Typography>
                <Typography>Spotify Song: {radar.spotifySong || '-'}</Typography>
                <Typography>Hudl: {radar.hudlLink || '-'}</Typography>
                <Typography>Jungo: {radar.jungoLink || '-'}</Typography>
                <Typography>Additional Stats: {radar.additionalStatsLink || '-'}</Typography>
              </Box>
              <Box>
                  <Typography variant="subtitle2" color="text.secondary">Upcoming Events</Typography>
                  {(radar.events ?? []).length
                    ? (radar.events ?? []).map((ev: EventItem, i: number) => (
                        <Box key={i} sx={{ mb: 1.5, pl: 1.5, borderLeft: '2px solid #e5e7eb' }}>
                          <Typography fontWeight={500}>{ev.name || 'Untitled Event'}</Typography>
                          {ev.startTime && <Typography variant="body2" color="text.secondary">Start: {ev.startTime}</Typography>}
                          {ev.endTime && <Typography variant="body2" color="text.secondary">End: {ev.endTime}</Typography>}
                          {ev.location && <Typography variant="body2" color="text.secondary">Location: {ev.location}</Typography>}
                          {ev.playerNumber && <Typography variant="body2" color="text.secondary">Player #: {ev.playerNumber}</Typography>}
                          {ev.website && <Typography variant="body2" color="text.secondary">Website: {ev.website}</Typography>}
                        </Box>
                      ))
                    : <Typography color="text.secondary">No events</Typography>}
              </Box>
              <Box>
                  <Typography variant="subtitle2" color="text.secondary">Metrics</Typography>
                  {(radar.metrics ?? []).length
                    ? (radar.metrics ?? []).map((m: MetricItem, i: number) => (
                        <Typography key={i}>{m.title || 'Metric'}{m.value ? ` — ${m.value}` : ''}</Typography>
                      ))
                    : <Typography color="text.secondary">No metrics</Typography>}
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="subtitle2" color="text.secondary">Motivation & References</Typography>
                <Typography>Favorite Motivational Quote: {radar.myMotivator || '-'}</Typography>
                <Typography>Advice: {radar.athleteAdvice || '-'}</Typography>
                  {(radar.references ?? []).length
                    ? (radar.references ?? []).map((r: ReferenceItem, i: number) => (
                        <Typography key={i}>
                          {r.name || 'Reference'}
                          {r.email ? ` • ${r.email}` : ''}
                          {r.phone ? ` • ${r.phone}` : ''}
                        </Typography>
                      ))
                    : <Typography color="text.secondary">No references</Typography>}
                </Box>
                {(basic.galleryImages?.length ?? 0) > 0 && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Gallery ({basic.galleryImages.length} images)</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {basic.galleryImages.map((img: string, i: number) => (
                        <Box
                          key={i}
                          component="img"
                          src={img}
                          alt={`Gallery ${i + 1}`}
                          sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                {(basic.highlightVideos?.length ?? 0) > 0 && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Highlight Videos ({basic.highlightVideos.length})</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {basic.highlightVideos.map((video: HighlightVideoItem, i: number) => (
                        <Box key={i} sx={{ pl: 1.5, borderLeft: '2px solid #e5e7eb' }}>
                          <Typography fontWeight={500}>{video.title || `Video ${i + 1}`}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                            {video.url || 'No URL'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                {basic.username && (
                  <Box sx={{ gridColumn: '1 / -1', p: 2, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #0ea5e9' }}>
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                      Public Profile URL
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      myrecruiteragency.com/athlete/{basic.username}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        >
          {submitting
            ? 'Saving…'
            : isLast
              ? mode === 'edit'
                ? 'Save Changes'
                : 'Create Client'
              : 'Next'}
        </Button>
      </Box>
    </Box>
  );
}


