const IN_PROGRESS = Symbol('IN_PROGRESS');

export class ParseState {
  constructor(input) {
    this.input = input;
    this.memo = new Map();
    this.farthestFailure = {
      position: -1,
      expected: new Set(),
      found: input[0] ?? null,
    };
  }

  atEnd(pos) {
    return pos >= this.input.length;
  }

  save(pos) {
    return pos;
  }

  restore(pos) {
    return pos;
  }

  slice(from, to) {
    return this.input.slice(from, to);
  }

  memoKey(ruleName, pos) {
    return `${ruleName}@${pos}`;
  }

  memoGet(ruleName, pos) {
    return this.memo.get(this.memoKey(ruleName, pos));
  }

  memoSet(ruleName, pos, result) {
    this.memo.set(this.memoKey(ruleName, pos), result);
    return result;
  }

  markInProgress(ruleName, pos) {
    this.memo.set(this.memoKey(ruleName, pos), IN_PROGRESS);
  }

  isInProgress(result) {
    return result === IN_PROGRESS;
  }

  recordFailure(expected, pos) {
    if (pos > this.farthestFailure.position) {
      this.farthestFailure = {
        position: pos,
        expected: new Set([expected]),
        found: this.input[pos] ?? null,
      };
      return;
    }

    if (pos === this.farthestFailure.position) {
      this.farthestFailure.expected.add(expected);
    }
  }

  getFailure() {
    return {
      position: Math.max(this.farthestFailure.position, 0),
      expected: Array.from(this.farthestFailure.expected).sort(),
      found: this.farthestFailure.found,
    };
  }
}
