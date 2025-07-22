import { useMemo } from 'react';
import { MOBILE_WIDTH } from './useResponsiveManager';

/**
 * Hook per gestire gli stili responsive basati sulla modalità corrente
 * Con la nuova struttura responsive, gli elementi già hanno le proprietà corrette applicate
 * @param {string} currentMode - 'desktop' o 'mobile'
 * @param {object} element - L'elemento con le sue proprietà di stile
 * @returns {object} - Stili responsive calcolati
 */
const useResponsiveStyles = (currentMode, element) => {
  return useMemo(() => {
    const isMobile = currentMode === 'mobile';
    
    // Con la nuova struttura, l'elemento già ha le proprietà corrette per la modalità
    // Non è più necessario calcolare scale factor o trasformazioni
    
    // Adjustments specifici per mobile per garantire usabilità
    const mobileAdjustments = isMobile ? {
      fontSize: element.fontSize ? Math.max(element.fontSize, 14) : 14, // Font minimo di 14px su mobile
      lineHeight: element.lineHeight ? Math.max(element.lineHeight, 1.4) : 1.4, // Line height minimo
      padding: element.padding ? Math.max(element.padding, 8) : 8, // Padding minimo
      // Assicura che gli elementi siano centrati orizzontalmente su mobile
      marginLeft: 'auto',
      marginRight: 'auto',
    } : {};
    
    return {
      fontSize: element.fontSize,
      padding: element.padding,
      borderRadius: element.borderRadius,
      scaleFactor: 1, // Non più necessario scaling manuale
      isMobile,
      ...mobileAdjustments,
    };
  }, [currentMode, element]);
};

export default useResponsiveStyles;
