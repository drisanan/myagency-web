/**
 * Canonical adapters for reading client/athlete profile data.
 *
 * The client record stores data in multiple overlapping locations (top-level
 * fields, radar.*, legacy flat radar fields). These helpers absorb the
 * inconsistencies so every rendering surface gets the same answer.
 */

// ---------------------------------------------------------------------------
// Profile image
// ---------------------------------------------------------------------------

export function getCanonicalProfileImage(client: any): string {
  const r = client?.radar;
  return (
    client?.photoUrl ||
    client?.profileImageUrl ||
    r?.profileImage ||
    r?.profileImageUrl ||
    r?.photoUrl ||
    ''
  );
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

export type CanonicalMetric = { title: string; value: string };

export function getCanonicalMetrics(client: any): CanonicalMetric[] {
  const r = client?.radar;
  if (!r) return [];

  if (Array.isArray(r.metrics) && r.metrics.length > 0) {
    return r.metrics.filter((m: any) => m?.title && m?.value);
  }

  const flat = [
    { title: r.athleteMetricsTitleOne, value: r.athleteMetricsValueOne },
    { title: r.athleteMetricsTitleTwo, value: r.athleteMetricsValueTwo },
    { title: r.athleteMetricsTitleThree, value: r.athleteMetricsValueThree },
    { title: r.athleteMetricsTitleFour, value: r.athleteMetricsValueFour },
  ].filter((m) => m.title && m.value);
  return flat;
}

// ---------------------------------------------------------------------------
// References
// ---------------------------------------------------------------------------

export type CanonicalReference = {
  name: string;
  email?: string;
  phone?: string;
  relationship?: string;
};

export function getCanonicalReferences(client: any): CanonicalReference[] {
  const r = client?.radar;
  if (!r) return [];

  if (Array.isArray(r.references) && r.references.length > 0) {
    return r.references
      .filter((ref: any) => ref?.name || ref?.firstName || ref?.lastName)
      .map((ref: any) => ({
        name: ref.name || [ref.firstName, ref.lastName].filter(Boolean).join(' '),
        email: ref.email || undefined,
        phone: ref.phone || undefined,
        relationship: ref.relationship || ref.title || undefined,
      }));
  }

  const flat: CanonicalReference[] = [];
  if (r.referenceOneName) {
    flat.push({
      name: r.referenceOneName,
      email: r.referenceOneEmail || undefined,
      phone: r.referenceOnePhone || undefined,
    });
  }
  if (r.referenceTwoName) {
    flat.push({
      name: r.referenceTwoName,
      email: r.referenceTwoEmail || undefined,
      phone: r.referenceTwoPhone || undefined,
    });
  }
  return flat;
}

// ---------------------------------------------------------------------------
// Head coach
// ---------------------------------------------------------------------------

export type CanonicalHeadCoach = {
  name: string;
  email?: string;
  phone?: string;
};

export function getCanonicalHeadCoach(client: any): CanonicalHeadCoach | null {
  const r = client?.radar;
  if (!r?.headCoachName) return null;
  return {
    name: r.headCoachName,
    email: r.headCoachEmail || undefined,
    phone: r.headCoachPhone || undefined,
  };
}
