import { useLanguage } from '../../hooks/useLanguage';
import { Link } from 'react-router-dom';
import './Privacy.css';

const privacyContent = {
  en: {
    lastUpdated: 'Last updated: February 12, 2026',
    intro: [
      'Viora is a web-based platform that uses artificial intelligence to generate messages to recruiters and cover letters based on job descriptions and information provided by the user.',
      'This Privacy Policy explains how information is handled when using the platform, in compliance with the Brazilian General Data Protection Law (Law No. 13.709/2018 – LGPD).',
    ],
    sections: [
      {
        title: '1. Data Controller',
        body: [
          'For the purposes of the LGPD, Viora acts as the Data Controller of any data that may be processed in connection with the provision of the service.',
          'Contact: contact@viora.app',
        ],
      },
      {
        title: '2. Data We Process',
        body: [
          'Viora:',
          'Does not require account creation or login;',
          'Does not collect or store personal data in its own database;',
          'Does not retain resumes, job descriptions, or user-submitted content after generating a response.',
        ],
      },
      {
        title: '2.1 Temporary Processing',
        body: [
          'Information entered by the user is processed on a temporary and transient basis, solely for the purpose of generating the requested content.',
          'Once the response is generated, the content is not stored by Viora.',
        ],
      },
      {
        title: '3. Legal Basis for Processing',
        body: [
          'If personal data is temporarily processed based on user input, the applicable legal basis under the LGPD is:',
          'Performance of a contract or preliminary contractual procedures (Article 7, V of the LGPD), as processing occurs exclusively to provide the requested service.',
          'If aggregated and anonymized data is used for statistical purposes, the applicable legal basis is:',
          'Legitimate interest (Article 7, IX of the LGPD), provided that fundamental rights and freedoms of the data subject are respected.',
        ],
      },
      {
        title: '4. Analytics and Cookies',
        body: [
          'Viora may use basic analytics tools to understand general usage patterns of the platform.',
          'Such data is collected in aggregated form, does not individually identify users, and is used exclusively to improve the service.',
          'Any cookies used are limited to ensuring proper technical functionality and collecting anonymous usage metrics.',
        ],
      },
      {
        title: '5. Third-Party Services',
        body: [
          'Viora may rely on third-party providers for artificial intelligence processing, hosting services, and technical infrastructure.',
          'These providers act as Data Processors, processing data strictly in accordance with Viora’s instructions and solely for the purpose of delivering the service.',
          'Viora does not sell, trade, or share personal data for advertising purposes.',
        ],
      },
      {
        title: '6. Information Security',
        body: [
          'Reasonable technical and organizational measures are implemented to protect the platform against unauthorized access, loss, alteration, or improper destruction.',
          'Since user-submitted content is not persistently stored, the risk of exposure of stored personal data is significantly reduced.',
        ],
      },
      {
        title: '7. Data Subject Rights',
        body: [
          'Under the LGPD, data subjects may request confirmation of the existence of data processing, access to their data, correction of incomplete, inaccurate, or outdated data, information regarding data sharing, and deletion of data processed based on consent, when applicable.',
          'Requests may be sent to: contact@viora.app',
        ],
      },
      {
        title: '8. User Responsibility',
        body: [
          'Users are solely responsible for the information they submit to the platform.',
          'All generated content should be carefully reviewed before being shared with third parties.',
          'Viora is not responsible for inaccurate, misleading, or inappropriate information provided by users or generated based on such information.',
        ],
      },
      {
        title: '9. Changes to This Policy',
        body: [
          'This Privacy Policy may be updated periodically to reflect legal, regulatory, or product changes.',
          'The most current version will always be available on this page, along with its effective date.',
        ],
      },
    ],
  },
  pt: {
    lastUpdated: 'Última atualização: 12 de fevereiro de 2026',
    intro: [
      'O Viora é uma plataforma web que utiliza inteligência artificial para gerar mensagens para recrutadores e cartas de apresentação com base nas descrições de vagas e nas informações fornecidas pelo usuário.',
      'Esta Política de Privacidade explica como os dados são tratados durante o uso da plataforma, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD).',
    ],
    sections: [
      {
        title: '1. Controlador dos Dados',
        body: [
          'Para fins da LGPD, o Viora atua como Controlador dos dados eventualmente processados no contexto da prestação do serviço.',
          'Contato: contact@viora.app',
        ],
      },
      {
        title: '2. Dados Tratados',
        body: [
          'O Viora:',
          'Não exige criação de conta ou login.',
          'Não coleta nem armazena dados pessoais em banco de dados próprio.',
          'Não mantém currículos, descrições de vagas ou conteúdos enviados após a geração da resposta.',
        ],
      },
      {
        title: '2.1 Processamento Temporário',
        body: [
          'As informações inseridas pelo usuário são processadas de forma temporária e transitória, exclusivamente para gerar o conteúdo solicitado.',
          'Após a geração da resposta, o conteúdo não é armazenado pelo Viora.',
        ],
      },
      {
        title: '3. Base Legal para Tratamento',
        body: [
          'Caso haja tratamento temporário de dados pessoais inseridos pelo usuário, a base legal aplicável é:',
          'Execução de contrato ou de procedimentos preliminares relacionados a contrato (art. 7º, V da LGPD), considerando que o processamento ocorre exclusivamente para viabilizar o serviço solicitado pelo usuário.',
          'Caso sejam utilizados dados agregados e anonimizados para fins estatísticos, aplica-se:',
          'Legítimo interesse (art. 7º, IX da LGPD), respeitados os direitos e liberdades fundamentais do titular.',
        ],
      },
      {
        title: '4. Analytics e Cookies',
        body: [
          'O Viora pode utilizar ferramentas de analytics para análise de uso da plataforma.',
          'Esses dados são coletados de forma agregada, não identificam individualmente os usuários e são utilizados exclusivamente para melhoria do serviço.',
          'Eventuais cookies utilizados destinam-se apenas ao funcionamento técnico da plataforma e à coleta de métricas anônimas.',
        ],
      },
      {
        title: '5. Compartilhamento com Terceiros',
        body: [
          'O Viora pode utilizar provedores terceiros para processamento de inteligência artificial, hospedagem e infraestrutura tecnológica.',
          'Esses provedores atuam como Operadores, processando dados apenas conforme instruções do Viora e exclusivamente para viabilizar a prestação do serviço.',
          'O Viora não vende, comercializa ou compartilha dados pessoais para fins publicitários.',
        ],
      },
      {
        title: '6. Segurança da Informação',
        body: [
          'São adotadas medidas técnicas e organizacionais razoáveis para proteger a plataforma contra acessos não autorizados, perda, alteração ou destruição indevida.',
          'Como não há armazenamento persistente de conteúdo enviado pelos usuários, o risco de exposição de dados armazenados é significativamente reduzido.',
        ],
      },
      {
        title: '7. Direitos do Titular',
        body: [
          'Nos termos da LGPD, o titular de dados pessoais pode solicitar confirmação da existência de tratamento, acesso aos dados, correção de dados incompletos, inexatos ou desatualizados, informações sobre compartilhamento e eliminação de dados tratados com base no consentimento, quando aplicável.',
          'Solicitações podem ser encaminhadas para: contact@viora.app',
        ],
      },
      {
        title: '8. Responsabilidade do Usuário',
        body: [
          'O usuário é responsável pelas informações inseridas na plataforma. Recomenda-se revisar cuidadosamente todo conteúdo gerado antes de enviá-lo a terceiros.',
          'O Viora não se responsabiliza por informações imprecisas, enganosas ou inadequadas fornecidas pelos usuários ou geradas com base nesses dados.',
        ],
      },
      {
        title: '9. Alterações nesta Política',
        body: [
          'Esta Política poderá ser atualizada para refletir alterações legais, regulatórias ou evoluções do produto.',
          'A versão mais recente estará sempre disponível nesta página, acompanhada da data de atualização.',
        ],
      },
    ],
  },
};

export function Privacy() {
  const { t, language } = useLanguage();
  const policy = language === 'pt' ? privacyContent.pt : privacyContent.en;

  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <Link
          to="/"
          className="privacy-back-link"
        >
          <svg className="privacy-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('backToHome')}
        </Link>

        <div className="privacy-header">
          <h1 className="privacy-title">
            {t('privacyTitle')}
          </h1>
          {policy.lastUpdated ? (
            <p className="privacy-updated">
              {policy.lastUpdated}
            </p>
          ) : null}
          {policy.intro.map((paragraph, index) => (
            <p key={index} className="privacy-intro-text">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="privacy-sections">
          {policy.sections.map(section => (
            <section key={section.title} className="privacy-section">
              <h2 className="privacy-section-title">
                {section.title}
              </h2>
              {section.body.map((paragraph, index) => (
                <p key={index} className="privacy-section-text">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
