export type SignupForm = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export type SignupErrors = Partial<Record<keyof SignupForm | "form", string>>

export const validateName = (v: string) => {
  if (!v) return "Name is required"
  if (!/^[A-Za-z\s'-]{2,}$/.test(v)) return "Please enter a valid name"
}

export const validateEmail = (v: string) => {
  if (!v) return "Email is required"
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v)) return "Please enter a valid email"
}

export const validatePassword = (v: string) => {
  if (!v) return "Password is required"
  if (v.length < 8) return "Must be at least 8 characters"
  if (!/[A-Z]/.test(v)) return "Must contain an uppercase letter"
  if (!/[a-z]/.test(v)) return "Must contain a lowercase letter"
  if (!/\d/.test(v)) return "Must contain a number"
  if (!/[@$!%*?&]/.test(v)) return "Must contain a special character (@$!%*?&)"
}

export const validateConfirm = (v: string, pw: string) => {
  if (!v) return "Please confirm your password"
  if (v !== pw) return "Passwords do not match"
}

export const validateSignup = (d: SignupForm): SignupErrors => ({
  name: validateName(d.name),
  email: validateEmail(d.email),
  password: validatePassword(d.password),
  confirmPassword: validateConfirm(d.confirmPassword, d.password),
})

export const signupIsValid = (errors: SignupErrors) =>
  !errors.name && !errors.email && !errors.password && !errors.confirmPassword

export function passwordStrength(pw: string) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[@$!%*?&]/.test(pw)) score++
  return score
}

export function strengthLabel(s: number) {
  if (s <= 1) return { label: "Weak", color: "bg-red-400" }
  if (s <= 3) return { label: "Fair", color: "bg-amber-400" }
  if (s === 4) return { label: "Good", color: "bg-blue-400" }
  return { label: "Strong", color: "bg-emerald-400" }
}
