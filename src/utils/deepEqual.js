export default function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b)) {
    return true;
  }
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((el, i) => deepEqual(el, b[i]));
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (let [key, val] of a) {
      if (!b.has(key) || !deepEqual(val, b.get(key))) return false;
    }
    return true;
  }
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (let val of a) {
      let hasMatch = false;
      for (let other of b) {
        if (deepEqual(val, other)) {
          hasMatch = true;
          break;
        }
      }
      if (!hasMatch) return false;
    }
    return true;
  }
  if (typeof a === "object" && typeof b === "object") {
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    return keysA.every(k => keysB.includes(k) && deepEqual(a[k], b[k]));
  }

  return false;
}
