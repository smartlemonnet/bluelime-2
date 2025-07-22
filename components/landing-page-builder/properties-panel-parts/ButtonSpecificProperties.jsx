import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eraser } from 'lucide-react';

const ButtonSpecificProperties = ({ internalState, handleChange, handleSliderChange, clearBackgroundColor }) => {
  return (
    <>
      <div>
        <Label htmlFor="href" className="text-sm font-medium text-slate-300">Button Link (URL)</Label>
        <Input
          id="href"
          type="url"
          value={internalState.href || ''}
          onChange={(e) => handleChange('href', e.target.value)}
          placeholder="https://example.com"
          className="mt-1 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      <div>
        <Label htmlFor="buttonColor" className="text-sm font-medium text-slate-300">Button Color</Label>
        <Input
          id="buttonColor"
          type="color"
          value={internalState.buttonColor || '#3b82f6'}
          onChange={(e) => handleChange('buttonColor', e.target.value)}
          className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer"
        />
      </div>
      <div>
        <Label htmlFor="buttonHoverColor" className="text-sm font-medium text-slate-300">Button Hover Color</Label>
        <Input
          id="buttonHoverColor"
          type="color"
          value={internalState.buttonHoverColor || '#2563eb'}
          onChange={(e) => handleChange('buttonHoverColor', e.target.value)}
          className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer"
        />
      </div>
      
      {/* Button Background Color with Reset Button */}
      <div className="flex items-center space-x-2">
        <div className="flex-grow">
          <Label htmlFor="buttonBackgroundColor" className="text-sm font-medium text-slate-300">Button Background</Label>
          <Input
            id="buttonBackgroundColor"
            type="color"
            value={internalState.buttonColor === 'transparent' ? '#000000' : (internalState.buttonColor || '#3b82f6')}
            onChange={(e) => handleChange('buttonColor', e.target.value === '#000000' ? 'transparent' : e.target.value)}
            className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer"
          />
          {internalState.buttonColor !== 'transparent' && (
            <p className="text-xs text-slate-400 mt-1">Current: {internalState.buttonColor}</p>
          )}
        </div>
        {clearBackgroundColor && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleChange('buttonColor', 'transparent')} 
                  className="mt-5 text-slate-400 hover:text-purple-400 hover:bg-slate-700 h-9 w-9"
                >
                  <Eraser size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-slate-800 text-slate-200 border-slate-700">
                <p>Clear background (transparent)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {/* Duplicated Border Radius from BackgroundAndAppearance for buttons if not using that shared component for buttons */}
      <div className="pt-2">
        <Label htmlFor="borderRadius" className="text-sm font-medium text-slate-300">Corner Radius: {internalState.borderRadius || 0}px</Label>
        <Slider
          id="borderRadius"
          min={0}
          max={100} 
          step={1}
          value={[internalState.borderRadius !== undefined ? internalState.borderRadius : 6]}
          onValueChange={(val) => handleSliderChange('borderRadius', val)}
          className="mt-2 [&>span:first-child]:h-1 [&>span:first-child>span]:bg-purple-500"
        />
      </div>
    </>
  );
};

export default ButtonSpecificProperties;