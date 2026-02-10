import { DriveStep } from 'driver.js'

export const tourSteps: DriveStep[] = [
  {
    element: '[data-tour-objective]',
    popover: {
      title: 'THE ASSIGNMENT',
      description: 'Every case starts here. This is your beat, detective. The objective shifts as you crack deeper into the investigation.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour-suspects]',
    popover: {
      title: 'THE LINEUP',
      description: 'Each member of Reginald\'s inner circle has secrets. Click their image to review their dossier and interrogate them.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour-documents]',
    popover: {
      title: 'PAPER TRAIL',
      description: 'The truth hides in the fine print. These documents hold the keys to cracking the case wide open, review them carefully.',
      side: 'left',
      align: 'start',
      popoverOffset: 20,
    },
    onHighlightStarted: (element) => {
      // Scroll the element into view instantly to avoid glitches
      if (element) {
        element.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' })
      }
    },
  },
  {
    element: '[data-tour-scenes]',
    popover: {
      title: 'SCENE OF THE CRIME',
      description: 'Photographs don\'t lie. Study every shadow, every detail. In this line of work, the truth is hidden in what you choose to ignore.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-tour-quick-note]',
    popover: {
      title: 'FIELD NOTES',
      description: 'A good detective keeps notes. Theories, hunches, patterns - jot them down before they vanish like smoke in the night.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour-investigation-board]',
    popover: {
      title: 'THE BOARD',
      description: 'This is where it all comes together. Pin your evidence, draw connections. The red string never lies, follow it to the truth.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour-hint]',
    popover: {
      title: 'NEED A LEAD?',
      description: 'Sometimes you hit a dead end. Click here when the trail goes cold and you need a nudge in the right direction.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    popover: {
      title: 'MAKE THEM TALK',
      description: 'When you\'re questioning suspects, show them what you\'ve got. Attach documents and photos to back up your accusations. That\'s how you break them.',
      side: 'top',
      align: 'center',
    },
  },
]
