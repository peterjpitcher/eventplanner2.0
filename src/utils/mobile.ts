'use client';

/**
 * Mobile device detection and optimization utilities
 */

/**
 * Check if the user agent string indicates a mobile device
 * This is useful for server-side detection
 */
export function isMobileUserAgent(userAgent: string): boolean {
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent);
}

/**
 * Debounce a function to improve performance on mobile
 * Useful for scroll and resize handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get device orientation (portrait or landscape)
 * Returns 'portrait' or 'landscape'
 */
export function getDeviceOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'portrait';
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

/**
 * Determine if the device is touch-capable
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Add viewport height fix for mobile browsers
 * Addresses the issue with 100vh not working correctly on mobile browsers
 */
export function applyMobileViewportFix(): void {
  if (typeof window === 'undefined') return;
  
  // Set a CSS variable with the actual viewport height
  const setViewportHeight = () => {
    document.documentElement.style.setProperty(
      '--vh', 
      `${window.innerHeight * 0.01}px`
    );
  };
  
  // Set initially and on resize
  setViewportHeight();
  
  // Use debounced function for resize event
  const debouncedSetViewportHeight = debounce(setViewportHeight, 100);
  window.addEventListener('resize', debouncedSetViewportHeight);
}

/**
 * Optimize images for mobile by returning appropriate size
 * @param defaultSrc - Default image URL
 * @param mobileSrc - Mobile-optimized image URL
 * @param breakpoint - Width breakpoint to switch to mobile image (default: 768px)
 */
export function getResponsiveImageSrc(
  defaultSrc: string,
  mobileSrc: string,
  breakpoint: number = 768
): string {
  if (typeof window === 'undefined') return defaultSrc;
  return window.innerWidth <= breakpoint ? mobileSrc : defaultSrc;
} 