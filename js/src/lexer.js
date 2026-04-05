import { Trie } from './trie.js';

/**
 * Creates a scanner for Nemeth braille strings.
 * Unlike a traditional tokenizer, this scanner is driven by the parser -
 * the parser calls specific match functions based on grammar context.
 */
export function createScanner(symbolData, letterData, numberData) {
  const symbolTrie = new Trie();
  for (const [key, value] of Object.entries(symbolData)) {
    symbolTrie.insert(key, value);
  }

  const letterBrailleSet = new Set(Object.keys(letterData));
  const numberBrailleSet = new Set(Object.keys(numberData));

  // Operand patterns: 2-char patterns before 1-char (longest-first, hardcoded)
  const operandPatterns = ['⠈⠡', '⠨⠌', '⠨⠅', '⠨⠂', '⠐⠅', '⠬', '⠤', '⠡'];

  // BPUO patterns
  const bpuoPatterns = ['⠨⠠⠎', '⠮'];

  function isLetterBraille(ch) {
    return letterBrailleSet.has(ch);
  }

  function isNumberBraille(ch) {
    return numberBrailleSet.has(ch);
  }

  /**
   * Try to match an OPERAND (one or more operand patterns).
   * Returns the matched string or null.
   */
  function matchOperand(str, pos) {
    let totalLen = 0;
    let currentPos = pos;
    let matched = false;

    while (currentPos < str.length) {
      let found = false;
      for (const pat of operandPatterns) {
        if (str.startsWith(pat, currentPos)) {
          totalLen += pat.length;
          currentPos += pat.length;
          found = true;
          matched = true;
          break;
        }
      }
      if (!found) break;
    }

    return matched ? str.slice(pos, pos + totalLen) : null;
  }

  /**
   * Try to match a BPUO (big prefix unary operator).
   * Returns the matched string or null.
   */
  function matchBPUO(str, pos) {
    for (const pat of bpuoPatterns) {
      if (str.startsWith(pat, pos)) {
        return pat;
      }
    }
    return null;
  }

  /**
   * Try to match EN_UPPERCASE_CONTINUE: ⠠⠠ + letters + optional(⠠⠄ + letters)
   * Returns the matched string or null.
   */
  function matchEnUppercaseContinue(str, pos) {
    if (!str.startsWith('⠠⠠', pos)) return null;

    let i = pos + 2;
    let hasLetter = false;

    while (i < str.length && isLetterBraille(str[i])) {
      hasLetter = true;
      i++;
    }
    if (!hasLetter) return null;

    // Optional ⠠⠄ + letters
    if (str.startsWith('⠠⠄', i)) {
      const j = i + 2;
      if (j < str.length && isLetterBraille(str[j])) {
        let k = j;
        while (k < str.length && isLetterBraille(str[k])) {
          k++;
        }
        i = k;
      }
    }

    return str.slice(pos, i);
  }

  /**
   * Try to match EN_UPPERCASE: ⠠ + letter
   * Returns the matched string or null.
   */
  function matchEnUppercase(str, pos) {
    if (str[pos] !== '⠠') return null;
    if (pos + 1 < str.length && isLetterBraille(str[pos + 1])) {
      return str.slice(pos, pos + 2);
    }
    return null;
  }

  /**
   * Try to match EN_LOWERCASE: single letter braille char
   * Returns the matched string or null.
   */
  function matchEnLowercase(str, pos) {
    if (pos < str.length && isLetterBraille(str[pos])) {
      return str[pos];
    }
    return null;
  }

  /**
   * Try to match NUMBER: ⠼? + number-braille-chars+
   * Returns the matched string or null.
   */
  function matchNumber(str, pos) {
    let i = pos;
    const hasIndicator = i < str.length && str[i] === '⠼';
    if (hasIndicator) i++;
    let hasDigit = false;
    while (i < str.length && isNumberBraille(str[i])) {
      hasDigit = true;
      i++;
    }
    if (!hasDigit) return null;
    // Include decimal part only for non-indicator numbers (bare digits)
    if (
      !hasIndicator &&
      i < str.length &&
      str[i] === '⠨' &&
      i + 1 < str.length &&
      isNumberBraille(str[i + 1])
    ) {
      i++; // skip ⠨
      while (i < str.length && isNumberBraille(str[i])) {
        i++;
      }
    }
    return str.slice(pos, i);
  }

  /**
   * Try to match a symbol using the trie (longest match).
   * Returns { value, length } or null.
   */
  function matchSymbol(str, pos) {
    return symbolTrie.longestMatch(str, pos);
  }

  return {
    isLetterBraille,
    isNumberBraille,
    matchOperand,
    matchBPUO,
    matchEnUppercaseContinue,
    matchEnUppercase,
    matchEnLowercase,
    matchNumber,
    matchSymbol,
  };
}
