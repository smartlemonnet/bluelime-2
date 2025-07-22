import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eraser } from 'lucide-react';

const BackgroundAndAppearanceProperties = ({ type, internalState, handleChange, handleSliderChange, clearBackgroundColor }) => {
  
  const isValidHexColor = (colorString) => {
    if (!colorString) return false;
    return /^#[0-9A-F]{6}$/i.test(colorString) || /^#[0-9A-F]{3}$/i.test(colorString);
  };
  
  const getShadowOpacity = () => {
    const currentColor = internalState.shadowColor || 'rgba(0,0,0,0)';
    if (currentColor.startsWith('rgba')) {
      const alphaMatch = currentColor.match(/rgba?\([\d\s,]+(?:,\s*([\d.]+))\)/);
      return alphaMatch && alphaMatch[1] ? parseFloat(alphaMatch[1]) : 0;
    }
    if (isValidHexColor(currentColor) && currentColor.length === 9) {
      return parseInt(currentColor.substring(7, 9), 16) / 255;
    }
    return 0;
  };
  
  const handleShadowOpacityChange = (value) => {
    const newOpacity = value[0];
    const currentColor = internalState.shadowColor || 'rgba(0,0,0,0)';
    let r=0,g=0,b=0;

    if (currentColor.startsWith('rgba')) {
      const parts = currentColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (parts) { [r, g, b] = [parts[1], parts[2], parts[3]].map(Number); }
    } else if (isValidHexColor(currentColor)) {
       if (currentColor.length === 7) {
        r = parseInt(currentColor.substring(1, 3), 16); g = parseInt(currentColor.substring(3, 5), 16); b = parseInt(currentColor.substring(5, 7), 16);
      } else if (currentColor.length === 4) {
        r = parseInt(currentColor[1] + currentColor[1], 16); g = parseInt(currentColor[2] + currentColor[2], 16); b = parseInt(currentColor[3] + currentColor[3], 16);
      }
    }
    
    const newRgbaColor = `rgba(${r},${g},${b},${newOpacity.toFixed(2)})`;
    handleChange('shadowColor', newRgbaColor);
  };

  const getShadowColorForInput = () => {
    const currentColor = internalState.shadowColor || 'rgba(0,0,0,0)';
    if (currentColor.startsWith('rgba')) {
      try {
        const parts = currentColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (parts) {
          const r = parseInt(parts[1]).toString(16).padStart(2, '0');
          const g = parseInt(parts[2]).toString(16).padStart(2, '0');
          const b = parseInt(parts[3]).toString(16).padStart(2, '0');
          return `#${r}${g}${b}`;
        }
      } catch (e) { return '#000000'; }
    }
    if (isValidHexColor(currentColor)) {
      return currentColor;
    }
    return '#000000';
  };
  
  const handleShadowColorChange = (e) => {
    const hexColor = e.target.value;
    if (!isValidHexColor(hexColor)) return;
    
    let r=0,g=0,b=0;
    if (hexColor.length === 7) {
      r = parseInt(hexColor.substring(1, 3), 16); g = parseInt(hexColor.substring(3, 5), 16); b = parseInt(hexColor.substring(5, 7), 16);
    } else if (hexColor.length === 4) {
      r = parseInt(hexColor[1] + hexColor[1], 16); g = parseInt(hexColor[2] + hexColor[2], 16); b = parseInt(hexColor[3] + hexColor[3], 16);
    }
    
    const currentOpacity = getShadowOpacity();
    const finalOpacity = currentOpacity > 0 ? currentOpacity : 0.1;
    
    const newRgbaColor = `rgba(${r},${g},${b},${finalOpacity.toFixed(2)})`;
    handleChange('shadowColor', newRgbaColor);
  };


  return (
    <div className="space-y-3 p-3 border border-slate-700 rounded-md bg-slate-700/30">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Background & Appearance</h4>
      
      {(type === 'shape' || type === 'heading' || type === 'form' || type === 'text') && (
        <div>
          <Label className="text-sm font-medium text-slate-300">Background Type</Label>
          <ToggleGroup
            type="single"
            value={internalState.backgroundType || 'solid'}
            onValueChange={(val) => { if (val) handleChange('backgroundType', val);}}
            className="mt-1 grid grid-cols-2 gap-1"
          >
            <ToggleGroupItem value="solid" aria-label="Solid Color" className="data-[state=on]:bg-purple-600 data-[state=on]:text-white hover:bg-slate-600 border-slate-600 h-9">Solid</ToggleGroupItem>
            <ToggleGroupItem value="gradient" aria-label="Gradient" className="data-[state=on]:bg-purple-600 data-[state=on]:text-white hover:bg-slate-600 border-slate-600 h-9">Gradient</ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {(type === 'shape' || type === 'heading' || type === 'form' || type === 'text') && internalState.backgroundType === 'gradient' ? (
        <>
          <div>
            <Label htmlFor="gradientStartColor" className="text-sm font-medium text-slate-300">Gradient Start</Label>
            <Input id="gradientStartColor" type="color" value={internalState.gradientStartColor || '#8B5CF6'} onChange={(e) => handleChange('gradientStartColor', e.target.value)} className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer" />
          </div>
          <div>
            <Label htmlFor="gradientEndColor" className="text-sm font-medium text-slate-300">Gradient End</Label>
            <Input id="gradientEndColor" type="color" value={internalState.gradientEndColor || '#3B82F6'} onChange={(e) => handleChange('gradientEndColor', e.target.value)} className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer" />
          </div>
          <div>
            <Label htmlFor="gradientDirection" className="text-sm font-medium text-slate-300">Direction</Label>
            <Select value={internalState.gradientDirection || 'to bottom right'} onValueChange={(val) => handleChange('gradientDirection', val)}>
              <SelectTrigger className="mt-1 bg-slate-700 border-slate-600 text-slate-100 focus:ring-purple-500 focus:border-purple-500">
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                {['to top', 'to top right', 'to right', 'to bottom right', 'to bottom', 'to bottom left', 'to left', 'to top left', '45deg', '90deg', '135deg', '180deg', '225deg', '270deg', '315deg'].map(dir => (
                  <SelectItem key={dir} value={dir} className="hover:bg-slate-600 focus:bg-slate-600 data-[highlighted]:bg-slate-600 data-[highlighted]:text-slate-50">{dir}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      ) : (
        (type === 'text' || type === 'heading' || type === 'form' || type === 'image' || type === 'shape') && (
          <div className="flex items-center space-x-2">
            <div className="flex-grow">
              <Label htmlFor="backgroundColor" className="text-sm font-medium text-slate-300">Background Color</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={internalState.backgroundColor === 'transparent' ? '#000000' : (internalState.backgroundColor || (type === 'shape' ? '#4A5568' : (type === 'form' ? '#272E3B' : '#000000')))}
                onChange={(e) => handleChange('backgroundColor', e.target.value === '#000000' && (type === 'text' || type === 'heading' || type === 'image') ? 'transparent' : e.target.value)}
                className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer"
              />
              {internalState.backgroundColor !== 'transparent' && (type === 'text' || type === 'heading') && (
                <p className="text-xs text-slate-400 mt-1">Current: {internalState.backgroundColor}</p>
              )}
            </div>
            {(type === 'text' || type === 'heading') && clearBackgroundColor && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={clearBackgroundColor} 
                      className="mt-5 text-slate-400 hover:text-purple-400 hover:bg-slate-700 h-9 w-9"
                    >
                      <Eraser size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-slate-800 text-slate-200 border-slate-700">
                    <p>Set Transparent Background</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )
      )}

      {(type === 'shape' || type === 'button' || type === 'image' || type === 'heading' || type === 'form' || type === 'text') && (
        <div className="pt-2">
          <Label htmlFor="borderRadius" className="text-sm font-medium text-slate-300">Corner Radius: {internalState.borderRadius || 0}px</Label>
          <Slider
            id="borderRadius"
            min={0}
            max={100} 
            step={1}
            value={[internalState.borderRadius || 0]}
            onValueChange={(val) => handleSliderChange('borderRadius', val)}
            className="mt-2 [&>span:first-child]:h-1 [&>span:first-child>span]:bg-purple-500"
          />
        </div>
      )}

      <div className="pt-2">
        <Label htmlFor="opacity" className="text-sm font-medium text-slate-300">Opacity: {Math.round((internalState.opacity !== undefined ? internalState.opacity : 1) * 100)}%</Label>
        <Slider
          id="opacity"
          min={0}
          max={1}
          step={0.01}
          value={[internalState.opacity !== undefined ? internalState.opacity : 1]}
          onValueChange={(val) => handleSliderChange('opacity', val)}
          className="mt-2 [&>span:first-child]:h-1 [&>span:first-child>span]:bg-purple-500"
        />
      </div>

      {(type === 'image' || type === 'shape') && (
        <div className="pt-2">
          <Label htmlFor="blurAmount" className="text-sm font-medium text-slate-300">Blur: {internalState.blurAmount || 0}px</Label>
          <Slider
            id="blurAmount"
            min={0}
            max={20} 
            step={1}
            value={[internalState.blurAmount || 0]}
            onValueChange={(val) => handleSliderChange('blurAmount', val)}
            className="mt-2 [&>span:first-child]:h-1 [&>span:first-child>span]:bg-purple-500"
          />
        </div>
      )}
      
      <div className="space-y-3 pt-4 border-t border-slate-600/50 mt-4">
        <Label className="text-sm font-semibold text-slate-300">Shadow</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="shadowOffsetX" className="text-xs text-slate-400">Offset X: {internalState.shadowOffsetX || 0}px</Label>
            <Slider id="shadowOffsetX" min={-20} max={20} step={1} value={[internalState.shadowOffsetX || 0]} onValueChange={(val) => handleSliderChange('shadowOffsetX', val)} className="mt-1 [&>span:first-child]:h-1 [&>span:first-child>span]:bg-purple-500" />
          </div>
          <div>
            <Label htmlFor="shadowOffsetY" className="text-xs text-slate-400">Offset Y: {internalState.shadowOffsetY || 0}px</Label>
            <Slider id="shadowOffsetY" min={-20} max={20} step={1} value={[internalState.shadowOffsetY || 0]} onValueChange={(val) => handleSliderChange('shadowOffsetY', val)} className="mt-1 [&>span:first-child]:h-1 [&>span:first-child>span]:bg-purple-500" />
          </div>
          <div>
            <Label htmlFor="shadowBlur" className="text-xs text-slate-400">Blur: {internalState.shadowBlur || 0}px</Label>
            <Slider id="shadowBlur" min={0} max={40} step={1} value={[internalState.shadowBlur || 0]} onValueChange={(val) => handleSliderChange('shadowBlur', val)} className="mt-1 [&>span:first-child]:h-1 [&>span:first-child>span]:bg-purple-500" />
          </div>
          <div>
            <Label htmlFor="shadowSpread" className="text-xs text-slate-400">Spread: {internalState.shadowSpread || 0}px</Label>
            <Slider id="shadowSpread" min={-20} max={20} step={1} value={[internalState.shadowSpread || 0]} onValueChange={(val) => handleSliderChange('shadowSpread', val)} className="mt-1 [&>span:first-child]:h-1 [&>span:first-child>span]:bg-purple-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 items-end">
          <div>
            <Label htmlFor="shadowColor" className="text-xs text-slate-400">Color</Label>
            <Input 
              id="shadowColor" 
              type="color" 
              value={getShadowColorForInput()} 
              onChange={handleShadowColorChange} 
              className="mt-1 w-full h-9 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer" 
            />
          </div>
          <div className="w-full">
            <Label htmlFor="shadowOpacity" className="text-xs text-slate-400">Opacity: {Math.round(getShadowOpacity() * 100)}%</Label>
             <Slider
                id="shadowOpacity"
                min={0}
                max={1}
                step={0.01}
                value={[getShadowOpacity()]}
                onValueChange={handleShadowOpacityChange}
                className="mt-2 [&>span:first-child]:h-1 [&>span:first-child>span]:bg-purple-500"
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default BackgroundAndAppearanceProperties;