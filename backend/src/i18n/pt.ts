export const pt = {
  errors: {
    // Input validation errors
    cvRequired: 'Por favor, insira seu CV',
    cvTooShort: 'CV muito curto. Forneça pelo menos 100 caracteres com informações sobre experiência, skills e educação.',
    jobDescriptionRequired: 'Por favor, insira a descrição da vaga',
    jobDescriptionTooShort: 'Descrição da vaga muito curta. Cole a descrição completa com requisitos, responsabilidades e experiência esperada.',
    
    // PDF/File errors
    invalidResumePath: 'Caminho do currículo inválido',
    invalidFileType: 'Tipo de arquivo inválido',
    fileNotFound: 'Arquivo não encontrado: {{filename}}',
    pdfExtractionFailed: 'Falha ao extrair CV do PDF. Tente enviar o CV como texto.',
    cvEmptyAfterExtraction: 'CV vazio após extração do PDF',
    
    // AI errors - General
    aiEmptyResponse: 'A IA retornou uma resposta vazia. Tente novamente com um CV e descrição mais descritivos.',
    aiParsingFailed: 'Falha ao processar a resposta da IA. Tente novamente.',
    aiInvalidResponse: 'A resposta da IA não está no formato esperado. Tente novamente.',
    aiResponseIncomplete: 'A resposta da IA está incompleta. Tente novamente.',
    
    // AI errors - Specific field validation
    aiFieldMissing: 'Erro na análise: campo {{field}} não pode ser vazio.',
    aiInvalidArrayField: 'Falha na validação de {{field}}. Tente novamente com mais contexto.',
    aiInvalidFormat: 'A IA retornou um formato inválido. Tente novamente.',
    aiSeniorityInvalid: 'Falha ao determinar nível de senioridade. Tente novamente com mais informações sobre sua experiência.',
    aiMessageRequired: 'A IA não conseguiu gerar uma mensagem. Tente novamente ou forneça mais detalhes.',
    aiCoverLetterRequired: 'A IA não conseguiu gerar uma carta de apresentação. Tente novamente.',
    aiInvalidData: 'Dados inválidos na resposta da IA. Não conseguimos processar. Tente novamente com um CV melhor formatado.',
    
    // Generic errors
    endpointNotFound: 'Endpoint não encontrado',
    internalServerError: 'Erro interno do servidor. Tente novamente mais tarde.',
    unknownError: 'Ocorreu um erro inesperado',
    
    // Gap analysis
    resumeOrCvRequired: 'Caminho do currículo ou CV é obrigatório para análise técnica',
    
    // Database errors (non-critical, for logging)
    databaseSaveError: 'Erro ao salvar no banco de dados (não crítico)',
    databaseFetchError: 'Erro ao buscar do banco de dados',
    
    // Rate limit errors
    dailyLimitExceeded: 'Você atingiu seu limite de análises gratuitas diárias. Seu limite será reiniciado em {{hours}}h {{minutes}}m.',
  }
};
