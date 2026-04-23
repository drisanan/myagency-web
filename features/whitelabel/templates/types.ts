import type { AgencyLandingConfig, AgencySettings } from '../../../infra/src/lib/models';

export type TemplateId = 'athleteClassic' | 'recruiterBold' | 'minimalDark';

export type LandingTemplateProps = {
  agencyName: string;
  branding: AgencySettings;
  landing: AgencyLandingConfig;
  signInHref: string;
};

export const DEFAULT_TEMPLATE_ID: TemplateId = 'athleteClassic';
