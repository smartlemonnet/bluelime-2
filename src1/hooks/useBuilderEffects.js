import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Questo hook è ora vuoto o potrebbe essere rimosso se non più necessario.
// Per ora, lo lascio intatto ma non utilizzato da Builder.jsx,
// in linea con la strategia di disattivarlo temporaneamente.
// Se si decide di eliminarlo completamente, questo file può essere cancellato.

const useBuilderEffects = ({
  session,
  layoutManager,
  setElements,
  historyManager,
  setIsAuthCheckedAndLoaded,
  // Non ci sono più dipendenze per la gestione dei tasti qui
}) => {
  
  // Il primo useEffect (checkAuthAndLoadLayout) è stato spostato in Builder.jsx
  // useEffect(() => {
  //   const checkAuthAndLoadLayout = async () => {
  //     if (session) {
  //       const { data: { user } } = await supabase.auth.getUser();
  //       if (user) {
  //         await layoutManager.loadLastLayout(user.id, setElements, historyManager.clearHistory);
  //       }
  //     }
  //     setIsAuthCheckedAndLoaded(true);
  //   };
  //   checkAuthAndLoadLayout();
  // }, [session, layoutManager, setElements, historyManager, setIsAuthCheckedAndLoaded]);

  // Il secondo useEffect (handleKeyDown) è stato svuotato e le sue dipendenze rimosse
  // useEffect(() => {
  //   const handleKeyDown = (event) => {
  //     // Logica rimossa
  //   };

  //   document.addEventListener('keydown', handleKeyDown);
  //   return () => {
  //     document.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, []); 
};

export default useBuilderEffects;