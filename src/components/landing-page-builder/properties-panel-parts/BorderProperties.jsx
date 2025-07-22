import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BorderProperties = ({ internalState, handleChange, handleSliderChange }) => {
  const borderStyles = [
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' },
    { value: 'double', label: 'Double' },
    { value: 'groove', label: 'Groove' },
    { value: 'ridge', label: 'Ridge' },
    { value: 'inset', label: 'Inset' },
    { value: 'outset', label: 'Outset' },
  ];

  if (!internalState) {
    return (
        <div className="space-y-3 p-3 border border-slate-700 rounded-md bg-slate-700/30">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Border</h4>
          <p className="text-sm text-slate-400">Not applicable for this element.</p>
        </div>
    );
  }

  return (
    <div className="space-y-3 p-3 border border-slate-700 rounded-md bg-slate-700/30">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Border</h4>
      
      <div>
        <Label htmlFor="borderWidth" className="text-sm font-medium text-slate-300">
          Width: {internalState.borderWidth || 0}px
        </Label>
        <Slider
          id="borderWidth"
          min={0}
          max={20}
          step={1}
          value={[internalState.borderWidth || 0]}
          onValueChange={(val) => handleSliderChange('borderWidth', val)}
          className="mt-2 [&>span:first-child]:h-1 [&>span:first-child>span]:bg-purple-500"
        />
      </div>

      <div>
        <Label htmlFor="borderColor" className="text-sm font-medium text-slate-300">Color</Label>
        <Input
          id="borderColor"
          type="color"
          value={internalState.borderColor === 'transparent' ? '#000000' : (internalState.borderColor || '#000000')}
          onChange={(e) => handleChange('borderColor', e.target.value)}
          className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer"
        />
         {internalState.borderColor && internalState.borderColor !== 'transparent' && (
          <p className="text-xs text-slate-400 mt-1">Current: {internalState.borderColor}</p>
        )}
      </div>

      <div>
        <Label htmlFor="borderStyle" className="text-sm font-medium text-slate-300">Style</Label>
        <Select value={internalState.borderStyle || 'solid'} onValueChange={(val) => handleChange('borderStyle', val)}>
          <SelectTrigger className="mt-1 bg-slate-700 border-slate-600 text-slate-100 focus:ring-purple-500 focus:border-purple-500">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
            {borderStyles.map(style => (
              <SelectItem key={style.value} value={style.value} className="hover:bg-slate-600 focus:bg-slate-600 data-[highlighted]:bg-slate-600 data-[highlighted]:text-slate-50">
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BorderProperties;