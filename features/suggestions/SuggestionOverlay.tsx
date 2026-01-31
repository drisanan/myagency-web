'use client';

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Fade,
  Slide,
} from '@mui/material';
import { FaTimes, FaMousePointer, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { createSuggestion } from '@/services/suggestions';

type OverlayStep = 'select-area' | 'enter-suggestion' | 'submitting' | 'success';

interface AreaContext {
  selector: string;
  tagName: string;
  className: string;
  id: string;
  textContent: string;
  rect: { top: number; left: number; width: number; height: number };
}

interface SuggestionOverlayProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen overlay for capturing user suggestions with area selection.
 */
export function SuggestionOverlay({ open, onClose }: SuggestionOverlayProps) {
  const pathname = usePathname();
  const [step, setStep] = React.useState<OverlayStep>('select-area');
  const [selectedArea, setSelectedArea] = React.useState<AreaContext | null>(null);
  const [suggestion, setSuggestion] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [highlightedElement, setHighlightedElement] = React.useState<HTMLElement | null>(null);

  // Reset state when overlay opens
  React.useEffect(() => {
    if (open) {
      setStep('select-area');
      setSelectedArea(null);
      setSuggestion('');
      setError(null);
    }
  }, [open]);

  // Handle area selection mode
  React.useEffect(() => {
    if (!open || step !== 'select-area') {
      // Clean up highlight
      if (highlightedElement) {
        highlightedElement.style.outline = '';
        highlightedElement.style.outlineOffset = '';
        setHighlightedElement(null);
      }
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Ignore overlay elements
      if (target.closest('[data-suggestion-overlay]')) return;

      // Remove previous highlight
      if (highlightedElement && highlightedElement !== target) {
        highlightedElement.style.outline = '';
        highlightedElement.style.outlineOffset = '';
      }

      // Add highlight to current element
      target.style.outline = '2px solid #6366f1';
      target.style.outlineOffset = '2px';
      setHighlightedElement(target);
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Ignore overlay elements
      if (target.closest('[data-suggestion-overlay]')) return;

      e.preventDefault();
      e.stopPropagation();

      // Capture context about the clicked area
      const rect = target.getBoundingClientRect();
      const context: AreaContext = {
        selector: generateSelector(target),
        tagName: target.tagName.toLowerCase(),
        className: target.className,
        id: target.id,
        textContent: (target.textContent || '').slice(0, 200).trim(),
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
      };

      // Clean up highlight
      target.style.outline = '';
      target.style.outlineOffset = '';
      setHighlightedElement(null);

      setSelectedArea(context);
      setStep('enter-suggestion');
    };

    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      
      // Clean up any remaining highlight
      if (highlightedElement) {
        highlightedElement.style.outline = '';
        highlightedElement.style.outlineOffset = '';
      }
    };
  }, [open, step, highlightedElement]);

  const handleSubmit = async () => {
    if (!suggestion.trim()) {
      setError('Please enter your suggestion');
      return;
    }

    setStep('submitting');
    setError(null);

    try {
      await createSuggestion({
        screenPath: pathname || window.location.pathname,
        areaSelector: selectedArea?.selector || 'general',
        areaContext: selectedArea
          ? `Tag: ${selectedArea.tagName}, Class: ${selectedArea.className}, Content: "${selectedArea.textContent}"`
          : 'General feedback',
        originalSuggestion: suggestion,
      });

      setStep('success');
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit suggestion');
      setStep('enter-suggestion');
    }
  };

  const handleClose = () => {
    // Clean up any highlight before closing
    if (highlightedElement) {
      highlightedElement.style.outline = '';
      highlightedElement.style.outlineOffset = '';
      setHighlightedElement(null);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Dimmed backdrop - pointer-events: none during area selection so clicks pass through */}
      <Fade in={open}>
        <Box
          data-suggestion-overlay="backdrop"
          onClick={step === 'select-area' ? undefined : handleClose}
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1300,
            cursor: step === 'select-area' ? 'crosshair' : 'default',
            // Allow clicks to pass through during area selection
            pointerEvents: step === 'select-area' ? 'none' : 'auto',
          }}
        />
      </Fade>

      {/* Instruction banner for area selection */}
      {step === 'select-area' && (
        <Slide direction="down" in={step === 'select-area'}>
          <Paper
            data-suggestion-overlay="banner"
            elevation={8}
            sx={{
              position: 'fixed',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1400,
              px: 4,
              py: 2,
              borderRadius: 3,
              bgcolor: '#6366f1',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <FaMousePointer size={20} />
            <Typography variant="h6" fontWeight={600}>
              Tap the area you would like to improve
            </Typography>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{ color: 'white', ml: 2 }}
            >
              <FaTimes />
            </IconButton>
          </Paper>
        </Slide>
      )}

      {/* Suggestion form panel */}
      {(step === 'enter-suggestion' || step === 'submitting' || step === 'success') && (
        <Slide direction="left" in={true}>
          <Paper
            data-suggestion-overlay="form"
            elevation={12}
            sx={{
              position: 'fixed',
              top: '50%',
              right: 24,
              transform: 'translateY(-50%)',
              zIndex: 1400,
              width: 400,
              maxWidth: 'calc(100vw - 48px)',
              maxHeight: 'calc(100vh - 48px)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                bgcolor: '#6366f1',
                color: 'white',
                px: 3,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                {step === 'success' ? 'Thank You!' : 'Suggest an Improvement'}
              </Typography>
              <IconButton size="small" onClick={handleClose} sx={{ color: 'white' }}>
                <FaTimes />
              </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
              {step === 'success' ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <FaCheckCircle size={48} color="#10b981" />
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                    Suggestion Submitted!
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    We&apos;ll review your feedback and let you know when it&apos;s implemented.
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Selected area info */}
                  {selectedArea && (
                    <Box
                      sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: '#f3f4f6',
                        borderRadius: 2,
                        borderLeft: '3px solid #6366f1',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        SELECTED AREA
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {selectedArea.tagName.toUpperCase()}
                        {selectedArea.id && ` #${selectedArea.id}`}
                        {selectedArea.className && ` .${selectedArea.className.split(' ')[0]}`}
                      </Typography>
                      {selectedArea.textContent && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          &quot;{selectedArea.textContent.slice(0, 50)}...&quot;
                        </Typography>
                      )}
                    </Box>
                  )}

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Describe what you'd like to improve or change about this area..."
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    disabled={step === 'submitting'}
                    sx={{ mb: 2 }}
                    autoFocus
                  />

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedArea(null);
                        setStep('select-area');
                      }}
                      disabled={step === 'submitting'}
                      sx={{ flex: 1 }}
                    >
                      Select Different Area
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={step === 'submitting' || !suggestion.trim()}
                      startIcon={step === 'submitting' ? <CircularProgress size={16} color="inherit" /> : <FaPaperPlane />}
                      sx={{
                        flex: 1,
                        bgcolor: '#6366f1',
                        '&:hover': { bgcolor: '#4f46e5' },
                      }}
                    >
                      {step === 'submitting' ? 'Submitting...' : 'Submit'}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Slide>
      )}
    </>
  );
}

/**
 * Generate a CSS selector for an element
 */
function generateSelector(el: HTMLElement): string {
  if (el.id) {
    return `#${el.id}`;
  }

  const parts: string[] = [];
  let current: HTMLElement | null = el;
  let depth = 0;

  while (current && current !== document.body && depth < 4) {
    let selector = current.tagName.toLowerCase();
    
    if (current.id) {
      selector = `#${current.id}`;
      parts.unshift(selector);
      break;
    }
    
    if (current.className) {
      const classes = current.className.split(' ').filter(c => c && !c.startsWith('css-'));
      if (classes.length > 0) {
        selector += `.${classes[0]}`;
      }
    }
    
    parts.unshift(selector);
    current = current.parentElement;
    depth++;
  }

  return parts.join(' > ');
}
