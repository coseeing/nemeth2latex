export class ParseError extends Error {
  constructor({ position, expected, found, input }) {
    const foundValue = found == null ? 'EOF' : JSON.stringify(found);
    const expectedValue = expected.length > 0 ? expected.join(', ') : 'input';
    super(`Parse failed at position ${position}: expected ${expectedValue}, found ${foundValue}`);

    this.name = 'ParseError';
    this.position = position;
    this.expected = expected;
    this.found = found;
    this.input = input;
  }

  static fromState(state) {
    const failure = state.getFailure();
    return new ParseError({
      ...failure,
      input: state.input,
    });
  }
}
