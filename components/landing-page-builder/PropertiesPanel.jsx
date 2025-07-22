import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { X, GripVertical } from 'lucide-react';

import LayoutSettingsProperties from './properties-panel-parts/LayoutSettingsProperties';
import TextSpecificProperties from './properties-panel-parts/TextSpecificProperties';
import ContentProperties from './properties-panel-parts/ContentProperties';
import ImageSpecificProperties from './properties-panel-parts/ImageSpecificProperties';
import VideoSpecificProperties from './properties-panel-parts/VideoSpecificProperties';
import FormElementProperties from './properties-panel-parts/FormElementProperties';
import FontProperties from './properties-panel-parts/FontProperties';
import BackgroundAndAppearanceProperties from './properties-panel-parts/BackgroundAndAppearanceProperties';
import BorderProperties from './properties-panel-parts/BorderProperties';
import LayerArrangementProperties from './properties-panel-parts/LayerArrangementProperties';
import ButtonSpecificProperties from './properties-panel-parts/ButtonSpecificProperties';
import GroupProperties from './properties-panel-parts/GroupProperties';

const PropertiesPanelHeader = ({ title, onToggleVisibility }) => (
  <div className="p-4 border-b border-slate-700 flex justify-between items-center">
    <GripVertical size={20} className="text-slate-500 mr-2 cursor-move properties-panel-drag-handle" />
    <h3 className="text-lg font-semibold text-slate-100 capitalize flex-grow">{title}</h3>
    <Button variant="ghost" size="icon" onClick={onToggleVisibility} className="text-slate-400 hover:text-slate-100">
      <X size={20} />
    </Button>
  </div>
);

const PanelContainer = ({ children }) => (
  <div className="h-full flex flex-col border-l border-slate-700 shadow-lg rounded-lg bg-transparent">
    {children}
  </div>
);

const NoSelectionPanel = ({ pageBackgroundColor, onPageBackgroundColorChange, onToggleVisibility }) => (
  <PanelContainer>
    <PropertiesPanelHeader title="Page Settings" onToggleVisibility={onToggleVisibility} />
    <ScrollArea className="flex-grow p-4 custom-scrollbar">
      <LayoutSettingsProperties
        pageBackgroundColor={pageBackgroundColor}
        onPageBackgroundColorChange={onPageBackgroundColorChange}
      />
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  </PanelContainer>
);

const GroupSelectionPanel = ({ elements, onUpdateMultiple, onGroup, onToggleVisibility }) => (
  <PanelContainer>
    <PropertiesPanelHeader title="Multiple Selection" onToggleVisibility={onToggleVisibility} />
    <ScrollArea className="flex-grow p-4 custom-scrollbar">
      <GroupProperties
        elements={elements}
        onUpdateMultiple={onUpdateMultiple}
        onGroup={onGroup}
        isGrouped={false}
      />
       <ScrollBar orientation="vertical" />
    </ScrollArea>
  </PanelContainer>
);

