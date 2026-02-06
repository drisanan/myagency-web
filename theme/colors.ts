export const colors = {
  // Core 3-color palette
  black: '#0A0A0A',
  lime: '#CCFF00',
  white: '#FFFFFF',
  // Semantic mappings
  sidebarBg: '#0A0A0A',
  sidebarText: '#FFFFFF80',
  navActiveBg: '#CCFF00',
  navActiveText: '#0A0A0A',
  actionBg: '#CCFF00',
  actionText: '#0A0A0A',
  contentBg: '#F5F5F5',
  headerBg: '#0A0A0A',
  headerText: '#FFFFFF',
  error: '#FF3B3B',
  warning: '#FFB800',
};

// ── Nike-inspired gradient tokens ──
export const gradients = {
  /** Dark card / header gradient — diagonal energy */
  darkCard: 'linear-gradient(135deg, #0A0A0A 0%, #141414 50%, #0A0A0A 100%)',
  /** Lime accent button fill */
  limeButton: 'linear-gradient(135deg, #CCFF00 0%, #B8E600 60%, #A0CC00 100%)',
  /** Lime → transparent glow (radial, for hover/accent overlays) */
  limeGlow: 'radial-gradient(ellipse at 30% 50%, rgba(204,255,0,0.12) 0%, transparent 70%)',
  /** Main content pane — subtle warm-to-cool sweep keeps it alive */
  contentPane: 'linear-gradient(160deg, #F2F2F0 0%, #F5F5F5 45%, #EEF2E8 100%)',
  /** Header bar gradient — subtle depth */
  header: 'linear-gradient(90deg, #0A0A0A 0%, #111111 50%, #0A0A0A 100%)',
  /** Sidebar gradient — vertical depth */
  sidebar: 'linear-gradient(180deg, #0A0A0A 0%, #0F0F0F 60%, #0A0A0A 100%)',
  /** Diagonal speed-line overlay (CSS repeating-linear-gradient) */
  speedLines: 'repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(204,255,0,0.02) 40px, rgba(204,255,0,0.02) 41px)',
  /** Dotted grid texture — black dots on content background */
  dottedGrid: 'radial-gradient(circle, rgba(10,10,10,0.07) 1px, transparent 1px)',
  /** Login page dramatic background */
  loginBg: 'linear-gradient(160deg, #0A0A0A 0%, #0D0D0D 40%, #0A0A0A 70%), radial-gradient(ellipse at 70% 80%, rgba(204,255,0,0.06) 0%, transparent 60%)',
};

export type ColorKeys = keyof typeof colors;
