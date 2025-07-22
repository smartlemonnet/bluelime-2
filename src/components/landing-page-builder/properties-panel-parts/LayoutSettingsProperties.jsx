import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LayoutSettingsProperties = ({
  pageBackgroundColor,
  onPageBackgroundColorChange,
}) => {
  return (
    <div className="space-y-6 p-1">
      <div>
        <Label htmlFor="pageBackgroundColor" className="text-sm font-medium text-slate-300">Page Background Color (Export)</Label>
        <Input
          id="pageBackgroundColor"
          type="color"
          value={pageBackgroundColor || '#485060'}
          onChange={(e) => onPageBackgroundColorChange(e.target.value)}
          className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer"
        />
        <p className="text-xs text-slate-400 mt-1">Sets the background color for the exported HTML page body.</p>
      </div>
      <p className="text-sm text-slate-400">
        The layout name can be edited in the top bar. Select an element on the canvas to edit its properties.
      </p>
    </div>
  );
};

export default LayoutSettingsProperties;