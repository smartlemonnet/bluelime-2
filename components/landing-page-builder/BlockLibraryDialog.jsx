import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const BlockLibraryDialog = ({ isOpen, onClose, onLoadBlock }) => {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchBlocks();
    }
  }, [isOpen]);

  const fetchBlocks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blocklibrary')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        title: "Error Loading Blocks",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setBlocks(data || []);
    }
    setIsLoading(false);
  };

  const handleDeleteBlock = async (id) => {
    const { error } = await supabase
      .from('blocklibrary')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error Deleting Block",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Block Deleted",
        description: "The block has been successfully deleted.",
      });
      fetchBlocks();
    }
  };

  const handleLoadBlock = (block) => {
    if (onLoadBlock && block.content) {
      onLoadBlock(block.content);
      onClose();
    } else {
      toast({
        title: "Error",
        description: "Could not load block. Content is missing.",
        variant: "destructive"
      });
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
          <DialogTitle className="text-xl font-semibold text-slate-100">Block Library</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>Your block library is empty. You can save groups of elements as blocks.</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {blocks.map((block) => (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-amber-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-slate-100">{block.name}</h3>
                        <p className="text-sm text-slate-400">Last modified: {formatDate(block.updated_at)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBlock(block.id)}
                          className="text-slate-400 hover:text-red-400 hover:bg-slate-700 p-2"
                          aria-label="Delete block"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleLoadBlock(block)}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
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

export default BlockLibraryDialog;