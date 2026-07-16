import { Injectable } from '@nestjs/common';
import { PlaceholderScanResult } from './IDocumentParser';

// Delimiter configuration — supports {{key}} syntax
const PLACEHOLDER_REGEX = /\{\{([a-zA-Z0-9._-]+)\}\}/g;

/**
 * PlaceholderScanner — analyses raw XML (or any text) for placeholder tokens.
 *
 * Supports:
 *   {{candidate.name}}
 *   {{employee.salary}}
 *   {{joiningDate}}
 *   {{department}}
 *   {{customField}}
 *
 * Returns:
 *   - detected:           Unique, ordered placeholder keys
 *   - duplicates:         Keys that appear more than once
 *   - rawMatches:         Full token strings (e.g. "{{candidate.name}}")
 *   - totalOccurrences:   Total number of tokens found (not de-duplicated)
 */
@Injectable()
export class PlaceholderScanner {
  /**
   * Scan raw text (typically the XML content of a DOCX document) for
   * placeholder tokens.
   */
  scan(text: string): PlaceholderScanResult {
    const rawMatches: string[] = [];
    const keyOccurrences = new Map<string, number>();
    const locations: { key: string; approximateIndex: number }[] = [];
    const invalid: string[] = [];

    // Valid placeholders like {{candidate.name}}
    let match: RegExpExecArray | null;
    const regex = new RegExp(PLACEHOLDER_REGEX.source, PLACEHOLDER_REGEX.flags);

    while ((match = regex.exec(text)) !== null) {
      const fullMatch = match[0];
      const key = match[1].trim();

      rawMatches.push(fullMatch);
      keyOccurrences.set(key, (keyOccurrences.get(key) ?? 0) + 1);
      locations.push({ key, approximateIndex: match.index });
    }

    // Invalid placeholders (looks like {{...}} but has spaces or invalid chars inside)
    // Avoid greedy matching by using {{[^}]+}} and checking if it wasn't caught by the main regex
    const allCurlyBracesRegex = /\{\{([^}]+)\}\}/g;
    let anyMatch: RegExpExecArray | null;
    while ((anyMatch = allCurlyBracesRegex.exec(text)) !== null) {
      const innerContent = anyMatch[1];
      if (!/^[a-zA-Z0-9._-]+$/.test(innerContent.trim())) {
        invalid.push(anyMatch[0]);
      }
    }

    const detected = Array.from(keyOccurrences.keys());
    const duplicates = detected.filter(
      (key) => (keyOccurrences.get(key) ?? 0) > 1,
    );

    return {
      detected,
      duplicates,
      rawMatches,
      invalid,
      unknown: [], // To be populated during Mapping phase
      locations,
      totalOccurrences: rawMatches.length,
    };
  }

  /**
   * Extract unique keys from the raw token list for persistence in
   * TemplatePlaceholder records.
   */
  getUniqueKeys(result: PlaceholderScanResult): string[] {
    return result.detected;
  }

  /**
   * Check whether a specific key exists in the document.
   */
  hasPlaceholder(result: PlaceholderScanResult, key: string): boolean {
    return result.detected.includes(key);
  }
}
