import * as Sentry from "@sentry/nextjs"

export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  })
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, level)
}

export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user)
}

export function clearUser() {
  Sentry.setUser(null)
}

export { Sentry }

