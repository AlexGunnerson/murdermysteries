'use client'

import { useEffect, useRef } from 'react'
import { driver, Driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import './tour-styles.css'
import { useGameState } from '@/lib/hooks/useGameState'
import { tourSteps } from '@/lib/tour/tourSteps'
import { tourConfig } from '@/lib/tour/tourConfig'

export default function OnboardingTour() {
  const driverRef = useRef<Driver | null>(null)
  const currentStepRef = useRef<number>(0) // Track current step with a ref
  const {
    tutorialStarted,
    tutorialStep,
    tutorialCompleted,
    setTutorialStep,
    completeTutorial,
    dismissTutorial,
    updateChecklistProgress,
  } = useGameState()

  useEffect(() => {
    // Don't initialize if tutorial is completed or not started
    if (tutorialCompleted || !tutorialStarted) {
      return
    }
    // Initialize driver.js
    const driverObj = driver({
      ...tourConfig,
      onNextClick: (element, step, options) => {
        const totalSteps = tourSteps.length
        const currentIndex = currentStepRef.current
        
        // Update checklist progress based on step
        switch (currentIndex) {
          case 1:
            updateChecklistProgress('viewedSuspect', true)
            break
          case 2:
            updateChecklistProgress('viewedDocument', true)
            break
          case 3:
            updateChecklistProgress('viewedScene', true)
            break
        }
        
        // If on the last step and clicking "Finish", complete the tutorial
        if (currentIndex === totalSteps - 1) {
          completeTutorial()
        }
        
        // Increment the step counter AFTER checking for completion
        currentStepRef.current = currentIndex + 1
        setTutorialStep(currentIndex + 1)
        
        driverObj.moveNext()
      },
      onPrevClick: (element, step, options) => {
        const currentIndex = currentStepRef.current
        if (currentIndex > 0) {
          currentStepRef.current = currentIndex - 1
          setTutorialStep(currentIndex - 1)
          driverObj.movePrevious()
        }
      },
      onDestroyed: (element, step, options) => {
        const totalSteps = tourSteps.length
        const currentIndex = currentStepRef.current
        
        // If completed all steps, mark tutorial as complete
        if (currentIndex >= totalSteps) {
          completeTutorial()
        }
      },
    })

    driverRef.current = driverObj

    // Reset step counter
    currentStepRef.current = 0

    // Scroll to top instantly to ensure objective is in correct position
    window.scrollTo({ top: 0, behavior: 'auto' })

    // Start the tour with steps from the beginning
    driverObj.setSteps(tourSteps)
    driverObj.drive()

    // Cleanup
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy()
      }
    }
  }, [
    tutorialStarted,
    tutorialCompleted,
    // Removed tutorialStep from dependencies to prevent driver from being recreated on each step
    setTutorialStep,
    completeTutorial,
    dismissTutorial,
    updateChecklistProgress,
  ])

  // This component doesn't render anything visible
  return null
}
