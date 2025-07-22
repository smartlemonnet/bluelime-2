import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Smartphone } from 'lucide-react';

const ComingSoonDialog = ({ 
  open, 
  onOpenChange,
  title = "Magic Coming Soon!",
  description = "Get ready for an amazing new feature!",
  buttonText = "Awesome!" 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900/90 border-purple-500/50 text-slate-100 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            <Sparkles className="w-7 h-7 mr-3 text-yellow-400 animate-pulse" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-3 text-slate-200">
          <p>
            {description}
          </p>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-purple-500/70 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 w-full"
          >
            <Smartphone className="w-5 h-5 mr-2" />
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComingSoonDialog;