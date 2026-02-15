export const pt = {
  errors: {
    // Validation errors
    cvRequired: 'CV ou arquivo PDF é obrigatório',
    cvTooShort: 'CV muito curto. Forneça mais detalhes.',
    jobDescriptionRequired: 'Descrição da vaga é obrigatória',
    jobDescriptionTooShort: 'Descrição da vaga muito curta. Cole a descrição completa.',
    
    // PDF/File errors
    invalidResumePath: 'Caminho do currículo inválido',
    invalidFileType: 'Tipo de arquivo inválido',
    fileNotFound: 'Arquivo não encontrado: {{filename}}',
    pdfExtractionFailed: 'Falha ao extrair CV do PDF. Tente enviar o CV como texto.',
    cvEmptyAfterExtraction: 'CV vazio após extração do PDF',
    
    // AI errors
    aiEmptyResponse: 'IA retornou uma resposta vazia',
    aiParsingFailed: 'Falha ao processar resposta da IA: {{details}}',
    aiInvalidResponse: 'Resposta da IA inválida. Campos faltando: {{fields}}',
    aiInvalidArrayField: '{{field}} deve ser um array',
    aiInvalidSeniority: 'seniorityMatch deve ser "below", "match" ou "above"',
    aiInvalidRecruiterMessage: 'recruiterMessage deve ser uma string não vazia',
    aiInvalidCoverLetter: 'coverLetter deve ser uma string não vazia',
    
    // Generic errors
    endpointNotFound: 'Endpoint não encontrado',
    internalServerError: 'Erro interno do servidor. Tente novamente mais tarde.',
    unknownError: 'Ocorreu um erro inesperado',
    
    // Gap analysis
    resumeOrCvRequired: 'Caminho do currículo ou CV é obrigatório para análise técnica',
    
    // Database errors (non-critical, for logging)
    databaseSaveError: 'Erro ao salvar no banco de dados (não crítico)',
    databaseFetchError: 'Erro ao buscar do banco de dados',
  }
};
