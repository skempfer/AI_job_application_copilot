export const en = {
  errors: {
    // Validation errors
    cvRequired: 'CV or PDF file is required',
    cvTooShort: 'CV too short. Provide more details.',
    jobDescriptionRequired: 'Job description is required',
    jobDescriptionTooShort: 'Job description too short. Paste the full job description.',
    
    // PDF/File errors
    invalidResumePath: 'Invalid resume path',
    invalidFileType: 'Invalid resume file type',
    fileNotFound: 'File not found: {{filename}}',
    pdfExtractionFailed: 'Failed to extract CV from PDF. Try sending the CV as text.',
    cvEmptyAfterExtraction: 'CV is empty after PDF extraction',
    
    // AI errors
    aiEmptyResponse: 'AI returned an empty response',
    aiParsingFailed: 'Failed to parse AI response: {{details}}',
    aiInvalidResponse: 'Invalid AI response. Missing fields: {{fields}}',
    aiInvalidArrayField: '{{field}} must be an array',
    aiInvalidSeniority: 'seniorityMatch must be "below", "match", or "above"',
    aiInvalidRecruiterMessage: 'recruiterMessage must be a non-empty string',
    aiInvalidCoverLetter: 'coverLetter must be a non-empty string',
    
    // Generic errors
    endpointNotFound: 'Endpoint not found',
    internalServerError: 'Internal server error. Please try again later.',
    unknownError: 'An unexpected error occurred',
    
    // Gap analysis
    resumeOrCvRequired: 'Resume path or CV is required for technical analysis',
    
    // Database errors (non-critical, for logging)
    databaseSaveError: 'Error saving to database (non-critical)',
    databaseFetchError: 'Error fetching from database',
  }
};

export type ErrorMessages = typeof en.errors;
