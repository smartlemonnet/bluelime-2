import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import DraggableElementPreview from '@/components/landing-page-builder/DraggableElementPreview';

const DESKTOP_BASE_WIDTH = 1920;
const MOBILE_BASE_WIDTH = 390;

const PreviewPage = ({ isPublic }) => {
  const { slug, id } = useParams();
  
  const [elements, setElements] = useState([]);
  const [layoutName, setLayoutName] = useState('');
  const [pageBackgroundColor, setPageBackgroundColor] = useState('#485060');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layoutOwnerId, setLayoutOwnerId] = useState(null);
  const [layoutDbId, setLayoutDbId] = useState(null);
  const [currentMode, setCurrentMode] = useState('desktop');
  const { toast } = useToast();

  // Detect screen size and set responsive mode - FIXED per device detection corretta
  useEffect(() => {
    const detectScreenSize = () => {
      // Fix: Usa una logica più precisa per device detection
      // Desktop: schermi > 1024px O desktop/laptop espliciti
      // Mobile: schermi <= 768px O touch device
      const screenWidth = window.innerWidth;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Logic migliorata per device detection
      const isMobileDevice = (
        screenWidth <= 768 ||  // Schermi piccoli
        (screenWidth <= 1024 && isTouchDevice) // Tablet in portrait o touch device
      );
      
      setCurrentMode(isMobileDevice ? 'mobile' : 'desktop');
    };

    detectScreenSize();
    window.addEventListener('resize', detectScreenSize);
    
    return () => window.removeEventListener('resize', detectScreenSize);
  }, []);

  const fetchLayoutData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let query = supabase.from('landing_page_layouts');

    if (isPublic) {
      if (!slug) {
        setError("No layout slug provided in URL.");
        setIsLoading(false);
        return;
      }
      query = query.select('id, content, name, slug, page_background_color, user_id').eq('slug', slug).single();
    } else {
      if (!id) {
        setError("No layout ID provided for preview.");
        setIsLoading(false);
        return;
      }
      query = query.select('id, content, name, slug, page_background_color, user_id').eq('id', id).single();
    }
    
    const { data, error: dbError } = await query;

    if (dbError) {
      const identifier = isPublic ? `slug "${slug}"` : `ID "${id}"`;
      const errorMessage = dbError.code === 'PGRST116' ? `Layout with ${identifier} not found.` : (dbError.message || 'Unknown database error');
      toast({ title: "Error Fetching Layout", description: errorMessage, variant: "destructive" });
      setError("Failed to load layout: " + errorMessage);
      setElements([]);
    } else if (data) {
      try {
        const parsedElements = data.content || [];
        if (Array.isArray(parsedElements)) {
          setElements(parsedElements.filter(el => el.type !== 'section'));
          setLayoutName(data.name || data.slug || 'Untitled Layout');
          setPageBackgroundColor(data.page_background_color || '#485060');
          setLayoutOwnerId(data.user_id);
          setLayoutDbId(data.id);
        } else {
          setElements([]);
          setLayoutName(data.name || data.slug || 'Untitled Layout');
          setPageBackgroundColor(data.page_background_color || '#485060');
          setLayoutOwnerId(null);
          setLayoutDbId(null);
          toast({ title: "Corrupt Layout Data", description: "Layout content is not in the expected format.", variant: "destructive" });
          setError("Layout content is not in the expected format.");
        }
      } catch (parseError) {
        const parseErrorMessage = parseError && parseError.message ? parseError.message : 'Unknown parsing error';
        toast({ title: "Error Parsing Layout Data", description: parseErrorMessage, variant: "destructive" });
        setError("Failed to parse layout data: " + parseErrorMessage);
        setElements([]);
        setLayoutOwnerId(null);
        setLayoutDbId(null);
      }
    } else {
      const identifier = isPublic ? `slug "${slug}"` : `ID "${id}"`;
      setError(`Layout with ${identifier} not found.`);
      setElements([]);
      setLayoutOwnerId(null);
      setLayoutDbId(null);
    }
    setIsLoading(false);
  }, [slug, id, toast, isPublic]);

  useEffect(() => {
    fetchLayoutData();
  }, [fetchLayoutData]);
  
  useEffect(() => {
    if (layoutName) {
      document.title = layoutName;
    } else if (slug || id) {
      document.title = `Preview: ${slug || id}`;
    } else {
      document.title = 'Landing Page Preview';
    }
  }, [layoutName, slug, id]);

  useEffect(() => {
    document.body.style.backgroundColor = pageBackgroundColor;
    return () => {
      document.body.style.backgroundColor = ''; 
    };
  }, [pageBackgroundColor]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white" style={{backgroundColor: pageBackgroundColor}}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full"
        />
        <p className="ml-4 text-xl">Loading Preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-900 text-red-100 p-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-300">Preview Error</h1>
        <p className="text-lg mb-6">{error}</p>
        <Link 
          to="/" 
          className="mt-4 inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-semibold shadow-md hover:shadow-lg"
        >
          Back to Editor
        </Link>
      </div>
    );
  }

  if (!elements || elements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-300 p-8 text-center" style={{backgroundColor: pageBackgroundColor}}>
        <h1 className="text-2xl font-semibold mb-4">Nothing to Display</h1>
        <p className="mb-6">No elements found for this layout or the layout is empty.</p>
        {!isPublic && <p className="text-sm mb-6">(Save your layout before previewing to see the latest changes)</p>}
        <Link 
          to="/" 
          className="mt-4 inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-semibold shadow-md hover:shadow-lg"
        >
          Back to Editor
        </Link>
      </div>
    );
  }
  
  let maxElementXExtent = 0;
  elements.forEach(el => {
    maxElementXExtent = Math.max(maxElementXExtent, (el.x || 0) + (el.width || 0));
  });
  
  // Use responsive width based on current mode
  const baseWidth = currentMode === 'mobile' ? MOBILE_BASE_WIDTH : DESKTOP_BASE_WIDTH;
  const containerWidth = currentMode === 'mobile' ? 
    Math.min(window.innerWidth - 20, MOBILE_BASE_WIDTH) : 
    Math.max(maxElementXExtent, baseWidth);
  
  let maxContentY = 0;
  elements.forEach(el => {
    maxContentY = Math.max(maxContentY, (el.y || 0) + (el.height || 0));
  });
  const containerHeight = Math.max(maxContentY + 50, isNaN(window.innerHeight) ? 900 : window.innerHeight );


  return (
    <div className="min-h-screen w-full flex justify-center items-start pt-5 pb-5"> 
      <div 
        className="relative shadow-xl" 
        style={{ 
          width: `${containerWidth}px`, 
          minHeight: `${containerHeight}px`,
          height: 'auto', 
          backgroundColor: pageBackgroundColor, 
        }}
      >
        {elements.map(element => {
          // Fix: Applica le proprietà responsive corrette basate sulla modalità detectata
          const getResponsiveProperties = (el, mode) => {
            // Se l'elemento ha proprietà responsive, usa quelle
            if (el.desktopProperties && el.mobileProperties) {
              const props = mode === 'mobile' ? el.mobileProperties : el.desktopProperties;
              return {
                x: props.x || el.x || 0,
                y: props.y || el.y || 0,
                width: props.width || el.width || 200,
                height: props.height || el.height || 150,
                zIndex: props.zIndex || el.zIndex || 1
              };
            }
            // Fallback per elementi non migrati
            return {
              x: el.x || 0,
              y: el.y || 0,
              width: el.width || 200,
              height: el.height || 150,
              zIndex: el.zIndex || 1
            };
          };
          
          const responsiveProps = getResponsiveProperties(element, currentMode);
          
          return (
            <motion.div
              key={element.id}
              className="absolute" 
              style={{
                left: `${responsiveProps.x}px`,
                top: `${responsiveProps.y}px`,
                width: `${responsiveProps.width}px`,
                height: `${responsiveProps.height}px`,
                zIndex: responsiveProps.zIndex,
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: responsiveProps.zIndex * 0.02 }}
            >
              <DraggableElementPreview 
                element={{...element, ...responsiveProps, layoutId: layoutDbId }}
                layoutOwnerId={layoutOwnerId}
                currentMode={currentMode}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PreviewPage;