export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function isValidEAN(code: string): boolean {
  if (!/^\d{8}$|^\d{13}$/.test(code)) return false

  const digits = code.split('').map(Number)
  const checkDigit = digits.pop()!
  
  const sum = digits.reduce((acc, digit, index) => {
    // EAN-13: posiciones pares x1, impares x3
    // EAN-8: igual pero con 7 dígitos
    const multiplier = index % 2 === 0 ? 1 : 3
    return acc + digit * multiplier
  }, 0)

  const calculated = (10 - (sum % 10)) % 10
  return calculated === checkDigit
}