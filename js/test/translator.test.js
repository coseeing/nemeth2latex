import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { translate } from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR = path.join(__dirname, '..', '..');

function loadTestCases(filename) {
  const content = fs.readFileSync(path.join(BASE_DIR, filename), 'utf-8');
  const lines = content.trim().split('\n');
  const cases = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Parse: id,input-braille,expected-latex
    const firstComma = line.indexOf(',');
    const secondComma = line.indexOf(',', firstComma + 1);
    const id = line.slice(0, firstComma);
    const inputBraille = line.slice(firstComma + 1, secondComma);
    const expectedLatex = line.slice(secondComma + 1);
    if (inputBraille) {
      cases.push({ id, input: inputBraille, expected: expectedLatex });
    }
  }
  return cases;
}

describe('nemeth2latex translator', () => {
  describe('testcase.csv', () => {
    const cases = loadTestCases('testcase.csv');

    it.each(cases)('test #$id: $expected', ({ id, input, expected }) => {
      const result = translate(input);
      expect(result).toBe(expected);
    });
  });

  describe('testcase2.csv', () => {
    const cases = loadTestCases('testcase2.csv');

    it.each(cases)('test #$id: $expected', ({ id, input, expected }) => {
      const result = translate(input);
      expect(result).toBe(expected);
    });
  });

  describe('specific cases', () => {
    it('simple power: a^2', () => {
      expect(translate('⠁⠘⠆')).toBe('a^2');
    });

    it('fraction with power: (2-1)/(3^2)', () => {
      expect(translate('⠹⠆⠤⠂⠌⠒⠘⠆⠼')).toBe('\\frac{2-1}{3^2}');
    });

    it('square root of x^2', () => {
      expect(translate('⠜⠭⠘⠆⠐⠻')).toBe('\\sqrt{x^2}');
    });

    it('cube root of x', () => {
      expect(translate('⠣⠒⠜⠭⠻')).toBe('\\sqrt[3]{x}');
    });

    it('uppercase continuation: ABC', () => {
      expect(translate('⠠⠠⠁⠃⠉')).toBe('ABC');
    });

    it('overline AB', () => {
      expect(translate('⠐⠠⠁⠠⠃⠣⠱⠻')).toBe('\\overline{AB}');
    });

    it('mixed number: 14 and 3/11', () => {
      expect(translate('⠼⠂⠲⠸⠹⠒⠌⠂⠂⠸⠼')).toBe('14\\frac{3}{11}');
    });

    it('integral from x to y', () => {
      expect(translate('⠮⠰⠭⠘⠽⠐')).toBe('\\int_{x}^{y}');
    });

    it('binomial coefficient C(5,2)', () => {
      expect(translate('⠷⠠⠉⠰⠆⠐⠘⠢⠐⠾')).toBe('\\binom{5}{2}');
    });

    it('limit as i approaches 0', () => {
      expect(translate('⠐⠇⠊⠍⠩⠊⠀⠫⠕⠀⠴⠻')).toBe('\\lim_{{i} \\to {0}}');
    });

    it('nested fraction', () => {
      expect(translate('⠹⠂⠬⠹⠆⠬⠹⠒⠌⠲⠼⠌⠢⠼⠌⠖⠬⠹⠶⠌⠦⠼⠼')).toBe(
        '\\frac{1+\\frac{2+\\frac{3}{4}}{5}}{6+\\frac{7}{8}}'
      );
    });
  });
});
