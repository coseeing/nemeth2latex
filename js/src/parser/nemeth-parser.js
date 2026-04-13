import { ParserCore } from './core/index.js';
import { createNemethGrammar } from './nemeth-grammar.js';
import { createNemethTerminals } from './nemeth-terminals.js';

export function createNemethParser(scanner) {
  const parserCore = new ParserCore({
    grammar: createNemethGrammar(),
    terminals: createNemethTerminals(scanner),
  });

  function parse(input) {
    return parserCore.parse(input);
  }

  return {
    parse,
    parserCore,
  };
}
