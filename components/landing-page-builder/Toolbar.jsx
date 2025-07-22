import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, GripVertical } from 'lucide-react';

import TextIcon from '@/components/ui/icons/TextIcon';
import HeadingIcon from '@/components/ui/icons/HeadingIcon';
import ButtonIcon from '@/components/ui/icons/ButtonIcon';
import ImageIcon from '@/components/ui/icons/ImageIcon';
import FormIcon from '@/components/ui/icons/FormIcon';
import ShapeIcon from '@/components/ui/icons/ShapeIcon';
import VideoIcon from '@/components/ui/icons/VideoIcon';
import BrowseLayoutIcon from '@/components/ui/icons/BrowseLayoutIcon';
import TrashIcon from '@/components/ui/icons/TrashIcon';
import LoadLayoutsDialog from './LoadLayoutsDialog';


const Toolbar = ({ 
  onAddElement, 
  currentTool, 
  setCurrentTool,
  onLoadLayout,
  onClearCanvas,
  numElements,
  onToggleVisibility
}) => {
  const [isLoadLayoutsOpen, setIsLoadLayoutsOpen] = useState(false);

  const tools = [
    { id: 'heading', icon: HeadingIcon, label: 'Add Heading', color: '#0055ff' },
    { id: 'text', icon: TextIcon, label: 'Add Text', color: '#0091ff' },
    { id: 'button', icon: ButtonIcon, label: 'Add Button', color: '#a600ff' },
    { id: 'image', icon: ImageIcon, label: 'Add Image', color: '#ff00f7' },
    { id: 'video', icon: VideoIcon, label: 'Add Video', color: '#f54242' },
    { id: 'form', icon: FormIcon, label: 'Add Form', color: '#FF00AA' },
    { id: 'shape', icon: ShapeIcon, label: 'Add Shape', color: '#ff4d00' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b border-slate-700 flex justify-between items-center toolbar-drag-handle cursor-grab active:cursor-grabbing">
        <GripVertical size={20} className="text-slate-500 mr-1" />
        <h3 className="text-sm font-semibold text-slate-100 flex-grow">Tools</h3>
        <Button variant="ghost" size="icon" onClick={onToggleVisibility} className="text-slate-400 hover:text-slate-100 w-6 h-6">
          <X size={16} />
        </Button>
      </div>
      <ScrollArea className="flex-grow p-2 custom-scrollbar">
        <div className="flex flex-col items-center gap-2">
          <TooltipProvider delayDuration={0}>
            {tools.map(tool => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={currentTool === tool.id ? "secondary" : "ghost"}
                    size="icon"
                    className="w-10 h-10 rounded-lg"
                    onClick={() => {
                      setCurrentTool(tool.id);
                      onAddElement(tool.id);
                    }}
                  >
                    <tool.icon 
                      className="h-5 w-5" 
                      stroke={tool.color || "currentColor"} 
                      size={tool.id === 'form' ? undefined : "20"}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-900/95 text-slate-200 border-slate-700 backdrop-blur-sm">
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}

            <div className="my-2 border-t border-slate-700 w-full" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-lg"
                  onClick={() => setIsLoadLayoutsOpen(true)}
                >
                  <BrowseLayoutIcon className="h-5 w-5" stroke="#ffbb00" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-900/95 text-slate-200 border-slate-700 backdrop-blur-sm">
                <p>Browse Layouts</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-lg"
                  onClick={onClearCanvas}
                  disabled={numElements === 0}
                >
                  <TrashIcon className="h-5 w-5" stroke="#00fbff" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-900/95 text-slate-200 border-slate-700 backdrop-blur-sm">
                <p>Clear Canvas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </ScrollArea>
      <LoadLayoutsDialog 
        isOpen={isLoadLayoutsOpen}
        onClose={() => setIsLoadLayoutsOpen(false)}
        onLoadLayout={(layout) => {
          onLoadLayout(layout);
          setIsLoadLayoutsOpen(false);
        }}
      />
    </div>
  );
};

export default Toolbar;