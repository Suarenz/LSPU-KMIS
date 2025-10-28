import { useEffect, useLayoutEffect } from 'react';

// Custom hook to safely use useLayoutEffect on client and useEffect on server
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;