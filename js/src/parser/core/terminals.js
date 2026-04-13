export function createCustomTerminal(match) {
  return { match };
}

export function createLiteralTerminal(value, options = {}) {
  return createCustomTerminal((input, pos) => {
    if (!input.startsWith(value, pos)) {
      return null;
    }

    return {
      type: options.type,
      value,
      length: value.length,
    };
  });
}

export function createRegexTerminal(pattern, options = {}) {
  const regex = normalizeStickyRegex(pattern, options.flags);

  return createCustomTerminal((input, pos) => {
    regex.lastIndex = pos;
    const match = regex.exec(input);
    if (!match) {
      return null;
    }

    return {
      type: options.type,
      value: match[0],
      length: match[0].length,
    };
  });
}

export function normalizeTerminalMatch(name, match) {
  if (match == null) {
    return null;
  }

  if (typeof match === 'string') {
    return {
      type: name,
      value: match,
      length: match.length,
    };
  }

  if (typeof match !== 'object' || typeof match.length !== 'number') {
    throw new TypeError(`Terminal ${name} returned an invalid match result.`);
  }

  return {
    type: match.type ?? name,
    value: match.value ?? '',
    length: match.length,
  };
}

function normalizeStickyRegex(pattern, flags = '') {
  if (pattern instanceof RegExp) {
    const flagSet = new Set(pattern.flags);
    flagSet.delete('g');
    flagSet.add('y');
    return new RegExp(pattern.source, Array.from(flagSet).join(''));
  }

  const flagSet = new Set(flags);
  flagSet.delete('g');
  flagSet.add('y');
  return new RegExp(pattern, Array.from(flagSet).join(''));
}
