function expression(kind, fields = {}) {
  return { kind, ...fields };
}

export function rule(name, expr, options = {}) {
  return {
    name,
    expr,
    ...options,
  };
}

export function ref(name) {
  return expression('ref', { name });
}

export function seq(...items) {
  return expression('seq', { items: items.flat() });
}

export function choice(...items) {
  return expression('choice', { items: items.flat() });
}

export function optional(item) {
  return expression('optional', { item });
}

export function repeat(item, min = 0, max = Infinity) {
  return expression('repeat', { item, min, max });
}

export function literal(value) {
  return expression('literal', { value });
}

export function terminal(name) {
  return expression('terminal', { name });
}

export function alias(expr, name) {
  return expression('alias', { expr, name });
}

export function notAhead(expr) {
  return expression('not_ahead', { expr });
}

export function ahead(expr) {
  return expression('ahead', { expr });
}

export function createGrammar({ start, rules }) {
  const rulesByName = new Map();

  for (const item of rules) {
    rulesByName.set(item.name, item);
  }

  return {
    start,
    rules,
    rulesByName,
  };
}

export function normalizeGrammar(grammar, startRule) {
  if (!grammar || typeof grammar !== 'object') {
    throw new TypeError('Grammar definition must be an object.');
  }

  const start = startRule ?? grammar.start;
  if (!start) {
    throw new Error('Grammar must declare a start rule.');
  }

  if (grammar.rulesByName instanceof Map) {
    return {
      start,
      rules: grammar.rules ?? Array.from(grammar.rulesByName.values()),
      rulesByName: grammar.rulesByName,
    };
  }

  if (!Array.isArray(grammar.rules)) {
    throw new Error('Grammar must provide a rules array or rulesByName map.');
  }

  return createGrammar({ start, rules: grammar.rules });
}
