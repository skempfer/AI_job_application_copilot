import type {
  AnalysisResult,
  AlignmentUIModel,
  SeniorityUIInfo,
  RequirementsUIModel,
  RequirementUIItem,
  DetectedDomainUIItem,
  SeniorityMatch,
  DomainExperience,
  ConfidenceLevel,
} from '../../types/analysis';

function mapSeniorityMatch(
  match: SeniorityMatch,
  detectedYears: number | null,
  expectedSeniority: string
): SeniorityUIInfo {
  const seniorityLabels: Record<SeniorityMatch, string> = {
    above: 'Seniority Above Expected',
    match: 'Seniority Match',
    below: 'Seniority Below Expected',
  };

  const seniorityPriorities: Record<SeniorityMatch, 'critical' | 'warning' | 'success'> = {
    above: 'success',
    match: 'success',
    below: 'warning',
  };

  const seniorityBadgeClasses: Record<SeniorityMatch, string> = {
    above: 'badge-success badge-lg',
    match: 'badge-success',
    below: 'badge-warning',
  };

  const seniorityExplanations: Record<SeniorityMatch, string> = {
    above: 'Your experience level exceeds the role requirements',
    match: 'Your experience level aligns with the role requirements',
    below: 'Your experience level is below the role requirements',
  };

  return {
    match,
    label: seniorityLabels[match],
    badgeClass: seniorityBadgeClasses[match],
    priority: seniorityPriorities[match],
    explanation: seniorityExplanations[match],
    detectedYears,
    expectedSeniority: expectedSeniority as any,
  };
}

function groupRequirements(
  _hardSkills: string[],
  _softSkills: string[],
  mandatoryMet: string[],
  mandatoryMissing: string[],
  desirableMet: string[],
  desirableMissing: string[]
): RequirementsUIModel {
  const mandatoryMetItems = mandatoryMet
    .filter((item) => item.trim().length > 0)
    .map(
      (text) =>
        ({
          text,
          category: 'mandatory',
          status: 'met',
        } as RequirementUIItem)
    );

  const mandatoryMissingItems = mandatoryMissing
    .filter((item) => item.trim().length > 0)
    .map(
      (text) =>
        ({
          text,
          category: 'mandatory',
          status: 'missing',
        } as RequirementUIItem)
    );

  const desirableMetItems = desirableMet
    .filter((item) => item.trim().length > 0)
    .map(
      (text) =>
        ({
          text,
          category: 'desirable',
          status: 'met',
        } as RequirementUIItem)
    );

  const desirableMissingItems = desirableMissing
    .filter((item) => item.trim().length > 0)
    .map(
      (text) =>
        ({
          text,
          category: 'desirable',
          status: 'missing',
        } as RequirementUIItem)
    );

  return {
    mandatory: {
      met: mandatoryMetItems,
      missing: mandatoryMissingItems,
    },
    desirable: {
      met: desirableMetItems,
      missing: desirableMissingItems,
    },
  };
}

function mapDetectedDomains(domainExperience: DomainExperience | null): DetectedDomainUIItem[] {
  if (!domainExperience) {
    return [];
  }

  const domainLabels: Record<keyof DomainExperience, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    fullstack: 'Fullstack',
    qa: 'QA/Testing',
    devops: 'DevOps',
    product: 'Product',
  };

  const domainBadgeClasses: Record<keyof DomainExperience, string> = {
    frontend: 'badge-blue',
    backend: 'badge-purple',
    fullstack: 'badge-indigo',
    qa: 'badge-green',
    devops: 'badge-orange',
    product: 'badge-pink',
  };

  const detected: DetectedDomainUIItem[] = [];

  (Object.keys(domainExperience) as Array<keyof DomainExperience>).forEach((domain) => {
    if (domainExperience[domain] === true) {
      detected.push({
        domain,
        label: domainLabels[domain],
        badgeClass: domainBadgeClasses[domain],
      });
    }
  });

  return detected;
}

function normalizeRedFlags(flags: string[]): string[] {
  return (flags || [])
    .filter((flag) => typeof flag === 'string' && flag.trim().length > 0)
    .map((flag) => flag.trim())
    .slice(0, 10);
}

