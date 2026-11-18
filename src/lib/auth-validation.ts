const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type EmailMessages = { required: string; invalid: string }
type PasswordMessages = { required: string; tooShort: string }
type ConfirmPasswordMessages = { required: string; mismatch: string }

export function validateEmail(
  value: string,
  messages: EmailMessages
): string | undefined {
  const email = value.trim()

  if (!email) return messages.required
  if (!EMAIL_PATTERN.test(email)) return messages.invalid

  return undefined
}

export function validatePassword(
  value: string,
  messages: PasswordMessages
): string | undefined {
  if (!value) return messages.required
  if (value.length < 8) return messages.tooShort

  return undefined
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
  messages: ConfirmPasswordMessages
): string | undefined {
  if (!confirmPassword) return messages.required
  if (password !== confirmPassword) return messages.mismatch

  return undefined
}

export function validateRequired(
  value: string,
  message: string
): string | undefined {
  if (!value.trim()) return message

  return undefined
}
