import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ContentProperties = ({ type, internalState, handleChange }) => {
  return (
    <div>
      <Label htmlFor="content" className="text-sm font-medium text-slate-300">
        {type === 'button' ? 'Button Text' : 'Text Content'}
      </Label>
      <Textarea
        id="content"
        value={internalState.content || ''}
        onChange={(e) => handleChange('content', e.target.value)}
        placeholder={type === 'button' ? 'Enter button text' : 'Enter text'}
        className="mt-1 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-purple-500 focus:border-purple-500 min-h-[80px]"
      />
    </div>
  );
};

export default ContentProperties;