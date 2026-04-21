import { describe, expect, it } from 'vitest';

import letterData from '../data/letter.js';
import numberData from '../data/number.js';
import symbolData from '../data/symbol.js';
import { createScanner } from '../src/lexer.js';
import { createNemethParser } from '../src/parser/nemeth-parser.js';

const scanner = createScanner(symbolData, letterData, numberData);

describe('nemeth-parser hybrid integration', () => {
  it('parses the declarative subset through parser-core', () => {
    const parser = createNemethParser(scanner);

    expect(parser.parse('⠁⠘⠆')).toEqual({
      type: 'exp',
      children: [
        {
          type: 'exp_sup_simple',
          children: [
            { type: 'EN_LOWERCASE', value: '⠁' },
            { type: 'NUMBER', value: '⠆' },
          ],
        },
      ],
    });
  });

  it('parses grouped superscripts with the declarative grammar', () => {
    const parser = createNemethParser(scanner);

    expect(parser.parse('⠷⠁⠬⠃⠾⠘⠆')).toEqual({
      type: 'exp',
      children: [
        {
          type: 'exp_sup_simple',
          children: [
            {
              type: 'exp_parenthesis',
              children: [
                {
                  type: 'exp',
                  children: [
                    { type: 'EN_LOWERCASE', value: '⠁' },
                    { type: 'OTHER', value: '⠬' },
                    { type: 'EN_LOWERCASE', value: '⠃' },
                  ],
                },
              ],
            },
            { type: 'NUMBER', value: '⠆' },
          ],
        },
      ],
    });
  });

  it('parses full superscripts through parser-core', () => {
    const parser = createNemethParser(scanner);

    expect(parser.parse('⠁⠬⠃⠘⠆⠬⠒⠐')).toEqual({
      type: 'exp',
      children: [
        { type: 'EN_LOWERCASE', value: '⠁' },
        { type: 'OTHER', value: '⠬' },
        {
          type: 'exp_sup',
          children: [
            { type: 'EN_LOWERCASE', value: '⠃' },
            {
              type: 'exp',
              children: [
                { type: 'NUMBER', value: '⠆' },
                { type: 'OTHER', value: '⠬' },
                { type: 'NUMBER', value: '⠒' },
              ],
            },
          ],
        },
      ],
    });
  });

  it('parses fractions through parser-core', () => {
    const parser = createNemethParser(scanner);

    expect(parser.parse('⠹⠆⠤⠂⠌⠒⠘⠆⠼')).toEqual({
      type: 'exp',
      children: [
        {
          type: 'exp_frac',
          children: [
            {
              type: 'exp',
              children: [
                { type: 'NUMBER', value: '⠆' },
                { type: 'OTHER', value: '⠤' },
                { type: 'NUMBER', value: '⠂' },
              ],
            },
            {
              type: 'exp',
              children: [
                {
                  type: 'exp_sup_simple',
                  children: [
                    { type: 'NUMBER', value: '⠒' },
                    { type: 'NUMBER', value: '⠆' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('parses mixed numbers through parser-core', () => {
    const parser = createNemethParser(scanner);

    expect(parser.parse('⠼⠂⠲⠸⠹⠒⠌⠂⠂⠸⠼')).toEqual({
      type: 'exp',
      children: [
        {
          type: 'exp_mixed_number',
          children: [
            { type: 'NUMBER', value: '⠼⠂⠲' },
            {
              type: 'exp',
              children: [{ type: 'NUMBER', value: '⠒' }],
            },
            {
              type: 'exp',
              children: [
                { type: 'NUMBER', value: '⠂⠂' },
              ],
            },
          ],
        },
      ],
    });
  });

  it('parses square roots and roots through parser-core', () => {
    const parser = createNemethParser(scanner);

    expect(parser.parse('⠜⠭⠘⠆⠐⠻')).toEqual({
      type: 'exp',
      children: [
        {
          type: 'exp_sqrt',
          children: [
            {
              type: 'exp',
              children: [
                {
                  type: 'exp_sup',
                  children: [
                    { type: 'EN_LOWERCASE', value: '⠭' },
                    {
                      type: 'exp',
                      children: [{ type: 'NUMBER', value: '⠆' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(parser.parse('⠣⠒⠜⠭⠻')).toEqual({
      type: 'exp',
      children: [
        {
          type: 'exp_root',
          children: [
            {
              type: 'exp',
              children: [{ type: 'NUMBER', value: '⠒' }],
            },
            {
              type: 'exp',
              children: [{ type: 'EN_LOWERCASE', value: '⠭' }],
            },
          ],
        },
      ],
    });
  });

  it('parses binomial and BPUO subsup forms through parser-core', () => {
    const parser = createNemethParser(scanner);

    expect(parser.parse('⠷⠠⠉⠰⠆⠐⠘⠢⠐⠾')).toEqual({
      type: 'exp',
      children: [
        {
          type: 'exp_binom',
          children: [
            {
              type: 'exp',
              children: [{ type: 'NUMBER', value: '⠆' }],
            },
            {
              type: 'exp',
              children: [{ type: 'NUMBER', value: '⠢' }],
            },
          ],
        },
      ],
    });

    expect(parser.parse('⠮⠰⠭⠘⠽⠐')).toEqual({
      type: 'exp',
      children: [
        {
          type: 'exp_subsup_symbol',
          children: [
            { type: 'BPUO', value: '⠮' },
            {
              type: 'exp',
              children: [{ type: 'EN_LOWERCASE', value: '⠭' }],
            },
            {
              type: 'exp',
              children: [{ type: 'EN_LOWERCASE', value: '⠽' }],
            },
          ],
        },
      ],
    });
  });

  it('parses limit and geometric modify-prefix forms through parser-core', () => {
    const parser = createNemethParser(scanner);

    expect(parser.parse('⠐⠇⠊⠍⠩⠊⠀⠫⠕⠀⠴⠻')).toEqual({
      type: 'exp',
      children: [
        {
          type: 'exp_limit',
          children: [
            {
              type: 'exp',
              children: [{ type: 'EN_LOWERCASE', value: '⠊' }],
            },
            {
              type: 'exp',
              children: [{ type: 'NUMBER', value: '⠴' }],
            },
          ],
        },
      ],
    });

    expect(parser.parse('⠐⠠⠁⠠⠃⠣⠱⠻')).toEqual({
      type: 'exp',
      children: [
        {
          type: 'exp_line_segment',
          children: [
            {
              type: 'exp',
              children: [
                { type: 'EN_UPPERCASE', value: '⠠⠁' },
                { type: 'EN_UPPERCASE', value: '⠠⠃' },
              ],
            },
          ],
        },
      ],
    });
  });

  it('parses underover symbol forms through parser-core', () => {
    const parser = createNemethParser(scanner);

    expect(parser.parse('⠐⠮⠩⠭⠣⠽⠻')).toEqual({
      type: 'exp',
      children: [
        {
          type: 'exp_underover_symbol',
          children: [
            { type: 'BPUO', value: '⠮' },
            {
              type: 'exp',
              children: [{ type: 'EN_LOWERCASE', value: '⠭' }],
            },
            {
              type: 'exp',
              children: [{ type: 'EN_LOWERCASE', value: '⠽' }],
            },
          ],
        },
      ],
    });

    expect(parser.parse('⠐⠨⠠⠎⠩⠊⠀⠨⠅⠀⠴⠣⠢⠴⠻')).toEqual({
      type: 'exp',
      children: [
        {
          type: 'exp_underover_symbol',
          children: [
            { type: 'BPUO', value: '⠨⠠⠎' },
            {
              type: 'exp',
              children: [
                { type: 'EN_LOWERCASE', value: '⠊' },
                { type: 'OTHER', value: '⠀⠨⠅⠀' },
                { type: 'NUMBER', value: '⠴' },
              ],
            },
            {
              type: 'exp',
              children: [
                { type: 'NUMBER', value: '⠢⠴' },
              ],
            },
          ],
        },
      ],
    });
  });

  it('parses direct modify-symbol forms through parser-core', () => {
    const parser = createNemethParser(scanner);

    expect(parser.parse('⠐⠅⠱')).toEqual({
      type: 'exp',
      children: [
        { type: 'OTHER', value: '⠐⠅⠱' },
      ],
    });
  });
});
