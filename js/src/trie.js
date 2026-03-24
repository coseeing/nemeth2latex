class TrieNode {
  constructor() {
    this.children = new Map();
    this.value = undefined;
    this.hasValue = false;
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(key, value) {
    let node = this.root;
    for (const ch of key) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode());
      }
      node = node.children.get(ch);
    }
    node.value = value;
    node.hasValue = true;
  }

  /**
   * Find the longest matching key starting at str[startIndex].
   * Returns { value, length } or null if no match.
   */
  longestMatch(str, startIndex = 0) {
    let node = this.root;
    let lastMatchValue = undefined;
    let lastMatchLen = 0;

    for (let i = startIndex; i < str.length; i++) {
      const ch = str[i];
      if (!node.children.has(ch)) break;
      node = node.children.get(ch);
      if (node.hasValue) {
        lastMatchValue = node.value;
        lastMatchLen = i - startIndex + 1;
      }
    }

    return lastMatchLen > 0 ? { value: lastMatchValue, length: lastMatchLen } : null;
  }
}