function getValidatedHardSkills(signals: any, response: any): string[] {
  const hardSkills = Array.isArray(signals?.hardSkillsDetected)
    ? signals.hardSkillsDetected
    : [];

  const validated = hardSkills
    .filter((skill: any): skill is string => typeof skill === 'string' && skill.trim().length > 0)
    .map((skill: string) => skill.trim());

  if (process.env.NODE_ENV === 'development' && response?.strengths?.length > 0 && validated.length === 0) {
    console.warn(
      '[alignmentMapper] Development Warning: response.strengths exists but was NOT used because aiSignals.hardSkillsDetected is empty. Skills can ONLY come from hardSkillsDetected.',
      { strengths: response.strengths }
    );
  }

  if (process.env.NODE_ENV === 'development') {
    const suspiciousSkills = validated.filter((skill: string) => skill.toLowerCase().includes('react native'));
    if (suspiciousSkills.length > 0) {
      console.warn(
        '[alignmentMapper] Development Warning: Suspicious skills detected in hardSkillsDetected. Ensure these were explicitly detected by AI:',
        suspiciousSkills
      );
    }
  }

  return validated;
}

function getValidatedSoftSkills(signals: any): string[] {
  const softSkills = Array.isArray(signals?.softSkillsEvidence)
    ? signals.softSkillsEvidence
    : [];

  return softSkills
    .filter((skill: any): skill is string => typeof skill === 'string' && skill.trim().length > 0)
    .map((skill: string) => skill.trim());
}

export function mapAlignmentResponseToUIModel(response: AnalysisResult): AlignmentUIModel {
  console.log('[alignmentMapper] Starting mapping with response:', {
    hasAiSignals: Boolean(response.aiSignals),
    hasPreprocessedCV: Boolean(response.preprocessedCV),
    aiSignalsKeys: response.aiSignals ? Object.keys(response.aiSignals) : [],
  });

  const preprocessedCV = response.preprocessedCV;
  const yearsExperience = preprocessedCV?.yearsExperience ?? null;
  const yearsConfidence: ConfidenceLevel = preprocessedCV?.yearsExperienceConfidence ?? 'low';
  const domainExperience = preprocessedCV?.domainExperience ?? null;
  const expectedSeniority = preprocessedCV?.seniority ?? 'unknown';

  console.log('[alignmentMapper] Preprocessed CV:', {
    yearsExperience,
    yearsConfidence,
    domainExperience,
    expectedSeniority,
  });

  const signals = response.aiSignals;
  console.log('[alignmentMapper] Signals:', signals);
  
  const seniorityMatch = signals?.seniorityMatch ?? (response.explanation?.summary ? 'match' : 'below');
  const seniority = mapSeniorityMatch(seniorityMatch as any, yearsExperience, expectedSeniority);

  const requirements = groupRequirements(
    signals?.hardSkillsDetected || [],
    signals?.softSkillsEvidence || [],
    signals?.mandatoryRequirementsMet || [],
    signals?.mandatoryRequirementsMissing || [],
    signals?.desirableRequirementsMet || [],
    signals?.desirableRequirementsMissing || []
  );

  console.log('[alignmentMapper] Grouped requirements:', {
    mandatoryMet: requirements.mandatory.met.length,
    mandatoryMissing: requirements.mandatory.missing.length,
    desirableMet: requirements.desirable.met.length,
    desirableMissing: requirements.desirable.missing.length,
  });

  const detectedDomains = mapDetectedDomains(domainExperience);

  const redFlags = normalizeRedFlags(signals?.redFlags || []);

  const hasAnyMissingMandatory =
    (requirements.mandatory.missing?.length ?? 0) > 0;
  const hasRedFlags = redFlags.length > 0;
  const hasDetectedDomains = detectedDomains.length > 0;

  const hardSkills = getValidatedHardSkills(signals, response);
  const softSkills = getValidatedSoftSkills(signals);

  console.log('[alignmentMapper] Final skills and domains:', {
    hardSkillsCount: hardSkills.length,
    softSkillsCount: softSkills.length,
    detectedDomainsCount: detectedDomains.length,
    redFlagsCount: redFlags.length,
  });

  return {
    fitScore: response.fitScore,
    decision: response.decision,
    detectedLanguage: response.detectedLanguage ?? 'en',

    seniority,

    requirements,

    hardSkills,
    softSkills,

    detectedDomains,

    redFlags,

    recruiterMessage: response.recruiterMessage || '',
    coverLetter: response.coverLetter || '',

    yearsExperience,
    yearsConfidence,
    cvSuggestions: response.cvSuggestions || [],

    hasAnyMissingMandatory,
    hasRedFlags,
    hasDetectedDomains,
  };
}

export function mapWithDefaults(
  response: Partial<AnalysisResult>
): AlignmentUIModel {
  const defaultResponse: AnalysisResult = {
    fitScore: 0,
    decision: 'skip',
    strengths: [],
    gaps: [],
    cvSuggestions: [],
    recruiterMessage: '',
    coverLetter: '',
    detectedLanguage: 'en',
  };

  return mapAlignmentResponseToUIModel({
    ...defaultResponse,
    ...response,
  });
}

export const __testing__ = {
  getValidatedHardSkills,
  getValidatedSoftSkills,
};
