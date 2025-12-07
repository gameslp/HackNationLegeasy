import { Request, Response, NextFunction } from 'express';

/**
 * Content moderation middleware for protecting minors and filtering personal data.
 * Compliant with Polish regulations on minor protection and RODO.
 */

// Patterns that may indicate personal data
const PERSONAL_DATA_PATTERNS = [
  // Polish phone numbers
  /(?:\+48|48)?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}/g,
  // Email addresses
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  // Polish PESEL (11 digits)
  /\b\d{11}\b/g,
  // Polish postal codes
  /\b\d{2}-\d{3}\b/g,
  // Credit card patterns (simplified)
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  // Polish ID card numbers
  /\b[A-Z]{3}\s?\d{6}\b/gi,
];

// Warning keywords that might indicate sharing of sensitive info
const SENSITIVE_KEYWORDS = [
  'mój adres',
  'moje imię',
  'moje nazwisko',
  'mieszkam',
  'mój telefon',
  'zadzwoń do mnie',
  'napisz do mnie',
  'mój email',
  'mój e-mail',
  'mój numer',
];

interface ModerationResult {
  isClean: boolean;
  warnings: string[];
  containsPersonalData: boolean;
  filteredContent?: string;
}

/**
 * Checks content for potential personal data patterns
 */
export function moderateContent(content: string): ModerationResult {
  const warnings: string[] = [];
  let containsPersonalData = false;
  let filteredContent = content;

  // Check for personal data patterns
  for (const pattern of PERSONAL_DATA_PATTERNS) {
    if (pattern.test(content)) {
      containsPersonalData = true;
      warnings.push('Wykryto potencjalne dane osobowe (np. numer telefonu, email, PESEL)');
      // Reset regex lastIndex
      pattern.lastIndex = 0;
      break;
    }
  }

  // Check for sensitive keywords
  const lowerContent = content.toLowerCase();
  for (const keyword of SENSITIVE_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      warnings.push(`Wykryto potencjalnie wrażliwe informacje: "${keyword}"`);
    }
  }

  return {
    isClean: !containsPersonalData && warnings.length === 0,
    warnings,
    containsPersonalData,
    filteredContent,
  };
}

/**
 * Middleware to validate discussion content
 */
export const validateDiscussionContent = (req: Request, res: Response, next: NextFunction) => {
  const { content, nickname } = req.body;

  if (!content || !nickname) {
    return next();
  }

  // Check nickname for personal data
  const nicknameCheck = moderateContent(nickname);
  if (nicknameCheck.containsPersonalData) {
    return res.status(400).json({
      data: null,
      error: {
        message: 'Nick nie może zawierać danych osobowych (np. email, numer telefonu). Użyj pseudonimu.',
        code: 'PERSONAL_DATA_IN_NICKNAME',
      },
    });
  }

  // Check content for personal data
  const contentCheck = moderateContent(content);
  if (contentCheck.containsPersonalData) {
    return res.status(400).json({
      data: null,
      error: {
        message: 'Treść komentarza zawiera dane osobowe. Ze względów bezpieczeństwa nie możemy opublikować tego komentarza. Prosimy o usunięcie numerów telefonu, adresów email, numerów PESEL i innych danych osobowych.',
        code: 'PERSONAL_DATA_IN_CONTENT',
        warnings: contentCheck.warnings,
      },
    });
  }

  // If there are warnings but no blocking issues, add them to request for logging
  if (contentCheck.warnings.length > 0) {
    (req as Request & { moderationWarnings?: string[] }).moderationWarnings = contentCheck.warnings;
  }

  next();
};

/**
 * Log moderation events for audit purposes
 */
export function logModerationEvent(
  type: 'blocked' | 'warning' | 'clean',
  details: {
    content?: string;
    warnings?: string[];
    ip?: string;
  }
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type,
    ...details,
    // Truncate content for privacy
    content: details.content ? details.content.substring(0, 100) + '...' : undefined,
  };

  // In production, this would go to a secure audit log
  if (type === 'blocked') {
    console.warn('[MODERATION] Blocked content:', logEntry);
  }
}
