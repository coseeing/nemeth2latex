/**
 * Recursive descent parser for Nemeth braille math expressions.
 * Directly corresponds to the ~20 grammar rules in nemeth/grammar.py.
 *
 * Uses a scanner-driven approach with backtracking to handle the
 * context-dependent nature of Nemeth braille characters.
 */
export function createParser(scanner) {
  let input = '';
  let pos = 0;

  function atEnd() {
    return pos >= input.length;
  }

  function save() {
    return pos;
  }

  function restore(saved) {
    pos = saved;
  }

  function peek() {
    return input[pos];
  }

  function matchLiteral(str) {
    if (input.startsWith(str, pos)) {
      pos += str.length;
      return true;
    }
    return false;
  }

  function skipPassthrough(ch) {
    while (pos < input.length && input[pos] === ch) {
      pos++;
    }
  }

  function node(type, children) {
    return { type, children: children.filter((c) => c != null) };
  }

  function leaf(type, value) {
    return { type, value };
  }

  // --- Geometric closing patterns (ordered longest first) ---
  const geometricClosings = [
    { pattern: '⠣⠫⠪⠒⠒⠕⠻', type: 'exp_line' },
    { pattern: '⠣⠫⠒⠒⠈⠕⠻', type: 'exp_vector' },
    { pattern: '⠣⠫⠒⠒⠕⠻', type: 'exp_ray' },
    { pattern: '⠣⠫⠕⠻', type: 'exp_ray' },
    { pattern: '⠣⠫⠁⠻', type: 'exp_arc' },
    { pattern: '⠣⠱⠻', type: 'exp_line_segment' },
  ];

  function atGeometricClose() {
    for (const gc of geometricClosings) {
      if (input.startsWith(gc.pattern, pos)) return true;
    }
    return false;
  }

  function atOverMarker() {
    // ⠣ followed by something that's NOT a geometric marker
    return (
      peek() === '⠣' &&
      !input.startsWith('⠣⠫', pos) &&
      !input.startsWith('⠣⠱', pos)
    );
  }

  // --- Main grammar rules ---

  function parseStart() {
    return parseExp();
  }

  /**
   * exp → i exp*
   * @param {Function} shouldStop - Optional callback to check if parsing should stop
   */
  function parseExp(shouldStop) {
    const items = [];

    while (!atEnd()) {
      if (shouldStop && shouldStop()) break;

      const saved = save();
      const item = parseI(shouldStop);
      if (item === null) {
        restore(saved);
        break;
      }
      items.push(item);
    }

    if (items.length === 0) return null;
    if (items.length === 1) return items[0];
    return node('exp', items);
  }

  /**
   * i → (alternatives tried in priority order with backtracking)
   */
  function parseI(parentShouldStop) {
    let result;

    // 1. ⠐-prefixed constructs (limit, geometric, underover) or ⠐-symbols
    if (!atEnd() && peek() === '⠐') {
      result = tryModifyPrefix();
      if (result) return result;
    }

    // 2. Binom: ⠷⠠⠉⠰ exp ⠐⠘ exp ⠐⠾
    result = tryBinom();
    if (result) return result;

    // 3. BPUO-based subsup: BPUO ⠰ exp? ⠘ exp? ⠐
    result = tryBpuoSubSup();
    if (result) return result;

    // 4. Mixed number: NUMBER ⠸ frac (must try before frac)
    result = tryMixedNumber();
    if (result) return result;

    // 5. Frac: (⠠)*⠹ exp? (⠠)*⠌ exp? (⠠)*⠼
    result = tryFrac();
    if (result) return result;

    // 6. Sqrt: (⠨)*⠜ exp? (⠨)*⠻
    result = trySqrt();
    if (result) return result;

    // 7. Root: ⠣ exp? ⠜ exp? ⠻
    result = tryRoot();
    if (result) return result;

    // 8. s-based (with optional sup/sub suffix)
    result = trySWithSuffix(parentShouldStop);
    if (result) return result;

    return null;
  }

  // --- ⠐-prefixed: structural constructs or symbols ---

  function tryModifyPrefix() {
    const outerSaved = save();

    // 1. Limit: ⠐⠇⠊⠍⠩ exp? ⠀⠫⠕⠀ exp? ⠻
    if (input.startsWith('⠐⠇⠊⠍⠩', pos)) {
      pos += 5;
      const from = parseExp(() =>
        input.startsWith('⠀⠫⠕⠀', pos)
      );
      if (matchLiteral('⠀⠫⠕⠀')) {
        const to = parseExp(() => peek() === '⠻');
        if (matchLiteral('⠻')) {
          return node('exp_limit', [from, to]);
        }
      }
      restore(outerSaved);
    }

    // 2. Structural constructs starting with ⠐
    if (peek() === '⠐') {
      const structResult = tryStructuralAfterModify();
      if (structResult) return structResult;
    }

    // 3. Fallback: try trie for symbols starting with ⠐
    // (e.g., ⠐⠅ → <, ⠐⠅⠱ → \leq)
    const trieMatch = scanner.matchSymbol(input, pos);
    if (trieMatch) {
      const value = input.slice(pos, pos + trieMatch.length);
      pos += trieMatch.length;
      return leaf('OTHER', value);
    }

    // ⠐ not consumed → it's a MODIFY_END for enclosing rule
    return null;
  }

  function tryStructuralAfterModify() {
    const saved = save();
    pos += 1; // skip ⠐

    // Parse the expression after ⠐
    // Stop at geometric closings, ⠩ (under), or ⠣ (over, non-geometric)
    const innerExp = parseExp(
      () => atGeometricClose() || peek() === '⠩' || atOverMarker()
    );

    // Try geometric closings (longest first)
    for (const gc of geometricClosings) {
      if (matchLiteral(gc.pattern)) {
        return node(gc.type, [innerExp]);
      }
    }

    // Try underover patterns starting with ⠩
    if (peek() === '⠩') {
      const underSaved = save();
      pos += 1; // skip ⠩

      const exp2 = parseExp(
        () => peek() === '⠻' || atOverMarker()
      );

      // Try: ⠩ exp ⠣ exp/s ⠻ → underover_symbol or underover
      if (atOverMarker()) {
        const overSaved = save();
        pos += 1; // skip ⠣

        const exp3 = parseExp(() => peek() === '⠻');
        if (matchLiteral('⠻')) {
          // Determine if this is underover_symbol or underover
          // underover_symbol: first child is a simple symbol
          // underover: first child is exp, last is s
          // We use underover_symbol when the first child is a single leaf
          if (
            innerExp &&
            (innerExp.type === 'OTHER' || innerExp.type === 'OPERAND')
          ) {
            return node('exp_underover_symbol', [innerExp, exp2, exp3]);
          }
          return node('exp_underover', [innerExp, exp2, exp3]);
        }
        restore(overSaved);
      }

      // Try: ⠩ exp ⠻ → under
      if (matchLiteral('⠻')) {
        return node('exp_under', [innerExp, exp2]);
      }

      restore(underSaved);
    }

    // Try over: ⠣ exp ⠻
    if (atOverMarker()) {
      const overSaved = save();
      pos += 1; // skip ⠣

      const exp2 = parseExp(() => peek() === '⠻');
      if (matchLiteral('⠻')) {
        return node('exp_over', [innerExp, exp2]);
      }
      restore(overSaved);
    }

    // No structural match
    restore(saved);
    return null;
  }

  // --- Binom ---

  function tryBinom() {
    const saved = save();
    if (!matchLiteral('⠷⠠⠉⠰')) return null;

    const sub = parseExp(() =>
      input.startsWith('⠐⠘', pos)
    );
    if (!matchLiteral('⠐⠘')) {
      restore(saved);
      return null;
    }

    const sup = parseExp(() =>
      input.startsWith('⠐⠾', pos)
    );
    if (!matchLiteral('⠐⠾')) {
      restore(saved);
      return null;
    }

    return node('exp_binom', [sub, sup]);
  }

  // --- BPUO subsup ---

  function tryBpuoSubSup() {
    const saved = save();
    const bpuo = scanner.matchBPUO(input, pos);
    if (!bpuo) return null;
    pos += bpuo.length;

    if (peek() === '⠰') {
      pos += 1;
      const subExp = parseExp(() => peek() === '⠘');
      if (peek() === '⠘') {
        pos += 1;
        const supExp = parseExp(() => peek() === '⠐');
        if (matchLiteral('⠐')) {
          return node('exp_subsup_symbol', [
            leaf('BPUO', bpuo),
            subExp,
            supExp,
          ]);
        }
      }
    }

    restore(saved);
    return null;
  }

  // --- Frac ---

  function atFracSep() {
    const s = save();
    skipPassthrough('⠠');
    const result = peek() === '⠌';
    restore(s);
    return result;
  }

  function atFracClose() {
    const s = save();
    skipPassthrough('⠠');
    const result = peek() === '⠼';
    restore(s);
    return result;
  }

  function tryFrac() {
    const saved = save();

    skipPassthrough('⠠');
    if (!matchLiteral('⠹')) {
      restore(saved);
      return null;
    }

    const num = parseExp(() => atFracSep() || atFracClose());

    skipPassthrough('⠠');
    if (!matchLiteral('⠌')) {
      restore(saved);
      return null;
    }

    const den = parseExp(() => atFracClose());

    skipPassthrough('⠠');
    if (!matchLiteral('⠼')) {
      restore(saved);
      return null;
    }

    return node('exp_frac', [num, den]);
  }

  // --- Mixed number ---

  function tryMixedNumber() {
    const saved = save();

    const num = scanner.matchNumber(input, pos);
    if (!num) return null;
    pos += num.length;

    if (!matchLiteral('⠸')) {
      restore(saved);
      return null;
    }

    skipPassthrough('⠠');
    if (!matchLiteral('⠹')) {
      restore(saved);
      return null;
    }

    const fracNum = parseExp(() => atFracSep());

    skipPassthrough('⠠');
    if (!matchLiteral('⠌')) {
      restore(saved);
      return null;
    }

    const fracDen = parseExp(() =>
      input.startsWith('⠸', pos)
    );

    if (!matchLiteral('⠸')) {
      restore(saved);
      return null;
    }
    skipPassthrough('⠠');
    if (!matchLiteral('⠼')) {
      restore(saved);
      return null;
    }

    return node('exp_mixed_number', [leaf('NUMBER', num), fracNum, fracDen]);
  }

  // --- Sqrt ---

  function trySqrt() {
    const saved = save();

    skipPassthrough('⠨');
    if (!matchLiteral('⠜')) {
      restore(saved);
      return null;
    }

    const body = parseExp(() => {
      const s = save();
      skipPassthrough('⠨');
      const result = peek() === '⠻';
      restore(s);
      return result;
    });

    skipPassthrough('⠨');
    if (!matchLiteral('⠻')) {
      restore(saved);
      return null;
    }

    return node('exp_sqrt', [body]);
  }

  // --- Root ---

  function tryRoot() {
    const saved = save();

    if (!matchLiteral('⠣')) return null;

    const index = parseExp(() => peek() === '⠜');
    if (!matchLiteral('⠜')) {
      restore(saved);
      return null;
    }

    const body = parseExp(() => peek() === '⠻');
    if (!matchLiteral('⠻')) {
      restore(saved);
      return null;
    }

    return node('exp_root', [index, body]);
  }

  // --- s-based (with optional sup/sub suffix) ---

  function trySWithSuffix(parentShouldStop) {
    const saved = save();

    const s = parseS();
    if (s === null) {
      restore(saved);
      return null;
    }

    // Check for sup: ⠘
    // If the parent context needs ⠘ as a delimiter, don't consume it
    if (!atEnd() && peek() === '⠘' && !(parentShouldStop && parentShouldStop())) {
      // Try exp_sup: s ⠘ exp ⠐
      const savedSup = save();
      pos += 1; // skip ⠘
      const supExp = parseExp(() => peek() === '⠐');
      if (matchLiteral('⠐')) {
        return node('exp_sup', [s, supExp]);
      }
      restore(savedSup);

      // Try exp_sup_simple: s ⠘ s
      const savedSimple = save();
      pos += 1; // skip ⠘
      const s2 = parseS();
      if (s2) {
        return node('exp_sup_simple', [s, s2]);
      }
      restore(savedSimple);
    }

    // Check for sub: ⠰
    // If the parent context needs ⠰ as a delimiter, don't consume it
    if (!atEnd() && peek() === '⠰' && !(parentShouldStop && parentShouldStop())) {
      // Try exp_sub: s ⠰ exp ⠐
      const savedSub = save();
      pos += 1; // skip ⠰
      const subExp = parseExp(() => peek() === '⠐');
      if (matchLiteral('⠐')) {
        return node('exp_sub', [s, subExp]);
      }
      restore(savedSub);

      // Try exp_sub_simple: s ⠰ s
      const savedSimple = save();
      pos += 1; // skip ⠰
      const s2 = parseS();
      if (s2) {
        return node('exp_sub_simple', [s, s2]);
      }
      restore(savedSimple);
    }

    // Plain s (exp_interm)
    return s;
  }

  // --- s rule ---

  function parseS() {
    let result;

    // Parenthesis: ⠷ exp? ⠾ (but not ⠷⠠⠉⠰ which is binom)
    result = tryParenthesis();
    if (result) return result;

    // Square bracket: ⠈⠷ exp? ⠈⠾
    result = trySquareBracket();
    if (result) return result;

    // Curly brace: ⠨⠷ exp? ⠨⠾
    result = tryCurlyBrace();
    if (result) return result;

    // Const (includes symbols via trie — tried BEFORE operand to match Python behavior)
    result = tryConst();
    if (result) return result;

    // Operand (fallback for multi-char operand sequences not in trie)
    result = tryOperand();
    if (result) return result;

    return null;
  }

  function tryParenthesis() {
    if (input.startsWith('⠷⠠⠉⠰', pos)) return null;
    const saved = save();
    if (!matchLiteral('⠷')) return null;

    const body = parseExp(() => peek() === '⠾');
    if (!matchLiteral('⠾')) {
      restore(saved);
      return null;
    }

    return node('exp_parenthesis', [body]);
  }

  function trySquareBracket() {
    const saved = save();
    if (!matchLiteral('⠈⠷')) return null;

    const body = parseExp(() =>
      input.startsWith('⠈⠾', pos)
    );
    if (!matchLiteral('⠈⠾')) {
      restore(saved);
      return null;
    }

    return node('exp_square_bracket', [body]);
  }

  function tryCurlyBrace() {
    const saved = save();
    if (!matchLiteral('⠨⠷')) return null;

    const body = parseExp(() =>
      input.startsWith('⠨⠾', pos)
    );
    if (!matchLiteral('⠨⠾')) {
      restore(saved);
      return null;
    }

    return node('exp_curly_brace', [body]);
  }

  function tryOperand() {
    const match = scanner.matchOperand(input, pos);
    if (match) {
      pos += match.length;
      return leaf('OPERAND', match);
    }
    return null;
  }

  /**
   * _const → NUMBER | EN_LOWERCASE | EN_UPPERCASE | EN_UPPERCASE_CONTINUE | OTHER
   *
   * Important: const is tried BEFORE operand to match Python Earley behavior.
   * Since both OPERAND and OTHER use the same symbol table for translation,
   * the output is identical — only the parse tree structure differs.
   */
  function tryConst() {
    // EN_UPPERCASE_CONTINUE (highest priority .1)
    const euc = scanner.matchEnUppercaseContinue(input, pos);
    if (euc) {
      pos += euc.length;
      return leaf('EN_UPPERCASE_CONTINUE', euc);
    }

    // EN_UPPERCASE
    const eu = scanner.matchEnUppercase(input, pos);
    if (eu) {
      pos += eu.length;
      return leaf('EN_UPPERCASE', eu);
    }

    // NUMBER with ⠼ prefix
    if (
      peek() === '⠼' &&
      pos + 1 < input.length &&
      scanner.isNumberBraille(input[pos + 1])
    ) {
      const num = scanner.matchNumber(input, pos);
      if (num) {
        pos += num.length;
        return leaf('NUMBER', num);
      }
    }

    // EN_LOWERCASE
    const el = scanner.matchEnLowercase(input, pos);
    if (el) {
      pos += el.length;
      return leaf('EN_LOWERCASE', el);
    }

    // NUMBER without ⠼ prefix (bare digits)
    if (!atEnd() && scanner.isNumberBraille(peek())) {
      const num = scanner.matchNumber(input, pos);
      if (num) {
        pos += num.length;
        return leaf('NUMBER', num);
      }
    }

    // OTHER (symbol trie, lowest priority)
    const sym = scanner.matchSymbol(input, pos);
    if (sym) {
      const value = input.slice(pos, pos + sym.length);
      pos += sym.length;
      return leaf('OTHER', value);
    }

    return null;
  }

  // --- Public API ---

  function parse(inputStr) {
    input = inputStr;
    pos = 0;

    // Handle word boundary markers (from Lark grammar: literal backspace U+0008)
    if (matchLiteral('\x08')) {
      const result = parseExp();
      matchLiteral('\x08');
      return result || node('exp', []);
    }

    const result = parseStart();
    return result || node('exp', []);
  }

  return { parse };
}
