import { extractTextFromPDF, parseCVToStructuredData, CVParserError, setAIClient } from './cvParserService';
import fs from 'fs/promises';
import pdf from 'pdf-parse';
import OpenAI from 'openai';

jest.mock('fs/promises');
jest.mock('pdf-parse');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPdf = pdf as jest.MockedFunction<typeof pdf>;

describe('CVParserService', () => {
  beforeAll(() => {
    const mockAIClient = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    } as unknown as OpenAI;
    setAIClient(mockAIClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('extractTextFromPDF', () => {
    it('should extract text from valid PDF', async () => {
      const mockBuffer = Buffer.from('test-pdf-content');
      const mockPdfResult = {
        text: 'Extracted CV text content',
        numpages: 1,
        numrender: 1,
        info: {} as any,
        metadata: null,
        version: '1.0',
      };

      mockFs.readFile.mockResolvedValue(mockBuffer);
      mockPdf.mockResolvedValue(mockPdfResult);

      const result = await extractTextFromPDF('/path/to/cv.pdf');

      expect(result).toBe('Extracted CV text content');
      expect(mockFs.readFile).toHaveBeenCalledWith('/path/to/cv.pdf');
      expect(mockPdf).toHaveBeenCalledWith(mockBuffer);
    });

    it('should throw CVParserError if PDF has no text', async () => {
      const mockBuffer = Buffer.from('test-pdf-content');
      const mockPdfResult = {
        text: '   ',
        numpages: 1,
        numrender: 1,
        info: {} as any,
        metadata: null,
        version: '1.0',
      };

      mockFs.readFile.mockResolvedValue(mockBuffer);
      mockPdf.mockResolvedValue(mockPdfResult);

      await expect(extractTextFromPDF('/path/to/empty.pdf')).rejects.toThrow(CVParserError);
      await expect(extractTextFromPDF('/path/to/empty.pdf')).rejects.toMatchObject({
        code: 'PDF_EMPTY_TEXT',
      });
    });

    it('should throw CVParserError on file read failure', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(extractTextFromPDF('/nonexistent.pdf')).rejects.toThrow(CVParserError);
      await expect(extractTextFromPDF('/nonexistent.pdf')).rejects.toMatchObject({
        code: 'PDF_PARSE_FAILED',
      });
    });
  });

  describe('parseCVToStructuredData', () => {
    it('should throw CVParserError on empty CV text', async () => {
      await expect(parseCVToStructuredData('')).rejects.toThrow(CVParserError);
      await expect(parseCVToStructuredData('')).rejects.toMatchObject({
        code: 'CV_EMPTY_TEXT',
      });
    });
  });
});
