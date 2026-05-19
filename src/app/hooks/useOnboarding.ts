const ONBOARDING_KEY = "sbpocket_onboarding_seen";

export function hasSeenOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function markOnboardingAsSeen(): void {
  localStorage.setItem(ONBOARDING_KEY, "true");
}

export function shouldRunOnboarding(): boolean {
  return !hasSeenOnboarding();
}

export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDING_KEY);
}
