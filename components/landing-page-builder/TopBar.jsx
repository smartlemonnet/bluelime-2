import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Save, Upload, Undo, Redo, Library, Loader2, Download, LogOut, User, BookOpen, Monitor, Smartphone } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const TopBar = ({
  session,
  onSave,
  onPublish,
  onExport,
  onUndo,
  canUndo,
  onRedo,
  canRedo,
  layoutName,
  onLayoutNameChange,
  isExporting,
  isSaving,
  onOpenLibrary,
  onLogout,
  currentMode,
  onSwitchToDesktop,
  onSwitchToMobile,
}) => {
  const [localLayoutName, setLocalLayoutName] = useState(layoutName);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 h-20 px-6 flex items-center justify-between z-50">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          bluelime<span className="text-purple-500">.cool</span>
        </h1>
        <div className="w-px h-8 bg-slate-700"></div>
        <Input
          type="text"
          placeholder="My Awesome Layout"
          value={localLayoutName}
          onChange={(e) => setLocalLayoutName(e.target.value)}
          onBlur={() => onLayoutNameChange(localLayoutName)}
          className="bg-[#1b2850] border-0 text-white placeholder-slate-400 focus:ring-0 focus:border-0 w-64 text-lg rounded-md"
        />
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} className="text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 flex flex-col h-auto py-1 px-2">
                <Undo size={20} />
                <span className="text-xs mt-1">Undo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} className="text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 flex flex-col h-auto py-1 px-2">
                <Redo size={20} />
                <span className="text-xs mt-1">Redo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="w-px h-8 bg-slate-700 mx-2"></div>
        
        {/* Responsive Mode - Doppia icona sempre visibile */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-md p-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  onClick={onSwitchToDesktop} 
                  className={`flex items-center gap-2 h-8 px-3 transition-all duration-200 ${
                    currentMode === 'desktop' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Monitor size={16} />
                  <span className="text-xs font-medium">Desktop</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Passa alla vista Desktop</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  onClick={onSwitchToMobile} 
                  className={`flex items-center gap-2 h-8 px-3 transition-all duration-200 ${
                    currentMode === 'mobile' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Smartphone size={16} />
                  <span className="text-xs font-medium">Mobile</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Passa alla vista Mobile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="w-px h-8 bg-slate-700 mx-2"></div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={onOpenLibrary} className="text-slate-400 hover:text-white hover:bg-slate-700 flex items-center gap-2">
                <BookOpen size={20} />
                <span className="text-sm">Library</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Block Library</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={onExport} disabled={isExporting} className="text-slate-400 hover:text-white hover:bg-slate-700 flex items-center gap-2">
                {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                <span className="text-sm">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export as ZIP</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button onClick={() => onSave()} disabled={isSaving} variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white">
          {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
          Save
        </Button>

        <Button onClick={onPublish} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
          <Upload size={18} className="mr-2" />
          Publish
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 text-left h-auto p-2 hover:bg-slate-700/50 rounded-full">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                <User className="text-white" />
              </div>
              <div className="hidden md:block">
                <p className="font-semibold text-white text-sm">{session?.user?.user_metadata?.username || session?.user?.email}</p>
                <p className="text-xs text-slate-400">Standard Plan</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.user_metadata?.username || "User"}</p>
                <p className="text-xs leading-none text-slate-400">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopBar;