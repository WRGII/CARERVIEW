export type PasswordStrength = 'weak' | 'fair' | 'strong'

export interface PasswordValidationResult {
  valid: boolean
  strength: PasswordStrength
  unmetRules: string[]
}

export function validatePassword(password: string): PasswordValidationResult {
  const unmetRules: string[] = []

  if (password.length < 8) unmetRules.push('min_length')
  if (!/[0-9]/.test(password)) unmetRules.push('needs_number')
  if (!/[A-Z]/.test(password)) unmetRules.push('needs_uppercase')

  const metCount = 3 - unmetRules.length
  const strength: PasswordStrength =
    metCount === 3 ? 'strong' : metCount === 2 ? 'fair' : 'weak'

  return {
    valid: unmetRules.length === 0,
    strength,
    unmetRules,
  }
}
