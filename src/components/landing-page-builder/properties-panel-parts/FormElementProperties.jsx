import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Plus, Minus } from 'lucide-react';

const FormElementProperties = ({
  internalState,
  handleChange,
  formFields,
  handleFormFieldChange,
  addFormField,
  removeFormField,
}) => {
  if (!internalState) return null;

  return (
    <>
      <div>
        <Label htmlFor="formTitle" className="text-sm font-medium text-slate-300">Form Title</Label>
        <Input
          id="formTitle"
          type="text"
          value={internalState.content || 'Form Title'}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="Enter form title"
          className="mt-1 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      <div className="space-y-3 p-3 border border-slate-700 rounded-md bg-slate-700/30 mt-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Form Background</h4>
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
        {internalState.backgroundType === 'gradient' ? (
          <>
            <div>
              <Label htmlFor="formGradientStartColor" className="text-sm font-medium text-slate-300">Gradient Start</Label>
              <Input id="formGradientStartColor" type="color" value={internalState.gradientStartColor || '#8B5CF6'} onChange={(e) => handleChange('gradientStartColor', e.target.value)} className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer" />
            </div>
            <div>
              <Label htmlFor="formGradientEndColor" className="text-sm font-medium text-slate-300">Gradient End</Label>
              <Input id="formGradientEndColor" type="color" value={internalState.gradientEndColor || '#3B82F6'} onChange={(e) => handleChange('gradientEndColor', e.target.value)} className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer" />
            </div>
            <div>
              <Label htmlFor="formGradientDirection" className="text-sm font-medium text-slate-300">Direction</Label>
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
          <div>
            <Label htmlFor="formBackgroundColor" className="text-sm font-medium text-slate-300">Background Color</Label>
            <Input
              id="formBackgroundColor"
              type="color"
              value={internalState.backgroundColor === 'transparent' ? '#000000' : (internalState.backgroundColor || '#272E3B')}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer"
            />
          </div>
        )}
      </div>


      <div className="space-y-4 mt-6">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium text-slate-300">Form Fields</Label>
          <Button
            onClick={addFormField}
            variant="outline"
            size="sm"
            className="text-purple-400 border-purple-400 hover:bg-purple-400/20"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Field
          </Button>
        </div>

        {formFields.map((field, index) => (
          <div key={field.id || index} className="space-y-2 p-3 bg-slate-700/50 rounded-md">
            <div className="flex justify-between items-start">
              <div className="flex-grow space-y-2">
                <Input
                  value={field.label}
                  onChange={(e) => handleFormFieldChange(index, { ...field, label: e.target.value })}
                  placeholder="Field Label"
                  className="bg-slate-600 border-slate-500 text-slate-100"
                />
                <div className="flex gap-2">
                  <Select
                    value={field.type}
                    onValueChange={(value) => handleFormFieldChange(index, { ...field, type: value })}
                  >
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-slate-100">
                      <SelectValue placeholder="Field Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="tel">Phone</SelectItem>
                      <SelectItem value="textarea">Text Area</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFormFieldChange(index, { ...field, required: !field.required })}
                    className={`${field.required ? 'text-purple-400' : 'text-slate-400'}`}
                  >
                    Required
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFormField(index)}
                className="text-slate-400 hover:text-red-400 hover:bg-slate-600 ml-2"
                disabled={formFields.length <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 mt-6">
        <div>
          <Label htmlFor="fieldBackgroundColor" className="text-sm font-medium text-slate-300">Field Background Color</Label>
          <Input
            id="fieldBackgroundColor"
            type="color"
            value={internalState.fieldBackgroundColor || '#FFFFFF'}
            onChange={(e) => handleChange('fieldBackgroundColor', e.target.value)}
            className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer"
          />
        </div>
        <div>
          <Label htmlFor="fieldTextColor" className="text-sm font-medium text-slate-300">Field Text Color</Label>
          <Input
            id="fieldTextColor"
            type="color"
            value={internalState.fieldTextColor || '#1F2937'}
            onChange={(e) => handleChange('fieldTextColor', e.target.value)}
            className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer"
          />
        </div>
        <div>
          <Label htmlFor="recipientEmail" className="text-sm font-medium text-slate-300">Recipient Email</Label>
          <Input
            id="recipientEmail"
            type="email"
            value={internalState.recipientEmail || ''}
            onChange={(e) => handleChange('recipientEmail', e.target.value)}
            placeholder="Enter recipient email"
            className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>
        <div>
          <Label htmlFor="submitButtonText" className="text-sm font-medium text-slate-300">Submit Button Text</Label>
          <Input
            id="submitButtonText"
            type="text"
            value={internalState.submitButtonText || ''}
            onChange={(e) => handleChange('submitButtonText', e.target.value)}
            placeholder="Submit"
            className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>

        <div className="space-y-3 p-3 border border-slate-700 rounded-md bg-slate-700/30 mt-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Submit Button Background</h4>
          <div>
            <Label className="text-sm font-medium text-slate-300">Background Type</Label>
            <ToggleGroup
              type="single"
              value={internalState.submitButtonBackgroundType || 'solid'}
              onValueChange={(val) => { if (val) handleChange('submitButtonBackgroundType', val);}}
              className="mt-1 grid grid-cols-2 gap-1"
            >
              <ToggleGroupItem value="solid" aria-label="Solid Color" className="data-[state=on]:bg-purple-600 data-[state=on]:text-white hover:bg-slate-600 border-slate-600 h-9">Solid</ToggleGroupItem>
              <ToggleGroupItem value="gradient" aria-label="Gradient" className="data-[state=on]:bg-purple-600 data-[state=on]:text-white hover:bg-slate-600 border-slate-600 h-9">Gradient</ToggleGroupItem>
            </ToggleGroup>
          </div>
          {internalState.submitButtonBackgroundType === 'gradient' ? (
            <>
              <div>
                <Label htmlFor="submitButtonGradientStartColor" className="text-sm font-medium text-slate-300">Gradient Start</Label>
                <Input id="submitButtonGradientStartColor" type="color" value={internalState.submitButtonGradientStartColor || '#8B5CF6'} onChange={(e) => handleChange('submitButtonGradientStartColor', e.target.value)} className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer" />
              </div>
              <div>
                <Label htmlFor="submitButtonGradientEndColor" className="text-sm font-medium text-slate-300">Gradient End</Label>
                <Input id="submitButtonGradientEndColor" type="color" value={internalState.submitButtonGradientEndColor || '#3B82F6'} onChange={(e) => handleChange('submitButtonGradientEndColor', e.target.value)} className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer" />
              </div>
              <div>
                <Label htmlFor="submitButtonGradientDirection" className="text-sm font-medium text-slate-300">Direction</Label>
                <Select value={internalState.submitButtonGradientDirection || 'to bottom right'} onValueChange={(val) => handleChange('submitButtonGradientDirection', val)}>
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
            <div>
              <Label htmlFor="submitButtonColor" className="text-sm font-medium text-slate-300">Background Color</Label>
              <Input
                id="submitButtonColor"
                type="color"
                value={internalState.submitButtonColor || '#6D28D9'}
                onChange={(e) => handleChange('submitButtonColor', e.target.value)}
                className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer"
              />
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="submitButtonTextColor" className="text-sm font-medium text-slate-300">Submit Button Text Color</Label>
          <Input
            id="submitButtonTextColor"
            type="color"
            value={internalState.submitButtonTextColor || '#FFFFFF'}
            onChange={(e) => handleChange('submitButtonTextColor', e.target.value)}
            className="mt-1 w-full h-10 p-0.5 bg-slate-700 border-slate-600 rounded-md cursor-pointer"
          />
        </div>
      </div>
    </>
  );
};

export default FormElementProperties;