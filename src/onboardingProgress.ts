const STORAGE_KEY = 'launchpad.onboarding.completedStep'
const TOTAL_STEPS = 5
const PROGRESS_EVENT = 'launchpad:onboarding-progress-changed'

function clampStep(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(TOTAL_STEPS, Math.floor(value)))
}

export function getCompletedStep(): number {
  if (typeof window === 'undefined') return 0
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return 0
  return clampStep(Number(raw))
}

export function setCompletedStep(step: number): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, String(clampStep(step)))
  window.dispatchEvent(new Event(PROGRESS_EVENT))
}

export function markStepCompleted(step: number): number {
  const next = Math.max(getCompletedStep(), clampStep(step))
  setCompletedStep(next)
  return next
}

export function getResumeStep(): number {
  const completed = getCompletedStep()
  return Math.min(completed + 1, TOTAL_STEPS)
}

export function resetOnboardingProgress(): void {
  setCompletedStep(0)
}

export function subscribeToOnboardingProgress(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const listener = () => onChange()
  window.addEventListener(PROGRESS_EVENT, listener)
  return () => window.removeEventListener(PROGRESS_EVENT, listener)
}