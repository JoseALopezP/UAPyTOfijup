export default function deepEqual(a, b) {
  if (a === b) return true;

  // Handle NaN
  if (typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b)) {
    return true;
  }

  // Different types
  if (typeof a !== typeof b) return false;

  // Null check
  if (a === null || b === null) return false;

  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((el, i) => deepEqual(el, b[i]));
  }

  // Dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // RegExp
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }

  // Map
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (let [key, val] of a) {
      if (!b.has(key) || !deepEqual(val, b.get(key))) return false;
    }
    return true;
  }

  // Set
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (let val of a) {
      // We can’t just check b.has(val) because val could be an object
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

  // Objects
  if (typeof a === "object" && typeof b === "object") {
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    return keysA.every(k => keysB.includes(k) && deepEqual(a[k], b[k]));
  }

  return false;
}
