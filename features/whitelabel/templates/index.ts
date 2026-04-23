import type { ComponentType } from 'react';
import { AthleteClassicTemplate } from './AthleteClassicTemplate';
import { RecruiterBoldTemplate } from './RecruiterBoldTemplate';
import { MinimalDarkTemplate } from './MinimalDarkTemplate';
import type { LandingTemplateProps, TemplateId } from './types';

export { DEFAULT_TEMPLATE_ID } from './types';
export type { LandingTemplateProps, TemplateId } from './types';

export const LANDING_TEMPLATES: Record<TemplateId, ComponentType<LandingTemplateProps>> = {
  athleteClassic: AthleteClassicTemplate,
  recruiterBold: RecruiterBoldTemplate,
  minimalDark: MinimalDarkTemplate,
};

export const LANDING_TEMPLATE_METADATA: Array<{
  id: TemplateId;
  label: string;
  description: string;
  previewImageUrl?: string;
}> = [
  {
    id: 'athleteClassic',
    label: 'Athlete Classic',
    description: 'Bold lime accent on black; athlete-first recruiting storytelling.',
  },
  {
    id: 'recruiterBold',
    label: 'Recruiter Bold',
    description: 'Dark navy + orange CTA; agency-command-center aesthetic.',
  },
  {
    id: 'minimalDark',
    label: 'Minimal Dark',
    description: 'Quiet, typographic, single-column. Lets branding breathe.',
  },
];
