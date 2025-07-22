
import { useState, useEffect } from 'react';
import useLayoutManager from '@/hooks/useLayoutManager';
import useElementManager from '@/hooks/useElementManager';
import useHistoryManager from '@/hooks/useHistoryManager';
import useViewManager from '@/hooks/useViewManager';
import useInteractionManager from '@/hooks/useInteractionManager';
import useExportLayout from '@/hooks/useExportLayout.js';
import useResponsiveManager from '@/hooks/useResponsiveManager';
import useBlockManager from '@/hooks/useBlockManager';
import { supabase } from '@/lib/supabaseClient';

const useBuilderState = (session, toast) => {
  const [selectedElementIds, setSelectedElementIds] = useState([]);

  const responsiveManager = useResponsiveManager();
  
  const {
    elements, 
    setElements,
    addElement: addElementToManager,
    addBlock: addBlockToManager,
    updateElement: updateElementInManager,
    updateMultipleElements: updateMultipleElementsInManager,
    removeElement: removeElementFromManager,
    duplicateElement: duplicateElementInManager,
    changeElementLayerOrder: changeElementLayerOrderInManager,
    groupElements: groupElementsInManager,
    ungroupElements: ungroupElementsInManager,
    applyMobileVerticalLayout,
    switchMode,
    migrateAllElementsToResponsive,
  } = useElementManager(toast, selectedElementIds, setSelectedElementIds, responsiveManager.currentMode);

  const layoutManager = useLayoutManager(toast);
  const blockManager = useBlockManager(toast);
  
  const historyManager = useHistoryManager(
    { elements: [], pageBackgroundColor: '#485060' }
  );

  const interactionManager = useInteractionManager(elements, setSelectedElementIds);
  const exportManager = useExportLayout();

  const [isAuthCheckedAndLoaded, setIsAuthCheckedAndLoaded] = useState(false);
  
  const [propertiesPanelVisible, setPropertiesPanelVisible] = useState(true);
  const [propertiesPanelPosition, setPropertiesPanelPosition] = useState({ x: window.innerWidth - 306 - 20, y: 80 });
  const propertiesPanelWidth = 306;
  const [propertiesPanelHeight, setPropertiesPanelHeight] = useState(600);

  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 20, y: 80 });
  const toolbarWidth = 78;
  const [toolbarHeight, setToolbarHeight] = useState(Math.min(500, window.innerHeight - 160));
  
  useEffect(() => {
    const initializeOrLoad = async () => {
      if (session && !layoutManager.isInitialLoadDone) {
        const loadedData = await layoutManager.loadLayout();
        if (loadedData && loadedData.content) {
          const initialState = { elements: loadedData.content, pageBackgroundColor: loadedData.page_background_color };
          setElements(loadedData.content);
          historyManager.setHistory([initialState]);
          historyManager.setCurrentHistoryIndex(0);
        } else {
          const initialState = { elements: [], pageBackgroundColor: '#485060' };
          setElements([]);
          historyManager.setHistory([initialState]);
          historyManager.setCurrentHistoryIndex(0);
          layoutManager.resetLayoutState();
        }
        layoutManager.setIsInitialLoadDone(true);
      }
      setIsAuthCheckedAndLoaded(true);
    };
    initializeOrLoad();
  }, [session, layoutManager.isInitialLoadDone, setElements, historyManager, layoutManager]);


  return {
    elements, setElements,
    selectedElementIds, setSelectedElementIds,
    layoutManager,
    blockManager,
    historyManager,
    elementManager: { 
      addElement: addElementToManager, 
      addBlock: addBlockToManager,
      updateElement: updateElementInManager,
      updateMultipleElements: updateMultipleElementsInManager,
      removeElement: removeElementFromManager,
      duplicateElement: duplicateElementInManager,
      changeElementLayerOrder: changeElementLayerOrderInManager,
      groupElements: groupElementsInManager,
      ungroupElements: ungroupElementsInManager,
      applyMobileVerticalLayout,
      switchMode,
      migrateAllElementsToResponsive,
    },
    viewManager: useViewManager(),
    interactionManager,
    exportManager,
    responsiveManager,
    isAuthCheckedAndLoaded, setIsAuthCheckedAndLoaded,
    propertiesPanelVisible, setPropertiesPanelVisible,
    propertiesPanelPosition, setPropertiesPanelPosition,
    propertiesPanelWidth, propertiesPanelHeight, setPropertiesPanelHeight,
    toolbarVisible, setToolbarVisible,
    toolbarPosition, setToolbarPosition,
    toolbarWidth, toolbarHeight, setToolbarHeight,
  };
};

export default useBuilderState;
