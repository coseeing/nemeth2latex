import { compactChildren, leaf, node } from './ast.js';
import { ParseError } from './errors.js';
import { normalizeGrammar } from './grammar-model.js';
import { ParseState } from './state.js';
import { normalizeTerminalMatch } from './terminals.js';

function success(next, value) {
  return { ok: true, next, value };
}

function failure(next) {
  return { ok: false, next };
}

export class ParserCore {
  constructor({ grammar, terminals = {}, startRule } = {}) {
    this.grammar = normalizeGrammar(grammar, startRule);
    this.terminals = terminals;
  }

  parse(input, options = {}) {
    const state = new ParseState(input);
    const result = this.parseRule(this.grammar.start, 0, state);

    if (!result.ok) {
      throw ParseError.fromState(state);
    }

    if (!options.allowPartial && result.next !== input.length) {
      state.recordFailure('EOF', result.next);
      throw ParseError.fromState(state);
    }

    return finalizeResult(this.grammar.start, result.value);
  }

  parseRule(name, pos, state) {
    const cached = state.memoGet(name, pos);
    if (cached) {
      if (state.isInProgress(cached)) {
        state.recordFailure(name, pos);
        return failure(pos);
      }
      return cached;
    }

    const rule = this.grammar.rulesByName.get(name);
    if (!rule) {
      throw new Error(`Unknown grammar rule: ${name}`);
    }

    state.markInProgress(name, pos);
    let result = this.parseExpr(rule.expr, pos, state);

    if (result.ok && rule.alias) {
      result = success(result.next, node(rule.alias, normalizeChildren(result.value)));
    }

    return state.memoSet(name, pos, result);
  }

  parseExpr(expr, pos, state) {
    switch (expr.kind) {
      case 'ref':
        return this.parseRule(expr.name, pos, state);

      case 'seq':
        return this.parseSequence(expr.items, pos, state);

      case 'choice':
        return this.parseChoice(expr.items, pos, state);

      case 'optional':
        return this.parseOptional(expr.item, pos, state);

      case 'repeat':
        return this.parseRepeat(expr, pos, state);

      case 'literal':
        return this.parseLiteral(expr.value, pos, state);

      case 'terminal':
        return this.parseTerminal(expr.name, pos, state);

      case 'alias': {
        const result = this.parseExpr(expr.expr, pos, state);
        if (!result.ok) {
          return result;
        }
        return success(result.next, node(expr.name, normalizeChildren(result.value)));
      }

      case 'not_ahead':
        return this.parseNotAhead(expr.expr, pos, state);

      case 'ahead':
        return this.parseAhead(expr.expr, pos, state);

      default:
        throw new Error(`Unsupported grammar expression kind: ${expr.kind}`);
    }
  }

  parseSequence(items, pos, state) {
    let next = pos;
    const values = [];

    for (const item of items) {
      const result = this.parseExpr(item, next, state);
      if (!result.ok) {
        return result;
      }

      if (result.value != null) {
        values.push(result.value);
      }
      next = result.next;
    }

    return success(next, values);
  }

  parseChoice(items, pos, state) {
    for (const item of items) {
      const result = this.parseExpr(item, pos, state);
      if (result.ok) {
        return result;
      }
    }

    return failure(pos);
  }

  parseOptional(item, pos, state) {
    const result = this.parseExpr(item, pos, state);
    if (!result.ok) {
      return success(pos, null);
    }
    return result;
  }

  parseNotAhead(item, pos, state) {
    const result = this.parseExpr(item, pos, state);
    if (result.ok) {
      state.recordFailure('not-ahead', pos);
      return failure(pos);
    }
    return success(pos, null);
  }

  parseAhead(item, pos, state) {
    const result = this.parseExpr(item, pos, state);
    if (!result.ok) {
      return result;
    }
    return success(pos, null);
  }

  parseRepeat(expr, pos, state) {
    let next = pos;
    let count = 0;
    const values = [];

    while (count < expr.max) {
      const result = this.parseExpr(expr.item, next, state);
      if (!result.ok) {
        break;
      }

      if (result.next === next) {
        throw new Error('Repeat expressions must consume input.');
      }

      if (result.value != null) {
        values.push(result.value);
      }

      next = result.next;
      count += 1;
    }

    if (count < expr.min) {
      state.recordFailure(`repeat(${expr.min})`, next);
      return failure(next);
    }

    return success(next, values);
  }

  parseLiteral(value, pos, state) {
    if (!state.input.startsWith(value, pos)) {
      state.recordFailure(JSON.stringify(value), pos);
      return failure(pos);
    }

    return success(pos + value.length, null);
  }

  parseTerminal(name, pos, state) {
    const matcher = this.terminals[name];
    if (!matcher || typeof matcher.match !== 'function') {
      throw new Error(`Terminal ${name} is not configured.`);
    }

    const match = normalizeTerminalMatch(name, matcher.match(state.input, pos, { state, parser: this }));
    if (!match) {
      state.recordFailure(name, pos);
      return failure(pos);
    }

    return success(pos + match.length, leaf(match.type, match.value));
  }
}

function normalizeChildren(value) {
  if (value == null) {
    return [];
  }

  if (Array.isArray(value)) {
    return compactChildren(value);
  }

  return [value];
}

function finalizeResult(startRule, value) {
  if (value == null) {
    return null;
  }

  if (!Array.isArray(value)) {
    return value;
  }

  const children = compactChildren(value);
  if (children.length === 1) {
    return children[0];
  }

  return node(startRule, children);
}
