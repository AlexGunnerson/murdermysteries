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
        const currentIndex = step.popover?.currentStep ?? 0
        setTutorialStep(currentIndex + 1)
        
        // Update checklist progress based on step
        switch (currentIndex) {
          case 0:
            updateChecklistProgress('viewedObjective', true)
            break
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
        
        driverObj.moveNext()
      },
      onPrevClick: (element, step, options) => {
        const currentIndex = options.state.activeIndex ?? 0
        if (currentIndex > 0) {
          setTutorialStep(currentIndex - 1)
          driverObj.movePrevious()
        }
      },
      onCloseClick: () => {
        dismissTutorial()
        driverObj.destroy()
      },
      onDestroyed: (element, step, options) => {
        const currentIndex = step?.popover?.currentStep ?? 0
        const totalSteps = tourSteps.length
        
        // If completed all steps, mark tutorial as complete
        if (currentIndex === totalSteps - 1) {
          completeTutorial()
        }
      },
    })

    driverRef.current = driverObj

    // Scroll to top instantly to ensure objective is in correct position
    window.scrollTo({ top: 0, behavior: 'auto' })

    // Start the tour with steps
    driverObj.setSteps(tourSteps)
    
    // Resume from saved step if applicable
    if (tutorialStep > 0 && tutorialStep < tourSteps.length) {
      driverObj.drive(tutorialStep)
    } else {
      driverObj.drive()
    }

    // Cleanup
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy()
      }
    }
  }, [
    tutorialStarted,
    tutorialCompleted,
    tutorialStep,
    setTutorialStep,
    completeTutorial,
    dismissTutorial,
    updateChecklistProgress,
  ])

  // This component doesn't render anything visible
  return null
}
