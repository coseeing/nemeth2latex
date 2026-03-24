/**
 * Transforms a parse tree into a LaTeX string.
 * Corresponds to nemeth/transformer.py Nemeth2TexTransformer.
 */
export function createTransformer(symbolData, letterData, numberData) {
  // Build sorted maps (longest key first) for greedy replacement
  const symbolMap = sortByKeyLength(symbolData);
  const letterMap = sortByKeyLength(letterData);
  const numberMap = sortByKeyLength(numberData);

  function sortByKeyLength(data) {
    return Object.entries(data).sort((a, b) => b[0].length - a[0].length);
  }

  /**
   * Greedy string replacement using a sorted map (longest key first).
   * Replicates Python transformer.translate().
   */
  function translate(str, map) {
    for (const [key, value] of map) {
      str = str.replaceAll(key, value);
    }
    return str;
  }

  /**
   * Wrap items in curly braces if they are multi-character.
   * Replicates Python transformer.curly_brace().
   */
  function curlyBrace(items) {
    return items.map((item) => {
      if (item.length !== 1) {
        return '{' + item + '}';
      }
      return item;
    });
  }

  // --- Node handlers ---

  const handlers = {
    exp(node) {
      return node.children.map(transformNode).join('');
    },

    exp_sup(node) {
      const items = curlyBrace(node.children.map(transformNode));
      return items[0] + '^' + items[1];
    },

    exp_sub(node) {
      const items = curlyBrace(node.children.map(transformNode));
      return items[0] + '_' + items[1];
    },

    exp_sup_simple(node) {
      const items = curlyBrace(node.children.map(transformNode));
      return items[0] + '^' + items[1];
    },

    exp_sub_simple(node) {
      const items = curlyBrace(node.children.map(transformNode));
      return items[0] + '_' + items[1];
    },

    exp_under(node) {
      const items = node.children.map(transformNode);
      return '\\underset{' + items[1] + '}{' + items[0] + '}';
    },

    exp_over(node) {
      const items = node.children.map(transformNode);
      return '\\overset{' + items[1] + '}{' + items[0] + '}';
    },

    exp_underover(node) {
      const items = node.children.map(transformNode);
      return (
        '\\overset{' +
        items[2] +
        '}{\\underset{' +
        items[1] +
        '}{' +
        items[0] +
        '}}'
      );
    },

    exp_subsup_symbol(node) {
      const items = node.children.map(transformNode);
      const symbol = translate(items[0], symbolMap).trim();
      return symbol + '_{' + items[1] + '}^{' + items[2] + '}';
    },

    exp_underover_symbol(node) {
      const items = node.children.map(transformNode);
      const symbol = translate(items[0], symbolMap).trim();
      return symbol + '_{' + items[1] + '}^{' + items[2] + '}';
    },

    exp_frac(node) {
      const items = node.children.map(transformNode);
      return '\\frac{' + items[0] + '}{' + items[1] + '}';
    },

    exp_mixed_number(node) {
      const items = node.children.map(transformNode);
      return items[0] + '\\frac{' + items[1] + '}{' + items[2] + '}';
    },

    exp_sqrt(node) {
      const items = node.children.map(transformNode);
      return '\\sqrt{' + items[0] + '}';
    },

    exp_root(node) {
      const items = node.children.map(transformNode);
      return '\\sqrt[' + items[0] + ']{' + items[1] + '}';
    },

    exp_line(node) {
      const items = node.children.map(transformNode);
      return '\\overleftrightarrow{' + items[0] + '}';
    },

    exp_line_segment(node) {
      const items = node.children.map(transformNode);
      return '\\overline{' + items[0] + '}';
    },

    exp_ray(node) {
      const items = node.children.map(transformNode);
      return '\\overrightarrow{' + items[0] + '}';
    },

    exp_arc(node) {
      const items = node.children.map(transformNode);
      return '\\overset{\\frown}{' + items[0] + '}';
    },

    exp_vector(node) {
      const items = node.children.map(transformNode);
      return '\\vec{' + items[0] + '}';
    },

    exp_binom(node) {
      const items = node.children.map(transformNode);
      return '\\binom{' + items[1] + '}{' + items[0] + '}';
    },

    exp_limit(node) {
      const items = node.children.map(transformNode);
      return '\\lim_{{' + items[0] + '} \\to {' + items[1] + '}}';
    },

    exp_parenthesis(node) {
      const items = node.children.map(transformNode);
      return '(' + items.join('') + ')';
    },

    exp_square_bracket(node) {
      const items = node.children.map(transformNode);
      return '[' + items.join('') + ']';
    },

    exp_curly_brace(node) {
      const items = node.children.map(transformNode);
      return '\\{' + items.join('') + '\\}';
    },
  };

  // --- Leaf handlers ---

  function handleLeaf(node) {
    switch (node.type) {
      case 'EN_UPPERCASE': {
        const raw = node.value.replace(/⠠/g, '');
        return translate(raw, letterMap).toUpperCase();
      }
      case 'EN_LOWERCASE': {
        return translate(node.value, letterMap);
      }
      case 'EN_UPPERCASE_CONTINUE': {
        let uppercases, lowercases;
        const parts = node.value.split('⠠⠄');
        if (parts.length === 2) {
          uppercases = parts[0];
          lowercases = parts[1];
        } else {
          uppercases = parts[0];
          lowercases = '';
        }
        uppercases = uppercases.replace(/⠠/g, '');
        return (
          translate(uppercases, letterMap).toUpperCase() +
          translate(lowercases, letterMap)
        );
      }
      case 'NUMBER': {
        const raw = node.value.replace(/⠼/g, '');
        return translate(raw, numberMap).replace(/⠨/g, '.');
      }
      case 'OPERAND':
      case 'OTHER': {
        return translate(node.value, symbolMap);
      }
      case 'BPUO': {
        return node.value; // BPUO value is kept as-is for subsup_symbol
      }
      default:
        return '';
    }
  }

  function transformNode(node) {
    if (!node) return '';

    // Leaf node
    if (node.value !== undefined) {
      return handleLeaf(node);
    }

    // Composite node
    const handler = handlers[node.type];
    if (handler) {
      return handler(node);
    }

    // Fallback: join children
    return node.children.map(transformNode).join('');
  }

  function transform(tree) {
    if (!tree) return '';
    return transformNode(tree);
  }

  return { transform };
}
