'use client';

import React from 'react';
import {
  Box,
  Fab,
  Zoom,
  Typography,
  TextField,
  IconButton,
  Stack,
  Button,
  Chip,
  CircularProgress,
  Slide,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  IoChatbubbleEllipsesOutline,
  IoCloseOutline,
  IoSendOutline,
  IoNavigateOutline,
  IoArrowForwardOutline,
} from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import { useSession } from '@/features/auth/session';
import {
  sendChatMessage,
  type ChatMessage,
  type NavigationLink,
} from '@/services/supportChat';
import { colors } from '@/theme/colors';

// ─── Markdown-lite renderer ────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    let processed: React.ReactNode = line;

    // Bold
    processed = reactReplace(String(processed), /\*\*(.+?)\*\*/g, (match, idx) => (
      <strong key={`b-${i}-${idx}`}>{match}</strong>
    ));

    // Inline code
    processed = reactReplace(
      typeof processed === 'string' ? processed : line,
      /`([^`]+)`/g,
      (match, idx) => (
        <code
          key={`c-${i}-${idx}`}
          style={{
            background: 'rgba(204,255,0,0.1)',
            padding: '1px 4px',
            borderRadius: 3,
            fontSize: '0.85em',
            color: colors.lime,
          }}
        >
          {match}
        </code>
      ),
    );

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <Typography key={i} sx={{ fontWeight: 700, fontSize: '0.85rem', mt: 1, mb: 0.5, color: colors.lime }}>
          {line.slice(4)}
        </Typography>,
      );
      return;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <Typography key={i} sx={{ fontWeight: 700, fontSize: '0.9rem', mt: 1, mb: 0.5, color: '#fff' }}>
          {line.slice(3)}
        </Typography>,
      );
      return;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      elements.push(
        <Box key={i} sx={{ display: 'flex', gap: 0.5, mb: 0.3, pl: 1 }}>
          <Typography variant="body2" sx={{ fontSize: '0.82rem', lineHeight: 1.5, color: '#ffffffcc' }}>
            {processed}
          </Typography>
        </Box>,
      );
      return;
    }

    // Bullet list
    if (line.startsWith('- ')) {
      elements.push(
        <Box key={i} sx={{ display: 'flex', gap: 0.5, mb: 0.3, pl: 1 }}>
          <Typography variant="body2" component="span" sx={{ color: colors.lime, fontSize: '0.82rem' }}>
            {'\u2022'}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.82rem', lineHeight: 1.5, color: '#ffffffcc' }}>
            {typeof processed === 'string' ? processed.slice(2) : processed}
          </Typography>
        </Box>,
      );
      return;
    }

    // Empty line = spacing
    if (!line.trim()) {
      elements.push(<Box key={i} sx={{ height: 6 }} />);
      return;
    }

    // Normal text
    elements.push(
      <Typography key={i} variant="body2" sx={{ fontSize: '0.82rem', lineHeight: 1.5, color: '#ffffffcc', mb: 0.2 }}>
        {processed}
      </Typography>,
    );
  });

  return <>{elements}</>;
}

/** Replace regex matches in a string with React nodes */
function reactReplace(
  text: string,
  regex: RegExp,
  replacer: (match: string, index: number) => React.ReactNode,
): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let matchIdx = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(regex.source, regex.flags);

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(replacer(match[1], matchIdx++));
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
}

// ─── Navigation Link Button ────────────────────────────────────────

function NavLinkButton({ link, onClick }: { link: NavigationLink; onClick: () => void }) {
  return (
    <Button
      size="small"
      onClick={onClick}
      startIcon={<IoNavigateOutline size={14} />}
      endIcon={<IoArrowForwardOutline size={12} />}
      sx={{
        bgcolor: `${colors.lime}12`,
        color: colors.lime,
        fontWeight: 700,
        fontSize: '0.72rem',
        textTransform: 'none',
        borderRadius: 0,
        px: 1.5,
        py: 0.5,
        border: `1px solid ${colors.lime}25`,
        clipPath:
          'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
        '&:hover': {
          bgcolor: `${colors.lime}20`,
          borderColor: `${colors.lime}40`,
        },
        justifyContent: 'flex-start',
        whiteSpace: 'nowrap',
      }}
    >
      {link.label}
    </Button>
  );
}

// ─── Chat Message Bubble ───────────────────────────────────────────

function MessageBubble({
  message,
  onNavigate,
}: {
  message: ChatMessage;
  onNavigate: (path: string) => void;
}) {
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 1.5,
      }}
    >
      <Box
        sx={{
          maxWidth: '88%',
          p: 1.5,
          borderRadius: 0,
          clipPath: isUser
            ? 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)'
            : 'polygon(0 0, 100% 0, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
          bgcolor: isUser ? `${colors.lime}15` : '#1a1a2e',
          border: `1px solid ${isUser ? `${colors.lime}30` : '#ffffff10'}`,
        }}
      >
        {renderMarkdown(message.content)}

        {/* Navigation links */}
        {message.navigationLinks && message.navigationLinks.length > 0 && (
          <Stack spacing={0.5} sx={{ mt: 1.5, pt: 1, borderTop: '1px solid #ffffff10' }}>
            {message.navigationLinks.map((link, i) => (
              <NavLinkButton
                key={`${link.path}-${i}`}
                link={link}
                onClick={() => onNavigate(link.path)}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

// ─── Typing Indicator ──────────────────────────────────────────────

function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5 }}>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 0,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
          bgcolor: '#1a1a2e',
          border: '1px solid #ffffff10',
          display: 'flex',
          gap: 0.5,
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: colors.lime,
              opacity: 0.4,
              animation: 'chatTyping 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
              '@keyframes chatTyping': {
                '0%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
                '50%': { opacity: 1, transform: 'scale(1)' },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

// ─── Quick Action Chips ────────────────────────────────────────────

const QUICK_ACTIONS = [
  'How do I add an athlete?',
  'Where are my reports?',
  'How to send emails?',
  'Help with lists',
  'Connect Gmail',
];

// ─── Main Component ────────────────────────────────────────────────

export function SupportChatBot() {
  const { session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history for the API (last 20 messages for context window)
      const history = [...messages, userMsg]
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await sendChatMessage(history);

      if (res.ok && res.message) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: res.message.content,
          timestamp: Date.now(),
          navigationLinks: res.navigationLinks,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: res.error || 'Sorry, I encountered an issue. Please try again.',
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'I\'m having trouble connecting right now. Please check your internet connection and try again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no session
  if (!session) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <Zoom in={!isOpen}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
          }}
        >
          <Tooltip title="Need help? Chat with our AI assistant" placement="left" arrow>
            <Fab
              size="medium"
              onClick={() => setIsOpen(true)}
              aria-label="Open support chat"
              sx={{
                bgcolor: colors.lime,
                color: colors.black,
                width: 52,
                height: 52,
                '&:hover': { bgcolor: '#B8E600' },
                boxShadow: `0 4px 20px ${colors.lime}40`,
                borderRadius: 0,
                clipPath:
                  'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              }}
            >
              <IoChatbubbleEllipsesOutline size={24} />
            </Fab>
          </Tooltip>
        </Box>
      </Zoom>

      {/* Chat Panel */}
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: 'calc(100vw - 48px)', sm: 400 },
            height: { xs: 'calc(100vh - 100px)', sm: 560 },
            maxHeight: '80vh',
            zIndex: 1400,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#0f0f1a',
            border: `1px solid ${colors.lime}20`,
            borderRadius: 0,
            clipPath:
              'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
            boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 20px ${colors.lime}08`,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${colors.lime}15`,
              background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
              flexShrink: 0,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Badge
                variant="dot"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: '#10B981',
                    boxShadow: '0 0 6px #10B981',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 0,
                    clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
                    bgcolor: `${colors.lime}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IoChatbubbleEllipsesOutline size={16} color={colors.lime} />
                </Box>
              </Badge>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: '#fff',
                    letterSpacing: '0.02em',
                  }}
                >
                  Support Assistant
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#ffffff50' }}>
                  Powered by GPT-4o
                </Typography>
              </Box>
            </Stack>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              sx={{ color: '#ffffff60', '&:hover': { color: '#fff' } }}
            >
              <IoCloseOutline size={20} />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            ref={scrollRef}
            sx={{
              flex: 1,
              overflow: 'auto',
              px: 2,
              py: 1.5,
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: '#ffffff15',
                borderRadius: 2,
              },
            }}
          >
            {/* Welcome message */}
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    mx: 'auto',
                    mb: 2,
                    borderRadius: 0,
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                    bgcolor: `${colors.lime}10`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IoChatbubbleEllipsesOutline size={24} color={colors.lime} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: '#fff',
                    mb: 0.5,
                  }}
                >
                  Hi{session?.firstName ? `, ${session.firstName}` : ''}! How can I help?
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#ffffff50', mb: 2.5 }}>
                  Ask me anything about using the platform
                </Typography>

                {/* Quick action chips */}
                <Stack spacing={0.75} alignItems="center">
                  {QUICK_ACTIONS.map((action) => (
                    <Chip
                      key={action}
                      label={action}
                      size="small"
                      onClick={() => handleSend(action)}
                      sx={{
                        bgcolor: '#1a1a2e',
                        color: '#ffffffaa',
                        fontSize: '0.72rem',
                        fontWeight: 500,
                        border: '1px solid #ffffff10',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: `${colors.lime}12`,
                          borderColor: `${colors.lime}30`,
                          color: colors.lime,
                        },
                        transition: 'all 0.15s ease',
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Message list */}
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onNavigate={handleNavigate}
              />
            ))}

            {/* Typing indicator */}
            {loading && <TypingIndicator />}
          </Box>

          {/* Input */}
          <Box
            sx={{
              px: 1.5,
              py: 1,
              borderTop: `1px solid ${colors.lime}10`,
              bgcolor: '#12121f',
              flexShrink: 0,
            }}
          >
            <Stack direction="row" spacing={0.5} alignItems="flex-end">
              <TextField
                inputRef={inputRef}
                fullWidth
                size="small"
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                multiline
                maxRows={3}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    fontSize: '0.82rem',
                    bgcolor: '#1a1a2e',
                    borderRadius: 0,
                    clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
                    '& fieldset': { borderColor: '#ffffff10' },
                    '&:hover fieldset': { borderColor: '#ffffff20' },
                    '&.Mui-focused fieldset': { borderColor: `${colors.lime}40` },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#ffffff30',
                    opacity: 1,
                  },
                }}
              />
              <IconButton
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                aria-label={loading ? 'Sending message' : 'Send message'}
                sx={{
                  bgcolor: input.trim() && !loading ? colors.lime : '#333',
                  color: input.trim() && !loading ? colors.black : '#666',
                  width: 36,
                  height: 36,
                  borderRadius: 0,
                  clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
                  '&:hover': {
                    bgcolor: input.trim() ? '#B8E600' : '#333',
                  },
                  flexShrink: 0,
                }}
              >
                {loading ? (
                  <CircularProgress size={16} sx={{ color: '#666' }} />
                ) : (
                  <IoSendOutline size={16} />
                )}
              </IconButton>
            </Stack>
          </Box>
        </Box>
      </Slide>
    </>
  );
}
