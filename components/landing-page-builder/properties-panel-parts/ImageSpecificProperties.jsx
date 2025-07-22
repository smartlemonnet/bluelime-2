import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { UploadCloud, Link as LinkIcon, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { supabase } from '@/lib/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

const ImageSpecificProperties = ({ internalState, onUpdate, elementId }) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);

  const getInitialMode = useCallback(() => {
    if (internalState.imageSourceType === 'uploaded_cloud' && internalState.uploadedImageUrl) {
        return 'upload';
    }
    if (internalState.imageSourceType === 'url' && internalState.directImageUrl) {
      return 'url';
    }
    if (internalState.content && internalState.content.startsWith('http')) {
        return 'url';
    }
    return 'upload';
  }, [internalState]);

  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    setMode(getInitialMode());
  }, [internalState, getInitialMode]);
  
  useEffect(() => {
    if (internalState.imageSourceType === 'uploaded_local' && internalState.content?.startsWith('blob:')) {
      setLocalPreviewUrl(internalState.content);
    } else {
      setLocalPreviewUrl(null);
    }
  }, [internalState.content, internalState.imageSourceType]);

  useEffect(() => {
    const urlToRevoke = localPreviewUrl;
    return () => {
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
    };
  }, [localPreviewUrl]);

  const handleChange = (props, historyAction = 'add') => {
    if (onUpdate && elementId) {
      onUpdate(elementId, props, historyAction);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadInProgress(true);

    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    const objectURL = URL.createObjectURL(file);
    setLocalPreviewUrl(objectURL);

    handleChange({
      content: objectURL,
      imageSourceType: 'uploaded_local',
      directImageUrl: '',
    });

    try {
      const fileName = `${uuidv4()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('user-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('user-images').getPublicUrl(data.path);

      if (!publicUrl) throw new Error("Could not get public URL for the image.");

      handleChange({
        content: publicUrl,
        uploadedImageUrl: publicUrl,
        imageSourceType: 'uploaded_cloud',
      });
      
      URL.revokeObjectURL(objectURL);
      setLocalPreviewUrl(null);
      
      toast({ title: 'Upload Successful', description: 'Image has been uploaded.' });
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
      // Revert to a safe state if upload fails
      handleChange({
          content: '',
          imageSourceType: 'url',
          directImageUrl: '',
          uploadedImageUrl: null,
      });
    } finally {
      setUploadInProgress(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleModeChange = (newMode) => {
    if (!newMode || newMode === mode) return;
    setMode(newMode);
    if (newMode === 'url') {
      handleChange({
        content: internalState.directImageUrl || '',
        imageSourceType: 'url',
      });
    } else {
      const uploadContent = internalState.uploadedImageUrl || localPreviewUrl || '';
      handleChange({
        content: uploadContent,
        imageSourceType: internalState.uploadedImageUrl ? 'uploaded_cloud' : (localPreviewUrl ? 'uploaded_local' : 'url'),
      });
    }
  };

  if (!internalState) return null;

  const getButtonText = () => {
    if (uploadInProgress) return 'Uploading...';
    if (mode === 'upload') {
       if (internalState.uploadedImageUrl || localPreviewUrl) {
         return 'Choose Another File';
       }
    }
    return 'Choose Image';
  };
  
  const displayContentValue = internalState.content || '';

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-slate-300 mb-1 block">Image Source</Label>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={handleModeChange}
          className="grid grid-cols-2 gap-1"
          disabled={uploadInProgress}
        >
          <ToggleGroupItem value="url" aria-label="Direct URL" className="data-[state=on]:bg-purple-600 data-[state=on]:text-white hover:bg-slate-600 border-slate-600 h-9 text-xs">
            <LinkIcon className="h-3 w-3 mr-1.5" />Direct URL
          </ToggleGroupItem>
          <ToggleGroupItem value="upload" aria-label="Upload PC" className="data-[state=on]:bg-purple-600 data-[state=on]:text-white hover:bg-slate-600 border-slate-600 h-9 text-xs">
            <UploadCloud className="h-3 w-3 mr-1.5" />Upload PC
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {mode === 'url' && (
        <div>
          <Label htmlFor={`directImageUrl-${elementId}`} className="text-sm font-medium text-slate-300">Direct Image URL</Label>
          <Input
            id={`directImageUrl-${elementId}`}
            type="text"
            value={internalState.directImageUrl || ''}
            onChange={(e) => {
              const newUrl = e.target.value;
              handleChange({
                directImageUrl: newUrl,
                content: newUrl,
                imageSourceType: 'url',
                uploadedImageUrl: null,
              });
            }}
            placeholder="Paste your image URL (https://...)"
            className="mt-1 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-purple-500 focus:border-purple-500"
            disabled={uploadInProgress}
          />
        </div>
      )}

      {mode === 'upload' && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-300">Upload from PC</Label>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-100 flex items-center justify-center"
            disabled={uploadInProgress}
          >
            {uploadInProgress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            {getButtonText()}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/png, image/jpeg, image/gif, image/webp"
            className="hidden"
            disabled={uploadInProgress}
          />
          <p className="text-xs text-slate-400 mt-1">Max 5MB. PNG, JPG, GIF, WEBP.</p>
          {uploadInProgress && <p className="text-xs text-slate-400 mt-1 flex items-center"><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Processing image...</p>}
          {!uploadInProgress && internalState.imageSourceType === 'uploaded_cloud' && (
            <p className="text-xs text-green-400 mt-1 flex items-center"><CheckCircle className="mr-1.5 h-3 w-3" />Image ready.</p>
          )}
           {!uploadInProgress && internalState.imageSourceType === 'uploaded_local' && (
            <p className="text-xs text-amber-400 mt-1 flex items-center"><AlertTriangle className="mr-1.5 h-3 w-3" />Local preview. Uploading...</p>
          )}
        </div>
      )}

      {displayContentValue && (displayContentValue.startsWith('http') || displayContentValue.startsWith('blob:')) && (
        <div className="mt-2 p-2 border border-slate-600 rounded-md bg-slate-800/50">
          <p className="text-xs text-slate-400 mb-1">Preview:</p>
          <div className="w-full h-32 rounded overflow-hidden flex items-center justify-center bg-grid-pattern">
            <img  
                src={displayContentValue} 
                alt="Selected image preview" 
                className="max-w-full max-h-full object-contain"
             />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSpecificProperties;