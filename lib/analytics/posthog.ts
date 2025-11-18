import posthog from "posthog-js"

export function initPostHog() {
  if (typeof window !== "undefined") {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com"

    if (posthogKey && process.env.NODE_ENV === "production") {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === "development") posthog.debug()
        },
        capture_pageview: false, // We'll manually capture pageviews
        capture_pageleave: true,
      })
    }
  }
}

export function captureEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    posthog.capture(eventName, properties)
  }
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    posthog.identify(userId, properties)
  }
}

export function resetUser() {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    posthog.reset()
  }
}

export { posthog }

