// Input sanitization for security
// Prevents prompt injection, XSS, and other injection attacks

export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove control characters and null bytes
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Limit length to prevent abuse
  const MAX_LENGTH = 10000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }
  
  return sanitized.trim();
}

export function sanitizePromptInput(input: string): string {
  // Additional sanitization for AI prompts to prevent injection
  let sanitized = sanitizeUserInput(input);
  
  // Remove potential prompt injection patterns
  const injectionPatterns = [
    /ignore\s+previous\s+instructions/gi,
    /disregard\s+all\s+prior/gi,
    /forget\s+everything/gi,
    /new\s+instructions:/gi,
    /system\s+prompt:/gi,
  ];
  
  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, '[filtered]');
  }
  
  return sanitized;
}

export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') return '';
  
  // Remove script tags and their content
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove event handlers
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  clean = clean.replace(/javascript:/gi, '');
  
  return clean;
}

export function validateStorageSize(data: any): boolean {
  try {
    const serialized = JSON.stringify(data);
    const sizeInBytes = new Blob([serialized]).size;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    // localStorage typically has 5-10MB limit
    // Warn if approaching 4MB
    if (sizeInMB > 4) {
      console.warn(`Storage size approaching limit: ${sizeInMB.toFixed(2)}MB`);
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
}
