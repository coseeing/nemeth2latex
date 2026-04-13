import { createScanner } from './lexer.js';
import { createNemethParser } from './parser/nemeth-parser.js';
import { createTransformer } from './transformer.js';

import symbolData from '../data/symbol.js';
import letterData from '../data/letter.js';
import numberData from '../data/number.js';

const scanner = createScanner(symbolData, letterData, numberData);
const parser = createNemethParser(scanner);
const transformer = createTransformer(symbolData, letterData, numberData);

/**
 * Translate a Nemeth braille math expression to LaTeX.
 *
 * @param {string} nemethString - The Nemeth braille input string
 * @returns {string} The corresponding LaTeX string
 */
export function translate(nemethString) {
  const tree = parser.parse(nemethString);
  return transformer.transform(tree).trim();
}
