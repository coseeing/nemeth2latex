import { createCustomTerminal } from './core/index.js';

function buildConstMatcher(scanner) {
  return (input, pos) => {
    const uppercaseContinue = scanner.matchEnUppercaseContinue(input, pos);
    if (uppercaseContinue) {
      return {
        type: 'EN_UPPERCASE_CONTINUE',
        value: uppercaseContinue,
        length: uppercaseContinue.length,
      };
    }

    const uppercase = scanner.matchEnUppercase(input, pos);
    if (uppercase) {
      return {
        type: 'EN_UPPERCASE',
        value: uppercase,
        length: uppercase.length,
      };
    }

    if (
      input[pos] === '⠼' &&
      pos + 1 < input.length &&
      scanner.isNumberBraille(input[pos + 1])
    ) {
      const number = scanner.matchNumber(input, pos);
      if (number) {
        return {
          type: 'NUMBER',
          value: number,
          length: number.length,
        };
      }
    }

    const lowercase = scanner.matchEnLowercase(input, pos);
    if (lowercase) {
      return {
        type: 'EN_LOWERCASE',
        value: lowercase,
        length: lowercase.length,
      };
    }

    if (input[pos] && scanner.isNumberBraille(input[pos])) {
      const number = scanner.matchNumber(input, pos);
      if (number) {
        return {
          type: 'NUMBER',
          value: number,
          length: number.length,
        };
      }
    }

    const symbol = scanner.matchSymbol(input, pos);
    if (symbol) {
      const value = input.slice(pos, pos + symbol.length);
      return {
        type: 'OTHER',
        value,
        length: value.length,
      };
    }

    return null;
  };
}

export function createNemethTerminals(scanner) {
  return {
    CONST: createCustomTerminal(buildConstMatcher(scanner)),
    OPERAND: createCustomTerminal((input, pos) => {
      const match = scanner.matchOperand(input, pos);
      if (!match) {
        return null;
      }

      return {
        type: 'OPERAND',
        value: match,
        length: match.length,
      };
    }),
    NUMBER: createCustomTerminal((input, pos) => {
      const match = scanner.matchNumber(input, pos);
      if (!match) {
        return null;
      }

      return {
        type: 'NUMBER',
        value: match,
        length: match.length,
      };
    }),
    BPUO: createCustomTerminal((input, pos) => {
      const match = scanner.matchBPUO(input, pos);
      if (!match) {
        return null;
      }

      return {
        type: 'BPUO',
        value: match,
        length: match.length,
      };
    }),
    EN_LOWERCASE: createCustomTerminal((input, pos) => {
      const match = scanner.matchEnLowercase(input, pos);
      if (!match) {
        return null;
      }

      return {
        type: 'EN_LOWERCASE',
        value: match,
        length: match.length,
      };
    }),
    EN_UPPERCASE: createCustomTerminal((input, pos) => {
      const match = scanner.matchEnUppercase(input, pos);
      if (!match) {
        return null;
      }

      return {
        type: 'EN_UPPERCASE',
        value: match,
        length: match.length,
      };
    }),
    EN_UPPERCASE_CONTINUE: createCustomTerminal((input, pos) => {
      const match = scanner.matchEnUppercaseContinue(input, pos);
      if (!match) {
        return null;
      }

      return {
        type: 'EN_UPPERCASE_CONTINUE',
        value: match,
        length: match.length,
      };
    }),
    OTHER: createCustomTerminal((input, pos) => {
      const match = scanner.matchSymbol(input, pos);
      if (!match) {
        return null;
      }

      const value = input.slice(pos, pos + match.length);
      return {
        type: 'OTHER',
        value,
        length: value.length,
      };
    }),
  };
}
