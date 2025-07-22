import { useState, useCallback, useEffect } from 'react';

// Fix #2: Canvas Desktop deve essere sempre 1920x1080 per editing
const DESKTOP_CANVAS_WIDTH = 1920; // Dimensioni fisse per canvas desktop
const DESKTOP_CANVAS_HEIGHT = 1080;

// Legge le dimensioni reali del device per scaling e preview
const getDeviceWidth = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth;
  }
  return 1920;
};

export const DESKTOP_WIDTH = DESKTOP_CANVAS_WIDTH; // Canvas desktop sempre 1920px
export const MOBILE_WIDTH = 390;

const useResponsiveManager = () => {
  // Inizia sempre in modalità desktop
  const [currentMode, setCurrentMode] = useState('desktop');
  const [deviceWidth, setDeviceWidth] = useState(getDeviceWidth());
  const [mobileActivated, setMobileActivated] = useState(false);

  // Aggiorna le dimensioni del device quando la finestra cambia
  useEffect(() => {
    const handleResize = () => {
      setDeviceWidth(getDeviceWidth());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const switchToDesktop = useCallback(() => {
    setCurrentMode('desktop');
  }, []);

  const switchToMobile = useCallback(() => {
    setCurrentMode('mobile');
    if (!mobileActivated) {
      setMobileActivated(true);
    }
  }, [mobileActivated]);

  const getCurrentCanvasWidth = useCallback(() => {
    // Fix: Desktop canvas sempre 1920px, mobile 390px
    return currentMode === 'desktop' ? DESKTOP_CANVAS_WIDTH : MOBILE_WIDTH;
  }, [currentMode]);
  
  const getCurrentCanvasHeight = useCallback(() => {
    // Fix: Altezza canvas per desktop sempre 1080px
    return currentMode === 'desktop' ? DESKTOP_CANVAS_HEIGHT : 'auto';
  }, [currentMode]);

  const getScaleFactor = useCallback(() => {
    // Fix: Scale factor basato sulle dimensioni reali del canvas vs viewport
    if (currentMode === 'mobile') {
      return MOBILE_WIDTH / Math.min(deviceWidth, MOBILE_WIDTH);
    }
    // Per desktop, calcola scaling per fit nel viewport se necessario
    return Math.min(1, (deviceWidth - 100) / DESKTOP_CANVAS_WIDTH); // -100px per margini
  }, [currentMode, deviceWidth]);

  const isDesktop = useCallback(() => {
    return currentMode === 'desktop';
  }, [currentMode]);

  const isMobile = useCallback(() => {
    return currentMode === 'mobile';
  }, [currentMode]);

  return {
    currentMode,
    switchToDesktop,
    switchToMobile,
    getCurrentCanvasWidth,
    getCurrentCanvasHeight,
    getScaleFactor,
    isDesktop,
    isMobile,
    mobileActivated,
    deviceWidth,
    DESKTOP_WIDTH: DESKTOP_CANVAS_WIDTH,
    DESKTOP_HEIGHT: DESKTOP_CANVAS_HEIGHT,
    MOBILE_WIDTH,
  };
};

export default useResponsiveManager;