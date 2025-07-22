import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const useLayoutManager = (toast) => {
  const [layoutName, setLayoutName] = useState('New Page');
  const [layoutSlug, setLayoutSlug] = useState('');
  const [pageBackgroundColor, setPageBackgroundColor] = useState('#485060');
  const [currentLayoutDbId, setCurrentLayoutDbId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  const [isLoadingLayouts, setIsLoadingLayouts] = useState(false);
  const [userLayouts, setUserLayouts] = useState([]);

  const generateSlug = useCallback((name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }, []);

  useEffect(() => {
    if (!layoutSlug && layoutName) {
      setLayoutSlug(generateSlug(layoutName));
    }
  }, [layoutName, layoutSlug, generateSlug]);

  const handleLayoutNameChange = useCallback((newName) => {
    setLayoutName(newName);
    setLayoutSlug(generateSlug(newName));
  }, [generateSlug]);

  const handlePageBackgroundColorChange = useCallback((color) => {
    setPageBackgroundColor(color);
  }, []);

  const saveLayout = useCallback(async (elements, name, slug, bgColor, dbId) => {
    setIsSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      toast({ title: "Not Authenticated", description: "You must be logged in to save.", variant: "destructive" });
      setIsSaving(false);
      return null;
    }

    try {
      const currentSlug = slug || generateSlug(name || 'untitled-page');
      let slugToSave = currentSlug;

      // Check for slug uniqueness
      let query = supabase
          .from('landing_page_layouts')
          .select('id')
          .eq('slug', currentSlug);

      if (dbId) {
          query = query.not('id', 'eq', dbId);
      }
      
      const { data: existing, error: checkError } = await query.maybeSingle();

      if (checkError) {
          console.error("Supabase check error:", checkError);
          // Don't throw for 'PGRST116' (0 rows), that's good. For others, maybe reconsider.
          if (checkError.code !== 'PGRST116') {
             throw checkError;
          }
      }

      if (existing) {
        slugToSave = `${currentSlug}-${uuidv4().slice(0, 4)}`;
        toast({
          title: "Slug Updated",
          description: `The slug "${currentSlug}" was already in use. It has been changed to "${slugToSave}".`,
          variant: "default",
        });
      }

      const layoutData = {
        user_id: session.user.id,
        name: name || 'Untitled Page',
        slug: slugToSave,
        content: elements,
        page_background_color: bgColor || '#485060',
        updated_at: new Date().toISOString(),
      };
      
      let savedData = null;
      let error = null;

      if (dbId) {
        const { data, error: updateError } = await supabase
          .from('landing_page_layouts')
          .update(layoutData)
          .eq('id', dbId)
          .select()
          .single();
        savedData = data;
        error = updateError;
      } else {
        const newId = uuidv4();
        const { data, error: insertError } = await supabase
          .from('landing_page_layouts')
          .insert({ ...layoutData, id: newId })
          .select()
          .single();
        savedData = data;
        error = insertError;
      }

      if (error) throw error;

      if (savedData) {
        toast({ title: "Layout Saved!", description: `"${savedData.name}" has been saved.`, variant: "success" });
        setCurrentLayoutDbId(savedData.id);
        setLayoutName(savedData.name);
        setLayoutSlug(savedData.slug);
        setPageBackgroundColor(savedData.page_background_color || '#485060');
        return savedData;
      }
      return null;

    } catch (err) {
      console.error("Error saving layout:", err);
      toast({ title: "Save Failed", description: err.message || "Could not save layout.", variant: "destructive" });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [toast, generateSlug]);
  
  const loadLayout = useCallback(async (layoutToLoad) => {
    setIsLoadingLayouts(true);
    try {
      let dataToProcess = null;
      if (layoutToLoad && layoutToLoad.id) { 
        dataToProcess = layoutToLoad;
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          setIsLoadingLayouts(false);
          return null; 
        }
        const { data: layouts, error } = await supabase
          .from('landing_page_layouts')
          .select('*')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        if (layouts && layouts.length > 0) {
          dataToProcess = layouts[0];
        }
      }
      
      if (dataToProcess) {
        setLayoutName(dataToProcess.name || 'New Page');
        setLayoutSlug(dataToProcess.slug || generateSlug(dataToProcess.name || 'New Page'));
        setPageBackgroundColor(dataToProcess.page_background_color || '#485060');
        setCurrentLayoutDbId(dataToProcess.id || null);
        toast({ title: "Layout Loaded", description: `"${dataToProcess.name}" has been loaded.`, variant: "default" });
        return {
          id: dataToProcess.id,
          name: dataToProcess.name,
          slug: dataToProcess.slug,
          content: dataToProcess.content || [],
          page_background_color: dataToProcess.page_background_color,
        };
      }
      setLayoutName('New Page');
      setLayoutSlug(generateSlug('New Page'));
      setPageBackgroundColor('#485060');
      setCurrentLayoutDbId(null);
      return null; 
    } catch (err) {
      console.error("Error loading layout:", err);
      toast({ title: "Load Failed", description: err.message || "Could not load layout.", variant: "destructive" });
      setLayoutName('New Page');
      setLayoutSlug(generateSlug('New Page'));
      setPageBackgroundColor('#485060');
      setCurrentLayoutDbId(null);
      return null;
    } finally {
      setIsLoadingLayouts(false);
    }
  }, [toast, generateSlug]);

  const fetchUserLayouts = useCallback(async () => {
    setIsLoadingLayouts(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      setUserLayouts([]);
      setIsLoadingLayouts(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('landing_page_layouts')
        .select('id, name, slug, updated_at')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setUserLayouts(data || []);
    } catch (err) {
      console.error("Error fetching user layouts:", err);
      toast({ title: "Error", description: "Could not fetch your saved layouts.", variant: "destructive" });
      setUserLayouts([]);
    } finally {
      setIsLoadingLayouts(false);
    }
  }, [toast]);

  const deleteLayout = useCallback(async (layoutId) => {
    if (!layoutId) return;
    try {
      const { error } = await supabase
        .from('landing_page_layouts')
        .delete()
        .eq('id', layoutId);
      if (error) throw error;
      toast({ title: "Layout Deleted", description: "The layout has been successfully deleted.", variant: "success" });
      setUserLayouts(prev => prev.filter(layout => layout.id !== layoutId));
      if (currentLayoutDbId === layoutId) {
        setCurrentLayoutDbId(null);
        setLayoutName('New Page');
        setLayoutSlug(generateSlug('New Page'));
        setPageBackgroundColor('#485060');
      }
    } catch (err) {
      console.error("Error deleting layout:", err);
      toast({ title: "Delete Failed", description: err.message || "Could not delete layout.", variant: "destructive" });
    }
  }, [toast, currentLayoutDbId, generateSlug]);
  
  const resetLayoutState = useCallback(() => {
    setLayoutName('New Page');
    setLayoutSlug(generateSlug('New Page'));
    setPageBackgroundColor('#485060');
    setCurrentLayoutDbId(null);
  }, [generateSlug]);

  const clearCanvasAndResetLayout = useCallback(() => {
    resetLayoutState();
    toast({ title: "Canvas Cleared", description: "Ready for a fresh start!", variant: "default" });
    return { newElements: [], newBgColor: '#485060' };
  }, [toast, resetLayoutState]);


  return {
    layoutName,
    setLayoutName,
    layoutSlug,
    setLayoutSlug,
    pageBackgroundColor,
    setPageBackgroundColor,
    currentLayoutDbId,
    setCurrentLayoutDbId,
    isSaving,
    isInitialLoadDone,
    setIsInitialLoadDone,
    isLoadingLayouts,
    userLayouts,
    handleLayoutNameChange,
    handlePageBackgroundColorChange,
    saveLayout,
    loadLayout,
    fetchUserLayouts,
    deleteLayout,
    clearCanvasAndResetLayout,
    resetLayoutState,
    generateSlug
  };
};

export default useLayoutManager;