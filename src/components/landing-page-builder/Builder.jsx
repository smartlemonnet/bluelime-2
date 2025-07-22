import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Rnd } from 'react-rnd';
import { supabase } from '@/lib/supabaseClient';

import TopBar from '@/components/landing-page-builder/TopBar';
import Toolbar from '@/components/landing-page-builder/Toolbar';
import Canvas from '@/components/landing-page-builder/Canvas';
import PropertiesPanel from '@/components/landing-page-builder/PropertiesPanel';
import BuilderLoadingScreen from '@/components/landing-page-builder/BuilderLoadingScreen';
import BlockLibraryDialog from '@/components/landing-page-builder/BlockLibraryDialog';
import useBuilderState from '@/hooks/useBuilderState';
import useBuilderEventHandlers from '@/hooks/useBuilderEventHandlers';

const Builder = ({ session }) => {
  const { toast } = useToast();
  
  const {
    elements, setElements,
    selectedElementIds, setSelectedElementIds,
    layoutManager,
    blockManager,
    historyManager,
    elementManager,
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
  } = useBuilderState(session, toast);

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const eventHandlers = useBuilderEventHandlers({
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
  });
  
  useEffect(() => {
    if (!isAuthCheckedAndLoaded) {
      setIsAuthCheckedAndLoaded(true); 
    }
  }, [isAuthCheckedAndLoaded, setIsAuthCheckedAndLoaded]);
  
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      setToolbarVisible(true);
      setPropertiesPanelVisible(true);
    }

    const isInputField = event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable;
    if ((event.key === 'Delete' || event.key === 'Backspace') && !isInputField && selectedElementIds.length > 0) {
      event.preventDefault();
      selectedElementIds.forEach(id => {
        eventHandlers.removeElementAndHistory(id);
      });
    }
  }, [selectedElementIds, eventHandlers, setToolbarVisible, setPropertiesPanelVisible]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Logout Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    }
  };

  if (!isAuthCheckedAndLoaded) {
    return <BuilderLoadingScreen message="Finalizing Setup..." />;
  }

  const canvasWidthForMode = responsiveManager.getCurrentCanvasWidth();
  const safeElements = Array.isArray(elements) ? elements : [];
  
  const getSelectedElements = () => {
    if (selectedElementIds.length === 0) return [];
    
    // Check if a group is selected
    const selectedGroup = safeElements.find(el => el.type === 'group' && selectedElementIds.includes(el.id));
    if (selectedGroup) {
        return [selectedGroup];
    }
    
    // Otherwise, it's a multi-selection of individual elements
    return safeElements.filter(el => selectedElementIds.includes(el.id));
  };
  const selectedElements = getSelectedElements();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
        <TopBar 
          session={session}
          onSave={eventHandlers.handleSaveLayout}
          onPublish={eventHandlers.handlePublishLayout}
          onExport={eventHandlers.handleInitiateExport}
          onUndo={eventHandlers.handleUndo}
          canUndo={historyManager.canUndo}
          onRedo={eventHandlers.handleRedo}
          canRedo={historyManager.canRedo}
          layoutName={layoutManager.layoutName}
          onLayoutNameChange={layoutManager.handleLayoutNameChange}
          isExporting={exportManager.isExporting}
          isSaving={layoutManager.isSaving}
          onOpenLibrary={() => setIsLibraryOpen(true)}
          onLogout={handleLogout}
          currentMode={responsiveManager.currentMode}
          onSwitchToDesktop={() => {
            responsiveManager.switchToDesktop();
            elementManager.switchMode('desktop');
          }}
          onSwitchToMobile={() => {
            responsiveManager.switchToMobile();
            elementManager.switchMode('mobile');
          }}
        />
        <div className="flex flex-1 overflow-hidden relative">
          <AnimatePresence>
            {toolbarVisible && (
              <Rnd
                style={{ zIndex: 50 }}
                size={{ width: toolbarWidth, height: toolbarHeight }}
                minHeight={200}
                maxHeight={window.innerHeight - 160}
                position={{ x: toolbarPosition.x, y: toolbarPosition.y }}
                onDragStop={(e, d) => { setToolbarPosition({ x: d.x, y: d.y }); }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  setToolbarHeight(parseInt(ref.style.height, 10));
                }}
                bounds="window"
                enableResizing={{ top: false, right: false, bottom: true, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }}
                dragHandleClassName="toolbar-drag-handle"
              >
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col shadow-2xl rounded-lg overflow-hidden bg-black/60 backdrop-blur-md"
                >
                  <Toolbar
                    onAddElement={(type) => eventHandlers.addElement(type)} 
                    currentTool={interactionManager.currentTool}
                    setCurrentTool={interactionManager.setCurrentTool}
                    onLoadLayout={eventHandlers.handleLoadLayoutFromToolbar}
                    onClearCanvas={eventHandlers.handleClearCanvas}
                    numElements={safeElements.length}
                    onToggleVisibility={() => setToolbarVisible(false)}
                  />
                </motion.div>
              </Rnd>
            )}
          </AnimatePresence>
          
          <div 
            className={`flex-1 relative overflow-auto custom-scrollbar bg-slate-800/70 transition-all duration-300 ease-in-out`}
            style={{ backgroundColor: '#474e5c' }}
          >
            <Canvas
              elements={safeElements} 
              selectedElementIds={selectedElementIds}
              onElementClick={interactionManager.handleElementClick}
              onElementRemove={eventHandlers.removeElementAndHistory}
              onElementUpdate={eventHandlers.updateElementAndHistory}
              onElementUpdateDuringInteraction={eventHandlers.updateElementDuringInteraction}
              onCanvasClick={interactionManager.handleCanvasClick}
              onElementDuplicate={eventHandlers.duplicateElementAndHistory}
              canvasBackgroundColor={layoutManager.pageBackgroundColor} 
              canvasWidth={canvasWidthForMode}
              setSelectedElementIds={setSelectedElementIds}
              currentMode={responsiveManager.currentMode}
            />
          </div>

          <AnimatePresence>
            {propertiesPanelVisible && (
              <Rnd
                style={{ zIndex: 50 }}
                size={{ width: propertiesPanelWidth, height: propertiesPanelHeight }}
                minWidth={propertiesPanelWidth}
                maxWidth={propertiesPanelWidth}
                minHeight={300} 
                maxHeight={window.innerHeight - 100} 
                position={{ x: propertiesPanelPosition.x, y: propertiesPanelPosition.y }}
                onDragStop={(e, d) => { setPropertiesPanelPosition({ x: d.x, y: d.y }); }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  setPropertiesPanelHeight(parseInt(ref.style.height, 10));
                  setPropertiesPanelPosition(position);
                }}
                bounds="window"
                enableResizing={{ top: false, right: false, bottom: true, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }}
                dragHandleClassName="properties-panel-drag-handle"
              >
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col shadow-2xl rounded-lg overflow-hidden bg-black/60 backdrop-blur-md"
                >
                  <PropertiesPanel
                    key={selectedElementIds.join('-') || 'layout-props'}
                    elements={selectedElements}
                    onUpdate={eventHandlers.updateElementAndHistory}
                    onUpdateMultiple={eventHandlers.updateMultipleElementsAndHistory}
                    onClose={() => setSelectedElementIds([])}
                    pageBackgroundColor={layoutManager.pageBackgroundColor}
                    onPageBackgroundColorChange={eventHandlers.handlePageBackgroundColorChangeAndHistory}
                    onChangeLayerOrder={eventHandlers.changeElementLayerOrderAndHistory} 
                    onGroup={eventHandlers.handleGroupAndHistory}
                    onUngroup={eventHandlers.handleUngroupAndHistory}
                    onSaveBlock={eventHandlers.handleSaveBlock}
                    isSavingBlock={blockManager.isSavingBlock}
                    onToggleVisibility={() => setPropertiesPanelVisible(false)}
                  />
                </motion.div>
              </Rnd>
            )}
          </AnimatePresence>
        </div>
      </div>
      <BlockLibraryDialog
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onLoadBlock={eventHandlers.handleAddBlock}
      />
    </DndProvider>
  );
};

export default Builder;