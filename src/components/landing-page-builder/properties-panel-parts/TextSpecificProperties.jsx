import React, { useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import TextAreaEditor from '@/components/ui/textareaeditor';

const TextSpecificProperties = ({ internalState, handleChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.getEditor) {
      const quill = editorRef.current.getEditor();
      if (quill) {
        quill.enable(true); 
        setTimeout(() => {
            if(document.activeElement !== quill.root) {
                 quill.focus();
            }
        }, 0);
      }
    }
  }, [internalState.content]);


  const handleEditorChange = (content) => {
    if (handleChange && typeof handleChange === 'function') {
      handleChange('content', content);
    }
  };

  return (
    <div>
      <Label htmlFor="text-content-editor" className="text-sm font-medium text-slate-300">Text Content</Label>
      <div className="mt-1">
        <TextAreaEditor
          ref={editorRef}
          id="text-content-editor"
          value={internalState.content || ''}
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
};

export default TextSpecificProperties;