import {
  alias,
  choice,
  createGrammar,
  literal,
  notAhead,
  optional,
  ref,
  repeat,
  rule,
  seq,
  terminal,
} from './core/index.js';

export function createNemethGrammar() {
  return createGrammar({
    start: 'start',
    rules: [
      rule('start', optional(ref('exp'))),
      rule('exp', alias(seq(ref('i'), repeat(ref('i'))), 'exp')),
      rule('exp_until_modify_end', optional(ref('exp_item_before_modify_end'))),
      rule('exp_until_sup_marker', optional(ref('exp_item_before_sup_marker'))),
      rule('exp_until_binom_mid', optional(ref('exp_item_before_binom_mid'))),
      rule('exp_until_binom_close', optional(ref('exp_item_before_binom_close'))),
      rule('exp_until_under_marker', optional(ref('exp_item_before_under_marker'))),
      rule('exp_until_over_marker', optional(ref('exp_item_before_over_marker'))),
      rule('exp_until_modify_close', optional(ref('exp_item_before_modify_close'))),
      rule('exp_until_limit_arrow', optional(ref('exp_item_before_limit_arrow'))),
      rule('exp_until_limit_close', optional(ref('exp_item_before_limit_close'))),
      rule('exp_until_line_close', optional(ref('exp_item_before_line_close'))),
      rule('exp_until_line_segment_close', optional(ref('exp_item_before_line_segment_close'))),
      rule('exp_until_ray_long_close', optional(ref('exp_item_before_ray_long_close'))),
      rule('exp_until_ray_close', optional(ref('exp_item_before_ray_close'))),
      rule('exp_until_arc_close', optional(ref('exp_item_before_arc_close'))),
      rule('exp_until_vector_close', optional(ref('exp_item_before_vector_close'))),
      rule('exp_until_paren_close', optional(ref('exp_item_before_paren_close'))),
      rule('exp_until_square_close', optional(ref('exp_item_before_square_close'))),
      rule('exp_until_curly_close', optional(ref('exp_item_before_curly_close'))),
      rule('exp_until_sqrt_close', optional(ref('exp_item_before_sqrt_close'))),
      rule('exp_until_root_sep', optional(ref('exp_item_before_root_sep'))),
      rule('exp_until_root_close', optional(ref('exp_item_before_root_close'))),
      rule('exp_until_frac_sep_or_close', optional(ref('exp_item_before_frac_sep_or_close'))),
      rule('exp_until_frac_close', optional(ref('exp_item_before_frac_close'))),
      rule('exp_until_mixed_close', optional(ref('exp_item_before_mixed_close'))),
      rule(
        'exp_item_before_modify_end',
        alias(
          seq(
            seq(notAhead(literal('⠐')), ref('i')),
            repeat(seq(notAhead(literal('⠐')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_sup_marker',
        alias(
          seq(
            seq(notAhead(literal('⠘')), ref('i_before_sup_marker')),
            repeat(seq(notAhead(literal('⠘')), ref('i_before_sup_marker')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_binom_mid',
        alias(
          seq(
            seq(notAhead(literal('⠐⠘')), ref('i')),
            repeat(seq(notAhead(literal('⠐⠘')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_binom_close',
        alias(
          seq(
            seq(notAhead(literal('⠐⠾')), ref('i')),
            repeat(seq(notAhead(literal('⠐⠾')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_under_marker',
        alias(
          seq(
            seq(notAhead(literal('⠩')), ref('i')),
            repeat(seq(notAhead(literal('⠩')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_over_marker',
        alias(
          seq(
            seq(notAhead(literal('⠣')), ref('i')),
            repeat(seq(notAhead(literal('⠣')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_modify_close',
        alias(
          seq(
            seq(notAhead(literal('⠻')), ref('i')),
            repeat(seq(notAhead(literal('⠻')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_limit_arrow',
        alias(
          seq(
            seq(notAhead(literal('⠀⠫⠕⠀')), ref('i')),
            repeat(seq(notAhead(literal('⠀⠫⠕⠀')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_limit_close',
        alias(
          seq(
            seq(notAhead(literal('⠻')), ref('i')),
            repeat(seq(notAhead(literal('⠻')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_line_close',
        alias(
          seq(
            seq(notAhead(literal('⠣⠫⠪⠒⠒⠕⠻')), ref('i')),
            repeat(seq(notAhead(literal('⠣⠫⠪⠒⠒⠕⠻')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_line_segment_close',
        alias(
          seq(
            seq(notAhead(literal('⠣⠱⠻')), ref('i')),
            repeat(seq(notAhead(literal('⠣⠱⠻')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_ray_long_close',
        alias(
          seq(
            seq(notAhead(literal('⠣⠫⠒⠒⠕⠻')), ref('i')),
            repeat(seq(notAhead(literal('⠣⠫⠒⠒⠕⠻')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_ray_close',
        alias(
          seq(
            seq(notAhead(literal('⠣⠫⠕⠻')), ref('i')),
            repeat(seq(notAhead(literal('⠣⠫⠕⠻')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_arc_close',
        alias(
          seq(
            seq(notAhead(literal('⠣⠫⠁⠻')), ref('i')),
            repeat(seq(notAhead(literal('⠣⠫⠁⠻')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_vector_close',
        alias(
          seq(
            seq(notAhead(literal('⠣⠫⠒⠒⠈⠕⠻')), ref('i')),
            repeat(seq(notAhead(literal('⠣⠫⠒⠒⠈⠕⠻')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_paren_close',
        alias(
          seq(
            seq(notAhead(literal('⠾')), ref('i')),
            repeat(seq(notAhead(literal('⠾')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_square_close',
        alias(
          seq(
            seq(notAhead(literal('⠈⠾')), ref('i')),
            repeat(seq(notAhead(literal('⠈⠾')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_curly_close',
        alias(
          seq(
            seq(notAhead(literal('⠨⠾')), ref('i')),
            repeat(seq(notAhead(literal('⠨⠾')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'sqrt_close_marker',
        seq(repeat(literal('⠨')), literal('⠻'))
      ),
      rule(
        'exp_item_before_sqrt_close',
        alias(
          seq(
            seq(notAhead(ref('sqrt_close_marker')), ref('i')),
            repeat(seq(notAhead(ref('sqrt_close_marker')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_root_sep',
        alias(
          seq(
            seq(notAhead(literal('⠜')), ref('i')),
            repeat(seq(notAhead(literal('⠜')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_root_close',
        alias(
          seq(
            seq(notAhead(literal('⠻')), ref('i')),
            repeat(seq(notAhead(literal('⠻')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_frac_sep_or_close',
        alias(
          seq(
            seq(notAhead(choice(ref('frac_sep_marker'), ref('frac_close_marker'))), ref('i')),
            repeat(
              seq(
                notAhead(choice(ref('frac_sep_marker'), ref('frac_close_marker'))),
                ref('i')
              )
            )
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_frac_close',
        alias(
          seq(
            seq(notAhead(ref('frac_close_marker')), ref('i')),
            repeat(seq(notAhead(ref('frac_close_marker')), ref('i')))
          ),
          'exp'
        )
      ),
      rule(
        'exp_item_before_mixed_close',
        alias(
          seq(
            seq(notAhead(literal('⠸')), ref('i')),
            repeat(seq(notAhead(literal('⠸')), ref('i')))
          ),
          'exp'
        )
      ),
      rule('frac_sep_marker', seq(repeat(literal('⠠')), literal('⠌'))),
      rule('frac_close_marker', seq(repeat(literal('⠠')), literal('⠼'))),
      rule(
        'symbol_like',
        choice(terminal('BPUO'), terminal('OTHER'), terminal('OPERAND'))
      ),
      rule(
        'i',
        choice(
          ref('exp_limit'),
          ref('exp_line'),
          ref('exp_line_segment'),
          ref('exp_ray_long'),
          ref('exp_ray'),
          ref('exp_arc'),
          ref('exp_vector'),
          ref('exp_underover_symbol'),
          ref('exp_underover'),
          ref('exp_under'),
          ref('exp_over'),
          ref('exp_binom'),
          ref('exp_subsup_symbol'),
          ref('exp_mixed_number'),
          ref('exp_frac'),
          ref('exp_sqrt'),
          ref('exp_root'),
          ref('exp_sup'),
          ref('exp_sub'),
          ref('exp_sup_simple'),
          ref('exp_sub_simple'),
          ref('s')
        )
      ),
      rule(
        'i_before_sup_marker',
        choice(
          ref('exp_binom'),
          ref('exp_mixed_number'),
          ref('exp_frac'),
          ref('exp_sqrt'),
          ref('exp_root'),
          ref('exp_sub_simple'),
          ref('s')
        )
      ),
      rule(
        's',
        choice(
          ref('exp_parenthesis'),
          ref('exp_square_bracket'),
          ref('exp_curly_brace'),
          terminal('CONST'),
          terminal('OPERAND')
        )
      ),
      rule(
        'exp_parenthesis',
        alias(
          seq(
            notAhead(literal('⠷⠠⠉⠰')),
            literal('⠷'),
            ref('exp_until_paren_close'),
            literal('⠾')
          ),
          'exp_parenthesis'
        )
      ),
      rule(
        'exp_square_bracket',
        alias(
          seq(literal('⠈⠷'), ref('exp_until_square_close'), literal('⠈⠾')),
          'exp_square_bracket'
        )
      ),
      rule(
        'exp_curly_brace',
        alias(
          seq(literal('⠨⠷'), ref('exp_until_curly_close'), literal('⠨⠾')),
          'exp_curly_brace'
        )
      ),
      rule(
        'exp_sup_simple',
        alias(seq(ref('s'), literal('⠘'), ref('s')), 'exp_sup_simple')
      ),
      rule(
        'exp_sup',
        alias(seq(ref('s'), literal('⠘'), ref('exp_until_modify_end'), literal('⠐')), 'exp_sup')
      ),
      rule(
        'exp_sub_simple',
        alias(seq(ref('s'), literal('⠰'), ref('s')), 'exp_sub_simple')
      ),
      rule(
        'exp_sub',
        alias(seq(ref('s'), literal('⠰'), ref('exp_until_modify_end'), literal('⠐')), 'exp_sub')
      ),
      rule(
        'exp_subsup_symbol',
        alias(
          seq(
            terminal('BPUO'),
            literal('⠰'),
            ref('exp_until_sup_marker'),
            literal('⠘'),
            ref('exp_until_modify_end'),
            literal('⠐')
          ),
          'exp_subsup_symbol'
        )
      ),
      rule(
        'exp_frac',
        alias(
          seq(
            repeat(literal('⠠')),
            literal('⠹'),
            ref('exp_until_frac_sep_or_close'),
            ref('frac_sep_marker'),
            ref('exp_until_frac_close'),
            ref('frac_close_marker')
          ),
          'exp_frac'
        )
      ),
      rule(
        'exp_mixed_number',
        alias(
          seq(
            terminal('NUMBER'),
            literal('⠸'),
            repeat(literal('⠠')),
            literal('⠹'),
            ref('exp_until_frac_sep_or_close'),
            ref('frac_sep_marker'),
            ref('exp_until_mixed_close'),
            literal('⠸'),
            ref('frac_close_marker')
          ),
          'exp_mixed_number'
        )
      ),
      rule(
        'exp_sqrt',
        alias(
          seq(repeat(literal('⠨')), literal('⠜'), ref('exp_until_sqrt_close'), ref('sqrt_close_marker')),
          'exp_sqrt'
        )
      ),
      rule(
        'exp_root',
        alias(seq(literal('⠣'), ref('exp_until_root_sep'), literal('⠜'), ref('exp_until_root_close'), literal('⠻')), 'exp_root')
      ),
      rule(
        'exp_binom',
        alias(
          seq(literal('⠷⠠⠉⠰'), ref('exp_until_binom_mid'), literal('⠐⠘'), ref('exp_until_binom_close'), literal('⠐⠾')),
          'exp_binom'
        )
      ),
      rule(
        'exp_limit',
        alias(
          seq(literal('⠐⠇⠊⠍⠩'), ref('exp_until_limit_arrow'), literal('⠀⠫⠕⠀'), ref('exp_until_limit_close'), literal('⠻')),
          'exp_limit'
        )
      ),
      rule(
        'exp_line',
        alias(seq(literal('⠐'), ref('exp_until_line_close'), literal('⠣⠫⠪⠒⠒⠕⠻')), 'exp_line')
      ),
      rule(
        'exp_line_segment',
        alias(seq(literal('⠐'), ref('exp_until_line_segment_close'), literal('⠣⠱⠻')), 'exp_line_segment')
      ),
      rule(
        'exp_ray_long',
        alias(seq(literal('⠐'), ref('exp_until_ray_long_close'), literal('⠣⠫⠒⠒⠕⠻')), 'exp_ray')
      ),
      rule(
        'exp_ray',
        alias(seq(literal('⠐'), ref('exp_until_ray_close'), literal('⠣⠫⠕⠻')), 'exp_ray')
      ),
      rule(
        'exp_arc',
        alias(seq(literal('⠐'), ref('exp_until_arc_close'), literal('⠣⠫⠁⠻')), 'exp_arc')
      ),
      rule(
        'exp_vector',
        alias(seq(literal('⠐'), ref('exp_until_vector_close'), literal('⠣⠫⠒⠒⠈⠕⠻')), 'exp_vector')
      ),
      rule(
        'exp_under',
        alias(seq(literal('⠐'), ref('exp_until_under_marker'), literal('⠩'), ref('exp_until_modify_close'), literal('⠻')), 'exp_under')
      ),
      rule(
        'exp_over',
        alias(seq(literal('⠐'), ref('exp_until_over_marker'), literal('⠣'), ref('exp_until_modify_close'), literal('⠻')), 'exp_over')
      ),
      rule(
        'exp_underover',
        alias(
          seq(
            literal('⠐'),
            ref('exp_until_under_marker'),
            literal('⠩'),
            ref('exp_until_over_marker'),
            literal('⠣'),
            ref('exp_until_modify_close'),
            literal('⠻')
          ),
          'exp_underover'
        )
      ),
      rule(
        'exp_underover_symbol',
        alias(
          seq(
            literal('⠐'),
            ref('symbol_like'),
            literal('⠩'),
            ref('exp_until_over_marker'),
            literal('⠣'),
            ref('exp_until_modify_close'),
            literal('⠻')
          ),
          'exp_underover_symbol'
        )
      ),
    ],
  });
}
