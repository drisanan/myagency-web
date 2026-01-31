'use client';

import React from 'react';
import { Box, Fab, Tooltip, Zoom } from '@mui/material';
import { FaLightbulb } from 'react-icons/fa';
import { SuggestionOverlay } from './SuggestionOverlay';

interface SuggestionButtonProps {
  /** Hide the button (e.g., on public pages) */
  hidden?: boolean;
}

/**
 * Floating suggestion button that appears on the middle-right of the screen.
 * When clicked, opens the suggestion overlay for area selection and feedback.
 */
export function SuggestionButton({ hidden = false }: SuggestionButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (hidden) return null;

  return (
    <>
      {/* Floating Button */}
      <Zoom in={!isOpen}>
        <Box
          sx={{
            position: 'fixed',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1200,
          }}
        >
          <Tooltip title="Suggest an improvement" placement="left" arrow>
            <Fab
              color="primary"
              size="medium"
              onClick={() => setIsOpen(true)}
              sx={{
                bgcolor: '#6366f1',
                '&:hover': {
                  bgcolor: '#4f46e5',
                },
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              }}
              aria-label="Suggest improvement"
            >
              <FaLightbulb size={20} />
            </Fab>
          </Tooltip>
        </Box>
      </Zoom>

      {/* Overlay */}
      <SuggestionOverlay
        open={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
