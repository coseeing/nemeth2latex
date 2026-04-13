import { describe, expect, it } from 'vitest';

import {
  ParserCore,
  ahead,
  alias,
  choice,
  createCustomTerminal,
  createGrammar,
  createRegexTerminal,
  literal,
  notAhead,
  optional,
  ref,
  repeat,
  rule,
  seq,
  terminal,
} from '../src/parser/core/index.js';

describe('parser-core', () => {
  it('parses a sequence into a composite AST node', () => {
    const parser = new ParserCore({
      grammar: createGrammar({
        start: 'start',
        rules: [
          rule('start', alias(seq(literal('a'), terminal('LETTER')), 'pair')),
        ],
      }),
      terminals: {
        LETTER: createCustomTerminal((input, pos) => {
          if (input[pos] !== 'b') {
            return null;
          }
          return { value: 'b', length: 1 };
        }),
      },
    });

    expect(parser.parse('ab')).toEqual({
      type: 'pair',
      children: [{ type: 'LETTER', value: 'b' }],
    });
  });

  it('backtracks across ordered choices', () => {
    const parser = new ParserCore({
      grammar: createGrammar({
        start: 'start',
        rules: [
          rule(
            'start',
            choice(
              alias(seq(literal('a'), literal('b')), 'ab'),
              alias(seq(literal('a'), terminal('LETTER')), 'fallback')
            )
          ),
        ],
      }),
      terminals: {
        LETTER: createCustomTerminal((input, pos) => {
          if (input[pos] !== 'c') {
            return null;
          }
          return { value: 'c', length: 1 };
        }),
      },
    });

    expect(parser.parse('ac')).toEqual({
      type: 'fallback',
      children: [{ type: 'LETTER', value: 'c' }],
    });
  });

  it('supports optional and repeated expressions', () => {
    const parser = new ParserCore({
      grammar: createGrammar({
        start: 'start',
        rules: [
          rule(
            'start',
            alias(
              seq(optional(literal('-')), repeat(terminal('DIGIT'), 1)),
              'number'
            )
          ),
        ],
      }),
      terminals: {
        DIGIT: createRegexTerminal(/\d/),
      },
    });

    expect(parser.parse('-123')).toEqual({
      type: 'number',
      children: [
        { type: 'DIGIT', value: '1' },
        { type: 'DIGIT', value: '2' },
        { type: 'DIGIT', value: '3' },
      ],
    });
  });

  it('supports zero-width lookahead guards', () => {
    const parser = new ParserCore({
      grammar: createGrammar({
        start: 'start',
        rules: [
          rule(
            'start',
            alias(
              seq(
                ahead(literal('a')),
                literal('a'),
                notAhead(literal('c')),
                terminal('LETTER')
              ),
              'guarded'
            )
          ),
        ],
      }),
      terminals: {
        LETTER: createCustomTerminal((input, pos) => {
          if (input[pos] !== 'b') {
            return null;
          }
          return { value: 'b', length: 1 };
        }),
      },
    });

    expect(parser.parse('ab')).toEqual({
      type: 'guarded',
      children: [{ type: 'LETTER', value: 'b' }],
    });
  });

  it('memoizes rule results by rule name and position', () => {
    let calls = 0;
    const parser = new ParserCore({
      grammar: createGrammar({
        start: 'start',
        rules: [
          rule(
            'start',
            choice(
              seq(ref('chunk'), literal('!')),
              ref('chunk')
            )
          ),
          rule('chunk', alias(terminal('WORD'), 'chunk')),
        ],
      }),
      terminals: {
        WORD: createCustomTerminal((input, pos) => {
          calls += 1;
          if (!input.startsWith('abc', pos)) {
            return null;
          }
          return { value: 'abc', length: 3 };
        }),
      },
    });

    expect(parser.parse('abc')).toEqual({
      type: 'chunk',
      children: [{ type: 'WORD', value: 'abc' }],
    });
    expect(calls).toBe(1);
  });

  it('reports parse failures with location context', () => {
    const parser = new ParserCore({
      grammar: createGrammar({
        start: 'start',
        rules: [rule('start', alias(seq(literal('a'), terminal('DIGIT')), 'pair'))],
      }),
      terminals: {
        DIGIT: createRegexTerminal(/\d/),
      },
    });

    expect(() => parser.parse('ax')).toThrowError(
      'Parse failed at position 1: expected DIGIT, found "x"'
    );
  });
});
