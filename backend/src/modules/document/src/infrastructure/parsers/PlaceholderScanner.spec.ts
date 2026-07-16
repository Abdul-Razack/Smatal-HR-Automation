import { PlaceholderScanner } from './PlaceholderScanner';

describe('PlaceholderScanner', () => {
  let scanner: PlaceholderScanner;

  beforeEach(() => {
    scanner = new PlaceholderScanner();
  });

  describe('scan()', () => {
    it('should detect simple placeholder keys', () => {
      const text = 'Dear {{candidate.firstName}}, your salary is {{salary}}.';
      const result = scanner.scan(text);

      expect(result.detected).toContain('candidate.firstName');
      expect(result.detected).toContain('salary');
      expect(result.detected).toHaveLength(2);
      expect(result.totalOccurrences).toBe(2);
    });

    it('should detect dot-notation keys', () => {
      const text = '{{employee.profile.department.name}}';
      const result = scanner.scan(text);
      expect(result.detected).toContain('employee.profile.department.name');
    });

    it('should detect duplicate placeholders', () => {
      const text = '{{name}} ... {{name}} ... {{name}}';
      const result = scanner.scan(text);

      expect(result.detected).toHaveLength(1);
      expect(result.duplicates).toContain('name');
      expect(result.totalOccurrences).toBe(3);
    });

    it('should return empty arrays for text without placeholders', () => {
      const result = scanner.scan('No placeholders here.');
      expect(result.detected).toHaveLength(0);
      expect(result.duplicates).toHaveLength(0);
      expect(result.totalOccurrences).toBe(0);
    });

    it('should NOT match invalid placeholder formats', () => {
      const text = '{singleBrace} {{spaces in key}} {{}}';
      const result = scanner.scan(text);
      expect(result.detected).toHaveLength(0);
    });

    it('should handle multiple unique placeholders correctly', () => {
      const text = `
        {{joiningDate}}
        {{department}}
        {{employee.salary}}
        {{customField}}
        {{candidate.name}}
      `;
      const result = scanner.scan(text);
      expect(result.detected).toHaveLength(5);
      expect(result.duplicates).toHaveLength(0);
    });

    it('should capture raw match strings', () => {
      const text = 'Hello {{name}}, you joined on {{joiningDate}}.';
      const result = scanner.scan(text);
      expect(result.rawMatches).toContain('{{name}}');
      expect(result.rawMatches).toContain('{{joiningDate}}');
    });
  });

  describe('hasPlaceholder()', () => {
    it('should return true for existing keys', () => {
      const result = scanner.scan('{{salary}}');
      expect(scanner.hasPlaceholder(result, 'salary')).toBe(true);
    });

    it('should return false for missing keys', () => {
      const result = scanner.scan('{{salary}}');
      expect(scanner.hasPlaceholder(result, 'name')).toBe(false);
    });
  });

  describe('getUniqueKeys()', () => {
    it('should return unique keys from scan result', () => {
      const result = scanner.scan('{{a}} {{b}} {{a}}');
      const keys = scanner.getUniqueKeys(result);
      expect(keys).toEqual(expect.arrayContaining(['a', 'b']));
      expect(keys).toHaveLength(2);
    });
  });
});
