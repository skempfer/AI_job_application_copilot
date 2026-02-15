export const en = {
  errors: {
    // Validation errors
    cvRequired: 'Please enter your CV',
    cvTooShort: 'CV too short. Provide at least 100 characters with information about experience, skills, and education.',
    jobDescriptionRequired: 'Please enter the job description',
    jobDescriptionTooShort: 'Job description too short. Paste the complete description with requirements, responsibilities, and expected experience.',
    
    // PDF/File errors
    invalidResumePath: 'Invalid resume path',
    invalidFileType: 'Invalid resume file type',
    fileNotFound: 'File not found: {{filename}}',
    pdfExtractionFailed: 'Failed to extract CV from PDF. Try sending the CV as text.',
    cvEmptyAfterExtraction: 'CV is empty after PDF extraction',
    
    // AI errors - General
    aiEmptyResponse: 'AI returned an empty response. Try again with a more descriptive CV and job description.',
    aiParsingFailed: 'Failed to process AI response. Please try again.',
    aiInvalidResponse: 'AI response is not in the expected format. Please try again.',
    aiResponseIncomplete: 'AI response is incomplete. Try again.',
    
    // AI errors - Specific field validation
    aiFieldMissing: 'Analysis error: {{field}} field cannot be empty.',
    aiInvalidArrayField: 'Validation error in {{field}}. Try again with more context.',
    aiInvalidFormat: 'AI returned an invalid format. Try again.',
    aiSeniorityInvalid: 'Failed to determine seniority level. Try again with more details about your experience.',
    aiMessageRequired: 'AI could not generate a message. Try again or provide more details.',
    aiCoverLetterRequired: 'AI could not generate a cover letter. Try again.',
    aiInvalidData: 'Invalid data in AI response. Unable to process. Try again with a better formatted CV.',
    
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
