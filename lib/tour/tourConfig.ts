import { Config } from 'driver.js'

export const tourConfig: Config = {
  showProgress: true,
  allowClose: false, // Prevent closing the tour, force users to complete it
  overlayClickNext: false, // Prevent clicking overlay from closing or advancing
  smoothScroll: false, // Disable smooth scrolling to prevent misalignment
  animate: true,
  doneBtnText: 'Finish',
  nextBtnText: 'Next',
  prevBtnText: 'Back',
  showButtons: ['next', 'previous'], // Removed 'close' button
  disableActiveInteraction: true, // Prevent interaction with highlighted elements
  overlayOpacity: 0.60, // Overlay darkness (0-1) - lighter for better visibility
  stagePadding: 20, // Padding around highlighted element
  stageRadius: 2, // Border radius of stage cutout
  
  onDestroyed: () => {
    // Cleanup when tour is destroyed
  },
  
  onDeselected: () => {
    // Called when moving to next step
  },
}
