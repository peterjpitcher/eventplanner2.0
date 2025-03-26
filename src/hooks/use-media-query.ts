'use client';

import { useState, useEffect } from 'react';

/**
 * A hook that returns whether the window matches a media query
 * @param query The media query to match
 * @returns Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Create a media query list for the provided query
    const mediaQueryList = window.matchMedia(query);
    
    // Set the initial value
    setMatches(mediaQueryList.matches);
    
    // Define listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add the listener to the media query list
    mediaQueryList.addEventListener('change', listener);
    
    // Clean up function
    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query]);
  
  return matches;
} 