
import React, { useState, useCallback, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Ungroup, Group as GroupIcon } from 'lucide-react';
import BackgroundAndAppearanceProperties from './BackgroundAndAppearanceProperties';
import BorderProperties from './BorderProperties';

const GroupProperties = ({ elements, onUpdateMultiple, onUpdate, onGroup, onUngroup, onSaveBlock, isSavingBlock, isGrouped }) => {
  const [groupName, setGroupName] = useState(isGrouped ? (elements[0]?.name || '') : '');

  const getCommonValue = useCallback((key) => {
    if (!elements || elements.length === 0) return undefined;
    const firstElement = elements[0];
    const firstValue = firstElement[key];
    if (firstValue === undefined) return undefined;

    const allSame = elements.every(el => el[key] === firstValue);
    return allSame ? firstValue : undefined;
  }, [elements]);

  const [internalState, setInternalState] = useState({});

  useEffect(() => {
    setInternalState({
      opacity: getCommonValue('opacity') ?? 1,
      borderRadius: getCommonValue('borderRadius') ?? 0,
      backgroundColor: getCommonValue('backgroundColor') ?? 'transparent',
      backgroundType: getCommonValue('backgroundType') ?? 'solid',
      gradientStartColor: getCommonValue('gradientStartColor') ?? '#8B5CF6',
      gradientEndColor: getCommonValue('gradientEndColor') ?? '#3B82F6',
      gradientDirection: getCommonValue('gradientDirection') ?? 'to bottom right',
      blurAmount: getCommonValue('blurAmount') ?? 0,
      borderWidth: getCommonValue('borderWidth') ?? 0,
      borderColor: getCommonValue('borderColor') ?? '#000000',
      borderStyle: getCommonValue('borderStyle') ?? 'solid',
    });
    if (isGrouped && elements[0]) {
      setGroupName(elements[0].name || '');
    }
  }, [elements, getCommonValue, isGrouped]);
  
  const handleUpdate = isGrouped ? onUpdate : onUpdateMultiple;

  const handleChange = useCallback((key, value) => {
    setInternalState(prevState => ({ ...prevState, [key]: value }));
    const props = { [key]: value };
    isGrouped ? handleUpdate(props) : handleUpdate(elements.map(el => el.id), props);
  }, [handleUpdate, elements, isGrouped]);

  const handleSliderChange = useCallback((key, value) => {
    const numValue = value[0];
    setInternalState(prevState => ({ ...prevState, [key]: numValue }));
    const props = { [key]: numValue };
    isGrouped ? handleUpdate(props) : handleUpdate(elements.map(el => el.id), props);
  }, [handleUpdate, elements, isGrouped]);

  const clearBackgroundColor = useCallback(() => {
    handleChange('backgroundColor', 'transparent');
  }, [handleChange]);

  const handleCreateGroup = () => {
    if (onGroup) {
      onGroup(groupName || 'New Group');
    }
  };

  const handleGroupNameChange = (e) => {
    const newName = e.target.value;
    setGroupName(newName);
    if (isGrouped && onUpdate) {
      onUpdate({ name: newName });
    }
  };

  const handleSave = () => {
    if (onSaveBlock) {
      const name = isGrouped ? (elements[0]?.name || 'Unnamed Block') : (groupName || 'Unnamed Block');
      onSaveBlock(name, elements);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-base font-semibold text-slate-100">{isGrouped ? 'Group Properties' : 'Group Actions'}</Label>
        
        {isGrouped && (
          <Button onClick={onUngroup} variant="destructive" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg">
            <Ungroup size={20} className="mr-2" />
            UNGROUP
          </Button>
        )}

        <Label htmlFor="group-name" className="text-sm font-medium text-slate-300 pt-4">
          {isGrouped ? 'Group Name' : 'Name your Group'}
        </Label>
        <Input
          id="group-name"
          type="text"
          placeholder={isGrouped ? "Group Name" : "Enter name and create group"}
          value={groupName}
          onChange={handleGroupNameChange}
          className="mt-1 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-purple-500 focus:border-purple-500"
        />

        {!isGrouped && (
          <Button onClick={handleCreateGroup} variant="outline" className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300">
            <GroupIcon size={16} className="mr-2" />
            Create Group
          </Button>
        )}
      </div>

      <div className="h-px w-full bg-slate-700" />

      <div className="space-y-2">
        <Label htmlFor="block-name" className="text-base font-semibold text-slate-100">Save as Block</Label>
        <p className="text-xs text-slate-400">Save this selection to your library for reuse.</p>
        <Button onClick={handleSave} disabled={isSavingBlock} className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white">
          <Save size={16} className="mr-2" />
          {isSavingBlock ? 'Saving...' : 'Save Block'}
        </Button>
      </div>
      
      {isGrouped && (
        <>
          <div className="h-px w-full bg-slate-700" />
          <div className="space-y-4">
            <Label className="text-base font-semibold text-slate-100">Group Appearance</Label>
            <BackgroundAndAppearanceProperties
              type="group"
              internalState={internalState}
              handleChange={handleChange}
              handleSliderChange={handleSliderChange}
              clearBackgroundColor={clearBackgroundColor}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default GroupProperties;
