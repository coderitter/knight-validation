export default function fieldsEqual(a1?: string[], a2?: string[]): boolean {
  if (! a1 || ! a2) {
    return false
  }

  if (a1.length != a2.length) {
    return false
  }

  for (let i = 0; i < a1.length; i++) {
    if (a2.indexOf(a1[i]) == -1) {
      return false
    }
  }

  return true
}
