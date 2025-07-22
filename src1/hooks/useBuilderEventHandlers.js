
import { useCallback } from 'react';

const useBuilderEventHandlers = ({
  elements,
  setElements,
  selectedElementIds,
  setSelectedElementIds,
  layoutManager,
  blockManager,
  historyManager,
  elementManager,
  interactionManager,
  exportManager,
  toast,
  setPropertiesPanelVisible, 
  setToolbarVisible, 
}) => {

  const updateStateAndHistory = useCallback((newElements, newBgColor) => {
    const bgColor = newBgColor !== undefined ? newBgColor : layoutManager.pageBackgroundColor;
    setElements(newElements);
    historyManager.updateHistory({ elements: newElements, pageBackgroundColor: bgColor });
  }, [historyManager, layoutManager.pageBackgroundColor, setElements]);

  const addElement = useCallback((type) => {
    const newElementsArray = elementManager.addElement(type);
    updateStateAndHistory(newElementsArray);
  }, [elementManager, updateStateAndHistory]);

  const handleAddBlock = useCallback((blockElements) => {
    const newElementsArray = elementManager.addBlock(blockElements);
    updateStateAndHistory(newElementsArray);
  }, [elementManager, updateStateAndHistory]);

  const updateElementAndHistory = useCallback((idOrUpdates, props) => {
    const newElements = elementManager.updateElement(idOrUpdates, props);
    updateStateAndHistory(newElements);
  }, [elementManager, updateStateAndHistory]);
  
  const updateElementDuringInteraction = useCallback((idOrUpdates, props) => {
    elementManager.updateElement(idOrUpdates, props);
  }, [elementManager]);

  const updateMultipleElementsAndHistory = useCallback((ids, props) => {
    const newElements = elementManager.updateMultipleElements(ids, props);
    updateStateAndHistory(newElements);
  }, [elementManager, updateStateAndHistory]);

  const removeElementAndHistory = useCallback((id) => {
    const newElements = elementManager.removeElement(id);
    updateStateAndHistory(newElements);
  }, [elementManager, updateStateAndHistory]);

  const duplicateElementAndHistory = useCallback((id) => {
    const newElements = elementManager.duplicateElement(id);
    updateStateAndHistory(newElements);
  }, [elementManager, updateStateAndHistory]);
  
  const changeElementLayerOrderAndHistory = useCallback((elementId, direction) => {
    const newElements = elementManager.changeElementLayerOrder(elementId, direction);
    updateStateAndHistory(newElements);
  }, [elementManager, updateStateAndHistory]);

  const handleGroupAndHistory = useCallback((name) => {
    const newElements = elementManager.groupElements(name);
    updateStateAndHistory(newElements);
  }, [elementManager, updateStateAndHistory]);

  const handleUngroupAndHistory = useCallback((groupId) => {
    const newElements = elementManager.ungroupElements(groupId);
    updateStateAndHistory(newElements);
  }, [elementManager, updateStateAndHistory]);

  const handleSaveBlock = useCallback(async (blockName, blockElements) => {
    let elementsToSave = [];
    if (blockElements.length === 1 && blockElements[0].type === 'group') {
      const group = blockElements[0];
      const children = elements.filter(el => el.groupId === group.id);
      elementsToSave = [group, ...children];
    } else {
      elementsToSave = blockElements;
    }
    await blockManager.saveBlockToLibrary(blockName, elementsToSave);
  }, [blockManager, elements]);

  const handleClearCanvas = useCallback(() => {
    const { newElements, newBgColor } = layoutManager.clearCanvasAndResetLayout();
    setElements(newElements);
    historyManager.setHistory([{ elements: newElements, pageBackgroundColor: newBgColor }]);
    historyManager.setCurrentHistoryIndex(0);
  }, [layoutManager, setElements, historyManager]);

  const handlePublishLayout = useCallback(async () => {
    if (layoutManager.isSaving) return; 

    const slugToUse = layoutManager.layoutSlug || layoutManager.generateSlug(layoutManager.layoutName);
    if (!slugToUse) {
      toast({
        title: "Cannot Publish",
        description: "Layout name is missing. Please name your layout first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const currentElementsToSave = Array.isArray(elements) ? elements : [];
      const savedLayoutData = await layoutManager.saveLayout(currentElementsToSave, layoutManager.layoutName, slugToUse, layoutManager.pageBackgroundColor, layoutManager.currentLayoutDbId);
      if (savedLayoutData && savedLayoutData.id && savedLayoutData.slug) {
        layoutManager.setCurrentLayoutDbId(savedLayoutData.id);
        layoutManager.setLayoutName(savedLayoutData.name);
        layoutManager.setLayoutSlug(savedLayoutData.slug);
        const previewUrl = `${window.location.origin}/p/${savedLayoutData.slug}`;
        window.open(previewUrl, '_blank');
      } else {
        toast({
          title: "Publish Error",
          description: "Could not save layout before publishing or layout ID/slug is missing. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Publish failed:", error);
       toast({
        title: "Publish Error",
        description: `Could not publish page. ${error.message}`,
        variant: "destructive",
      });
    }
  }, [layoutManager, elements, toast]);

  const handleSaveLayout = async () => {
    try {
        const slugToUse = layoutManager.layoutSlug || layoutManager.generateSlug(layoutManager.layoutName);
        const currentElementsToSave = Array.isArray(elements) ? elements : [];
        const savedData = await layoutManager.saveLayout(currentElementsToSave, layoutManager.layoutName, slugToUse, layoutManager.pageBackgroundColor, layoutManager.currentLayoutDbId);
        if (savedData && savedData.id) {
          layoutManager.setLayoutName(savedData.name);
          layoutManager.setLayoutSlug(savedData.slug);
          layoutManager.setPageBackgroundColor(savedData.page_background_color);
          layoutManager.setCurrentLayoutDbId(savedData.id);
        }
    } catch (err) {
        console.error("Failed to save from TopBar/Toolbar", err);
         toast({
            title: "Save Error",
            description: `An unexpected error occurred: ${err.message}`,
            variant: "destructive",
          });
    }
  };

  const handleInitiateExport = async () => {
    const currentElementsToExport = Array.isArray(elements) ? elements : [];
    if (!currentElementsToExport || currentElementsToExport.length === 0) {
      toast({
        title: "Cannot Export",
        description: "Canvas is empty. Add some elements before exporting.",
        variant: "warning",
      });
      return;
    }
    const slugToUse = layoutManager.layoutSlug || layoutManager.generateSlug(layoutManager.layoutName);
    await exportManager.exportLayout(currentElementsToExport, layoutManager.layoutName, slugToUse, layoutManager.pageBackgroundColor);
  };
  
  const handlePageBackgroundColorChangeAndHistory = (color) => {
    layoutManager.handlePageBackgroundColorChange(color);
    updateStateAndHistory(elements, color);
  };

  const handleLoadLayoutFromToolbar = async (layoutToLoad) => {
    const loadedData = await layoutManager.loadLayout(layoutToLoad);
    if (loadedData) {
      const loadedContent = loadedData.content || [];
      const loadedBgColor = loadedData.page_background_color || '#485060';
      setElements(loadedContent); 
      layoutManager.setLayoutName(loadedData.name || 'New Page');
      layoutManager.setPageBackgroundColor(loadedBgColor);
      layoutManager.setCurrentLayoutDbId(loadedData.id || null);
      
      const historyState = { elements: loadedContent, pageBackgroundColor: loadedBgColor };
      historyManager.setHistory([historyState]);
      historyManager.setCurrentHistoryIndex(0);
    }
  };

  const handleUndo = () => {
    const state = historyManager.getUndoState();
    if(state) {
      setElements(state.elements);
      layoutManager.setPageBackgroundColor(state.pageBackgroundColor);
    }
  };

  const handleRedo = () => {
    const state = historyManager.getRedoState();
     if(state) {
      setElements(state.elements);
      layoutManager.setPageBackgroundColor(state.pageBackgroundColor);
    }
  };

  return {
    addElement,
    handleAddBlock,
    updateElementAndHistory,
    updateElementDuringInteraction,
    updateMultipleElementsAndHistory,
    removeElementAndHistory,
    duplicateElementAndHistory,
    changeElementLayerOrderAndHistory,
    handleGroupAndHistory,
    handleUngroupAndHistory,
    handleSaveBlock,
    handleClearCanvas,
    handlePublishLayout,
    handleSaveLayout,
    handleInitiateExport,
    handlePageBackgroundColorChangeAndHistory,
    handleLoadLayoutFromToolbar,
    handleUndo: handleUndo,
    handleRedo: handleRedo,
  };
};

export default useBuilderEventHandlers;
