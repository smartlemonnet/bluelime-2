import React from 'react';
import ReactQuill from 'react-quill';
import { cn } from '@/lib/utils';

const TextAreaEditor = React.forwardRef(({ value, onChange, placeholder, className, id, ...props }, ref) => {
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link'], 
      ['clean']
    ],
  };

  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
  ];

  const handleQuillChange = (content, delta, source, editor) => {
    if (onChange && source === 'user') {
      onChange(content);
    }
  };

  return (
    <div className={cn("bg-slate-700 border-slate-600 text-slate-100 rounded-md", className)}>
      <ReactQuill
        ref={ref}
        id={id}
        theme="snow"
        value={value || ''}
        onChange={handleQuillChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Enter your text here..."}
        className="quill-editor" 
        {...props}
      />
      <style jsx global>{`
        .quill-editor .ql-toolbar {
          border-top-left-radius: 0.375rem; /* rounded-md */
          border-top-right-radius: 0.375rem; /* rounded-md */
          border-color: #475569; /* slate-600 */
          background-color: #334155; /* slate-700 */
        }
        .quill-editor .ql-toolbar .ql-stroke {
          stroke: #cbd5e1; /* slate-300 */
        }
        .quill-editor .ql-toolbar .ql-fill {
          fill: #cbd5e1; /* slate-300 */
        }
        .quill-editor .ql-toolbar .ql-picker-label {
          color: #cbd5e1; /* slate-300 */
        }
        .quill-editor .ql-toolbar .ql-picker-options {
          background-color: #334155; /* slate-700 */
          border-color: #475569; /* slate-600 */
        }
        .quill-editor .ql-toolbar .ql-picker-item:hover {
          color: #9333ea; /* purple-600 */
        }
        .quill-editor .ql-toolbar .ql-picker-item.ql-selected {
          color: #a855f7; /* purple-500 */
        }
        .quill-editor .ql-container {
          border-bottom-left-radius: 0.375rem; /* rounded-md */
          border-bottom-right-radius: 0.375rem; /* rounded-md */
          border-color: #475569; /* slate-600 */
          color: #e2e8f0; /* slate-100 */
          min-height: 120px;
          font-size: 0.875rem; /* text-sm */
        }
        .quill-editor .ql-editor {
          background-color: #1e293b; /* slate-800 or a slightly darker shade than toolbar */
          padding: 12px; 
        }
        .quill-editor .ql-editor p,
        .quill-editor .ql-editor ul,
        .quill-editor .ql-editor ol,
        .quill-editor .ql-editor li,
        .quill-editor .ql-editor h1,
        .quill-editor .ql-editor h2,
        .quill-editor .ql-editor h3 {
          margin-top: 0;
          margin-bottom: 0; 
          padding: 0;
        }
        .quill-editor .ql-editor.ql-blank::before {
          color: #94a3b8; /* slate-400 for placeholder */
          font-style: normal;
          left: 12px; 
          right: 12px; 
        }
      `}</style>
    </div>
  );
});

TextAreaEditor.displayName = 'TextAreaEditor';

export default TextAreaEditor;