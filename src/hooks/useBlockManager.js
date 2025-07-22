import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const useBlockManager = (toast) => {
  const [isSavingBlock, setIsSavingBlock] = useState(false);

  const generateSlug = useCallback((name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }, []);

  const saveBlockToLibrary = useCallback(async (blockName, elements) => {
    if (!blockName || !elements || elements.length === 0) {
      toast({
        title: "Cannot Save Block",
        description: "Block name and content are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingBlock(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      toast({ title: "Not Authenticated", description: "You must be logged in to save blocks.", variant: "destructive" });
      setIsSavingBlock(false);
      return;
    }

    try {
      const slug = generateSlug(blockName);
      
      const relativeElements = elements.map(el => ({
        ...el,
        x: el.x,
        y: el.y,
      }));

      const blockData = {
        id: uuidv4(),
        user_id: session.user.id,
        name: blockName,
        slug: slug,
        content: relativeElements,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('blocklibrary').insert(blockData);

      if (error) throw error;

      toast({
        title: "Block Saved!",
        description: `"${blockName}" has been saved to your library.`,
        variant: "success",
      });

    } catch (err) {
      console.error("Error saving block:", err);
      toast({
        title: "Save Failed",
        description: err.message || "Could not save the block.",
        variant: "destructive",
      });
    } finally {
      setIsSavingBlock(false);
    }
  }, [toast, generateSlug]);

  return {
    isSavingBlock,
    saveBlockToLibrary,
  };
};

export default useBlockManager;