const SingleElementPanel = ({ 
  element, 
  onUpdate, 
  onChangeLayerOrder,
  onUngroup,
  onSaveBlock,
  isSavingBlock,
  onToggleVisibility 
}) => {
  const [internalState, setInternalState] = useState(element);

  useEffect(() => {
    setInternalState(element);
  }, [element]);

  const handleChange = useCallback((key, value) => {
    const newState = { ...internalState, [key]: value };
    setInternalState(newState);
    if (element) {
      onUpdate(element.id, { [key]: value });
    }
  }, [internalState, onUpdate, element]);

  const handleSliderChange = useCallback((key, value) => {
    const numValue = value[0];
    const newState = { ...internalState, [key]: numValue };
    setInternalState(newState);
    if (element) {
      onUpdate(element.id, { [key]: numValue });
    }
  }, [internalState, onUpdate, element]);

  const handleTextAlignChange = useCallback((value) => {
    if (value) {
      handleChange('textAlign', value);
    }
  }, [handleChange]);

  const clearBackgroundColor = useCallback(() => {
    handleChange('backgroundColor', 'transparent');
  }, [handleChange]);

  const handleFormFieldChange = (index, field) => {
    const newFields = [...(internalState.formFields || [])];
    newFields[index] = field;
    handleChange('formFields', newFields);
  };

  const addFormField = () => {
    const currentFields = internalState.formFields || [];
    const newFields = [...currentFields, { id: Date.now().toString(), label: `New Field ${currentFields.length + 1}`, type: 'text', required: false }];
    handleChange('formFields', newFields);
  };

  const removeFormField = (index) => {
    const newFields = [...(internalState.formFields || [])];
    newFields.splice(index, 1);
    handleChange('formFields', newFields);
  };

  if (!element || !internalState) return null;

  const { type, zIndex, id: selectedElementId } = element;

  return (
    <PanelContainer>
      <PropertiesPanelHeader title={`${type} Settings`} onToggleVisibility={onToggleVisibility} />
      <ScrollArea className="flex-grow p-4 custom-scrollbar">
        <div className="space-y-6">
          {type === 'group' && (
             <GroupProperties
                elements={[element]}
                onUpdate={(props) => onUpdate(element.id, props)}
                onUngroup={() => onUngroup(element.id)}
                onSaveBlock={onSaveBlock}
                isSavingBlock={isSavingBlock}
                isGrouped={true}
              />
          )}

          {type === 'text' && (
            <TextSpecificProperties internalState={internalState} handleChange={handleChange} />
          )}

          {(type === 'heading' || type === 'button') && ( 
            <ContentProperties type={type} internalState={internalState} handleChange={handleChange} />
          )}

          {type === 'image' && (
            <ImageSpecificProperties 
              internalState={internalState} 
              onUpdate={onUpdate}
              elementId={selectedElementId} 
            />
          )}

          {type === 'video' && (
            <VideoSpecificProperties
              internalState={internalState}
              onUpdate={onUpdate}
              elementId={selectedElementId}
            />
          )}

          {type === 'form' && (
            <FormElementProperties
              internalState={internalState}
              handleChange={handleChange}
              formFields={internalState.formFields || []}
              handleFormFieldChange={handleFormFieldChange}
              addFormField={addFormField}
              removeFormField={removeFormField}
            />
          )}

          {(type === 'heading' || type === 'text' || type === 'button' || type === 'form') && (
            <FontProperties 
              type={type}
              internalState={internalState}
              handleChange={handleChange}
              handleSliderChange={handleSliderChange}
              handleTextAlignChange={handleTextAlignChange}
            />
          )}

          {(type === 'text' || type === 'heading' || type === 'image' || type === 'video' || type === 'shape' || type === 'button' || type === 'form' || type === 'group') && (
            <BackgroundAndAppearanceProperties 
              type={type}
              internalState={internalState}
              handleChange={handleChange}
              handleSliderChange={handleSliderChange}
              clearBackgroundColor={clearBackgroundColor}
            />
          )}

          {(type === 'heading' || type === 'image' || type === 'video' || type === 'shape' || type === 'button' || type === 'text' || type === 'form' || type === 'group') && (
            <BorderProperties 
              internalState={internalState}
              handleChange={handleChange}
              handleSliderChange={handleSliderChange}
            />
          )}
          
          {type === 'button' && (
            <ButtonSpecificProperties 
              internalState={internalState} 
              handleChange={handleChange} 
              handleSliderChange={handleSliderChange}
              clearBackgroundColor={clearBackgroundColor}
            />
          )}

          <LayerArrangementProperties
            selectedElementId={selectedElementId}
            zIndex={zIndex}
            onChangeLayerOrder={onChangeLayerOrder}
          />
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </PanelContainer>
  );
};

const PropertiesPanel = ({ 
  elements, 
  onUpdate,
  onUpdateMultiple,
  onGroup,
  onUngroup,
  onSaveBlock,
  isSavingBlock,
  pageBackgroundColor,
  onPageBackgroundColorChange,
  onChangeLayerOrder,
  onToggleVisibility 
}) => {
  if (!elements || elements.length === 0) {
    return <NoSelectionPanel 
      pageBackgroundColor={pageBackgroundColor}
      onPageBackgroundColorChange={onPageBackgroundColorChange}
      onToggleVisibility={onToggleVisibility} 
    />;
  }
  
  if (elements.length > 1) {
    return <GroupSelectionPanel
      elements={elements}
      onUpdateMultiple={onUpdateMultiple}
      onGroup={onGroup}
      onToggleVisibility={onToggleVisibility}
    />
  }
  
  return <SingleElementPanel 
    element={elements[0]}
    onUpdate={onUpdate}
    onChangeLayerOrder={onChangeLayerOrder}
    onUngroup={onUngroup}
    onSaveBlock={onSaveBlock}
    isSavingBlock={isSavingBlock}
    onToggleVisibility={onToggleVisibility}
  />
};

export default PropertiesPanel;