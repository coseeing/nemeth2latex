export function compactChildren(children) {
  const compacted = [];

  for (const child of children) {
    if (child == null) {
      continue;
    }

    if (Array.isArray(child)) {
      compacted.push(...compactChildren(child));
      continue;
    }

    compacted.push(child);
  }

  return compacted;
}

export function node(type, children = []) {
  return {
    type,
    children: compactChildren(children),
  };
}

export function leaf(type, value) {
  return { type, value };
}
