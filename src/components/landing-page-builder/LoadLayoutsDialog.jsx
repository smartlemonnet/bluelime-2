import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const LoadLayoutsDialog = ({ isOpen, onClose, onLoadLayout }) => {
  const [layouts, setLayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchLayouts();
    }
  }, [isOpen]);

  const fetchLayouts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('landing_page_layouts')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        title: "Error Loading Layouts",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setLayouts(data || []);
    }
    setIsLoading(false);
  };

  const handleDeleteLayout = async (id) => {
    const { error } = await supabase
      .from('landing_page_layouts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error Deleting Layout",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Layout Deleted",
        description: "The layout has been successfully deleted.",
      });
      fetchLayouts(); // Refresh layouts list
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-800 text-slate-100 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-100">Your Saved Layouts</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : layouts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>You haven't saved any layouts yet. Create one and save it!</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {layouts.map((layout) => (
                  <motion.div
                    key={layout.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-slate-100">{layout.name}</h3>
                        <p className="text-sm text-slate-400">Last modified: {formatDate(layout.updated_at)}</p>
                        <p className="text-sm text-slate-500 mt-1">/{layout.slug}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLayout(layout.id)}
                          className="text-slate-400 hover:text-red-400 hover:bg-slate-700 p-2"
                          aria-label="Delete layout"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onLoadLayout(layout)}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Load
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadLayoutsDialog;