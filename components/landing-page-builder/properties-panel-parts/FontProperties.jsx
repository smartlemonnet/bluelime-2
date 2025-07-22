
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlignLeft, AlignCenter, AlignRight, Bold } from 'lucide-react';

const commonFontFamilies = [
  "Arial, sans-serif", "Verdana, sans-serif", "Tahoma, sans-serif", "Trebuchet MS, sans-serif",
  "Times New Roman, serif", "Georgia, serif", "Garamond, serif",
  "Courier New, monospace", "Lucida Console, monospace",
  "Impact, fantasy", "Comic Sans MS, cursive", "Brush Script MT, cursive",
  "Roboto, sans-serif", "Open Sans, sans-serif", "Lato, sans-serif", "Montserrat, sans-serif",
  "Poppins, sans-serif", "Nunito, sans-serif", "Inter, sans-serif", "Arial Black, sans-serif",
  "Helvetica Neue, sans-serif", "Source Sans Pro, sans-serif", "Raleway, sans-serif",
  "Merriweather, serif", "Playfair Display, serif", "Oswald, sans-serif", "Ubuntu, sans-serif",
  "PT Sans, sans-serif", "Droid Sans, sans-serif", "Fira Sans, sans-serif", "Noto Sans, sans-serif"
];

const FontProperties = ({ type, internalState, handleChange, handleSliderChange, handleTextAlignChange }) => {
  if (!internalState) {
    return null;
  }

  const defaultFontSize = type === 'heading' ? 24 : (type === 'button' ? 16 : 14);
  const defaultTextColor = type === 'button' ? '#FFFFFF' : '#333333';

  const handleFontWeightChange = () => {
    const newWeight = (internalState.fontWeight || 'normal') === 'bold' ? 'normal' : 'bold';
    handleChange('fontWeight', newWeight);
  };

  const currentFontSize = internalState.fontSize || defaultFontSize;
  const currentFontFamily = internalState.fontFamily || 'Roboto, sans-serif';
  const currentTextAlign = internalState.textAlign || 'left';
  const currentFontWeight = internalState.fontWeight || 'normal';
  const currentTextColor = internalState.textColor || defaultTextColor;
  const currentLineHeight = typeof internalState.lineHeight === 'number' ? internalState.lineHeight : 1.5;
  const displayLineHeight = internalState.lineHeight || 'normal';

  return (
    <>
      <div>
        <Label htmlFor="fontSize" className="text-sm font-medium text-slate-300">Font Size: {currentFontSize}px</Label>
        <Slider
          id="fontSize"
          min={8}
          max={128}
          step={1}
          value={[currentFontSize]}
          onValueChange={(val) => handleSliderChange('fontSize', val)}
          className="mt-2 [&>span:first-child]:h-1 [&>span:first-child>span]:bg-purple-500"
        />
      </div>

      <div>
        <Label htmlFor="fontFamily" className="text-sm font-medium text-slate-300">Font Family</Label>
        <Select
          value={currentFontFamily}
          onValueChange={(val) => handleChange('fontFamily', val)}
        >
          <SelectTrigger className="mt-1 bg-slate-700 border-slate-600 text-slate-100 focus:ring-purple-500 focus:border-purple-500">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
            {commonFontFamilies.map(font => (
              <SelectItem key={font} value={font} style={{ fontFamily: font }} className="hover:bg-slate-600 focus:bg-slate-600 data-[highlighted]:bg-slate-600 data-[highlighted]:text-slate-50">
                {font.split(',')[0]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
            <Label className="text-sm font-medium text-slate-300">Text Align</Label>
            <ToggleGroup
            type="single"
            value={currentTextAlign}
            onValueChange={handleTextAlignChange}
            className="mt-1 grid grid-cols-3 gap-1"
            >
            <ToggleGroupItem value="left" aria-label="Left align" className="data-[state=on]:bg-purple-600 data-[state=on]:text-white hover:bg-slate-600 border-slate-600 h-9">
                <AlignLeft className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Center align" className="data-[state=on]:bg-purple-600 data-[state=on]:text-white hover:bg-slate-600 border-slate-600 h-9">
                <AlignCenter className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Right align" className="data-[state=on]:bg-purple-600 data-[state=on]:text-white hover:bg-slate-600 border-slate-600 h-9">
                <AlignRight className="h-4 w-4" />
            </ToggleGroupItem>
            </ToggleGroup>
        </div>
        {(type === 'heading' || type === 'text' || type === 'button') && (
            <div>
                <Label className="text-sm font-medium text-slate-300">Weight</Label>
                <ToggleGroup
                type="single"
                value={currentFontWeight}
                onValueChange={handleFontWeightChange}
                className="mt-1 grid grid-cols-1 gap-1"
                >
                <ToggleGroupItem value="bold" aria-label="Bold" className={`data-[state=on]:bg-purple-600 data-[state=on]:text-white hover:bg-slate-600 border-slate-600 h-9 ${currentFontWeight === 'bold' ? 'bg-purple-600 text-white' : ''}`}>
                    <Bold className="h-4 w-4" />
                </ToggleGroupItem>
                </ToggleGroup>
            </div>
        )}
      </div>
      
      <div>
        <Label htmlFor="textColor" className="text-sm font-medium text-slate-300">Text Color</Label>
        <Input
          id="textColor"
          type="color"
          value={currentTextColor}
          onChange={(e) => handleChange('textColor', e.target.value)}
          className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer"
        />
      </div>
      
      {(type === 'heading' || type === 'text') && (
        <div>
          <Label htmlFor="lineHeight" className="text-sm font-medium text-slate-300">Line Height: {displayLineHeight}</Label>
           <Slider
            id="lineHeight"
            min={0.8}
            max={3}
            step={0.1}
            value={[currentLineHeight]}
            onValueChange={(val) => handleChange('lineHeight', val[0])}
            className="mt-2 [&>span:first-child]:h-1 [&>span:first-child>span]:bg-purple-500"
          />
        </div>
      )}

    </>
  );
};

export default FontProperties;
