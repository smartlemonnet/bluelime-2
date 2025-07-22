
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';

// Utilità per migrare elementi esistenti al nuovo formato con proprietà separate
const migrateElementToResponsive = (element) => {
  if (element.desktopProperties || element.mobileProperties) {
    return element; // Già migrato
  }

  // Estrae le proprietà posizionali e di stile
  const responsiveProps = {
    x: element.x || 100,
    y: element.y || 100,
    width: element.width || 200,
    height: element.height || 150,
    fontSize: element.fontSize,
    padding: element.padding,
    borderRadius: element.borderRadius,
    zIndex: element.zIndex || 1
  };

  // Per mobile, calcola posizione verticale predefinita e scala le dimensioni
  const scaleFactor = 390 / Math.min(window.innerWidth || 1080, 1080);
  const mobileProps = {
    x: 20, // Centrato orizzontalmente con margine
    y: responsiveProps.y, // Mantiene la posizione Y iniziale
    width: Math.min(350, responsiveProps.width * scaleFactor), // Larghezza adattata al mobile
    height: responsiveProps.height * scaleFactor,
    fontSize: responsiveProps.fontSize ? Math.max(14, Math.round(responsiveProps.fontSize * scaleFactor)) : undefined,
    padding: responsiveProps.padding ? Math.max(8, Math.round(responsiveProps.padding * scaleFactor)) : undefined,
    borderRadius: responsiveProps.borderRadius ? Math.round(responsiveProps.borderRadius * scaleFactor) : undefined,
    zIndex: responsiveProps.zIndex
  };

  // Rimuove le proprietà responsive dall'elemento base
  const { x, y, width, height, fontSize, padding, borderRadius, zIndex, ...baseElement } = element;

  return {
    ...baseElement,
    desktopProperties: responsiveProps,
    mobileProperties: mobileProps
  };
};

// Applica le proprietà per la modalità corrente
const applyResponsiveProperties = (element, currentMode) => {
  const migratedElement = migrateElementToResponsive(element);
  const properties = currentMode === 'mobile' ? migratedElement.mobileProperties : migratedElement.desktopProperties;
  
  return {
    ...migratedElement,
    ...properties
  };
};

// Calcola layout mobile verticale
const calculateMobileVerticalLayout = (elements) => {
  let currentY = 20; // Margine iniziale
  const mobileWidth = 350; // Larghezza standard per elementi mobile
  const horizontalMargin = 20;
  
  return elements.map(element => {
    if (element.type === 'section' || element.groupId) {
      return element; // Non modifica sezioni o elementi in gruppi
    }

    const updatedElement = {
      ...element,
      mobileProperties: {
        ...element.mobileProperties,
        x: horizontalMargin,
        y: currentY,
        width: Math.min(mobileWidth, element.mobileProperties?.width || 350)
      }
    };

    currentY += (element.mobileProperties?.height || 150) + 8; // 8px di spaziatura
    return updatedElement;
  });
};

const useElementManager = (toast, selectedElementIds, setSelectedElementIds, currentMode = 'desktop') => {
  const [elements, setElements] = useState([]);

  const addElement = useCallback((type, properties = {}) => {
    let baseProps = {
      id: uuidv4(),
      type,
    };

    let desktopProps = {
      x: 100,
      y: 100,
      zIndex: elements.length + 1,
    };

    let mobileProps = {
      x: 20,
      y: 100,
      zIndex: elements.length + 1,
    };

    switch (type) {
      case 'heading':
        baseProps.content = 'Heading Text';
        desktopProps = { ...desktopProps, width: 300, height: 60 };
        mobileProps = { ...mobileProps, width: 350, height: 50 };
        break;
      case 'text':
        baseProps.content = 'Some text content';
        desktopProps = { ...desktopProps, width: 200, height: 100 };
        mobileProps = { ...mobileProps, width: 350, height: 80 };
        break;
      case 'button':
        baseProps.content = 'Click me';
        desktopProps = { ...desktopProps, width: 150, height: 50 };
        mobileProps = { ...mobileProps, width: 200, height: 45 };
        break;
      case 'form':
        baseProps = {
          ...baseProps,
          content: 'You form title',
          backgroundType: 'gradient',
          gradientStartColor: '#C4B5FD',
          gradientEndColor: '#A5B4FC',
          gradientDirection: 'to bottom right',
          borderRadius: 12,
          textColor: '#FFFFFF',
          textAlign: 'center',
          formFields: [
            { id: uuidv4(), label: 'Name', type: 'text', required: true, placeholder: 'Name' },
            { id: uuidv4(), label: 'Mail', type: 'email', required: true, placeholder: 'Mail' }
          ],
          fieldBackgroundColor: '#F3E8FF',
          fieldTextColor: '#4A5568',
          submitButtonText: 'Submit',
          submitButtonColor: '#4338CA',
          submitButtonTextColor: '#FFFFFF',
          submitButtonBackgroundType: 'solid',
        };
        desktopProps = { ...desktopProps, width: 350, height: 300 };
        mobileProps = { ...mobileProps, width: 350, height: 280 };
        break;
      default:
        baseProps.content = '';
        desktopProps = { ...desktopProps, width: 200, height: 150 };
        mobileProps = { ...mobileProps, width: 300, height: 120 };
        break;
    }

    const newElement = {
      ...baseProps,
      ...properties,
      desktopProperties: { ...desktopProps, ...(properties.desktopProperties || {}) },
      mobileProperties: { ...mobileProps, ...(properties.mobileProperties || {}) }
    };

    // Applica le proprietà per la modalità corrente
    const elementWithCurrentProps = applyResponsiveProperties(newElement, currentMode);
    
    const newElements = [...elements, elementWithCurrentProps];
    setElements(newElements);
    setSelectedElementIds([newElement.id]);
    return newElements;
  }, [elements, setSelectedElementIds, currentMode]);

  const addBlock = useCallback((blockElements) => {
    if (!blockElements || blockElements.length === 0) return elements;

    const newElementsToAdd = [];
    const groupElement = blockElements.find(el => el.type === 'group');
    
    if (groupElement) {
      const newGroupId = uuidv4();
      const oldGroupId = groupElement.id;

      const newGroupElement = {
        ...groupElement,
        id: newGroupId,
        x: groupElement.x + 20,
        y: groupElement.y + 20,
        zIndex: (groupElement.zIndex || 0) + elements.length,
      };
      newElementsToAdd.push(newGroupElement);

      const childElements = blockElements.filter(el => el.groupId === oldGroupId);
      childElements.forEach(child => {
        newElementsToAdd.push({
          ...child,
          id: uuidv4(),
          groupId: newGroupId,
          x: child.x + 20,
          y: child.y + 20,
          zIndex: (child.zIndex || 0) + elements.length,
        });
      });
      setSelectedElementIds([newGroupId]);
    } else {
      blockElements.forEach(el => {
        newElementsToAdd.push({
          ...el,
          id: uuidv4(),
          x: el.x + 20,
          y: el.y + 20,
          zIndex: (el.zIndex || 0) + elements.length,
        });
      });
      setSelectedElementIds(newElementsToAdd.map(el => el.id));
    }
    
    const newElements = [...elements, ...newElementsToAdd];
    setElements(newElements);
    return newElements;
  }, [elements, setSelectedElementIds]);

  const updateElement = useCallback((idOrUpdates, props) => {
    const newElements = produce(elements, draft => {
      if (Array.isArray(idOrUpdates)) {
        idOrUpdates.forEach(({ id, props: itemProps }) => {
          const elementToUpdate = draft.find(el => el.id === id);
          if (elementToUpdate) {
            // Migra l'elemento se necessario
            const migratedElement = migrateElementToResponsive(elementToUpdate);
            Object.assign(elementToUpdate, migratedElement);
            
            // Salva le proprietà responsive nella modalità corrente
            const { x, y, width, height, fontSize, padding, borderRadius, zIndex, ...otherProps } = itemProps;
            const responsiveProps = { x, y, width, height, fontSize, padding, borderRadius, zIndex };
            const nonResponsiveProps = otherProps;
            
            // Aggiorna proprietà non responsive
            Object.assign(elementToUpdate, nonResponsiveProps);
            
            // Aggiorna proprietà responsive nella modalità corrente
            if (Object.keys(responsiveProps).some(key => responsiveProps[key] !== undefined)) {
              const currentProperties = currentMode === 'mobile' ? 'mobileProperties' : 'desktopProperties';
              elementToUpdate[currentProperties] = {
                ...elementToUpdate[currentProperties],
                ...Object.fromEntries(Object.entries(responsiveProps).filter(([_, v]) => v !== undefined))
              };
            }
            
            // Applica le proprietà per la modalità corrente
            const appliedElement = applyResponsiveProperties(elementToUpdate, currentMode);
            Object.assign(elementToUpdate, appliedElement);
          }
        });
      } else {
        const elementToUpdate = draft.find(el => el.id === idOrUpdates);
        if (elementToUpdate) {
          // Migra l'elemento se necessario
          const migratedElement = migrateElementToResponsive(elementToUpdate);
          Object.assign(elementToUpdate, migratedElement);
          
          // Salva le proprietà responsive nella modalità corrente
          const { x, y, width, height, fontSize, padding, borderRadius, zIndex, ...otherProps } = props;
          const responsiveProps = { x, y, width, height, fontSize, padding, borderRadius, zIndex };
          const nonResponsiveProps = otherProps;
          
          // Aggiorna proprietà non responsive
          Object.assign(elementToUpdate, nonResponsiveProps);
          
          // Aggiorna proprietà responsive nella modalità corrente
          if (Object.keys(responsiveProps).some(key => responsiveProps[key] !== undefined)) {
            const currentProperties = currentMode === 'mobile' ? 'mobileProperties' : 'desktopProperties';
            elementToUpdate[currentProperties] = {
              ...elementToUpdate[currentProperties],
              ...Object.fromEntries(Object.entries(responsiveProps).filter(([_, v]) => v !== undefined))
            };
          }
          
          // Applica le proprietà per la modalità corrente
          const appliedElement = applyResponsiveProperties(elementToUpdate, currentMode);
          Object.assign(elementToUpdate, appliedElement);
        }
      }
    });
    setElements(newElements);
    return newElements;
  }, [elements, currentMode]);

  const updateMultipleElements = useCallback((ids, props) => {
    const newElements = produce(elements, draft => {
      ids.forEach(id => {
        const elementToUpdate = draft.find(el => el.id === id);
        if (elementToUpdate) {
          Object.assign(elementToUpdate, props);
        }
      });
    });
    setElements(newElements);
    return newElements;
  }, [elements]);

  const removeElement = useCallback((id) => {
    const elementToRemove = elements.find(el => el.id === id);
    if (!elementToRemove) return elements;

    let elementsToRemoveIds = [id];
    if (elementToRemove.type === 'group') {
      const children = elements.filter(el => el.groupId === id);
      elementsToRemoveIds = [...elementsToRemoveIds, ...children.map(c => c.id)];
    }

    const newElements = elements.filter(el => !elementsToRemoveIds.includes(el.id));
    setElements(newElements);
    setSelectedElementIds([]);
    return newElements;
  }, [elements, setSelectedElementIds]);

  const duplicateElement = useCallback((id) => {
    const elementToDuplicate = elements.find(el => el.id === id);
    if (!elementToDuplicate) return elements;
    
    let newElementsToReturn;

    if (elementToDuplicate.type === 'group') {
        const childElements = elements.filter(el => el.groupId === elementToDuplicate.id);
        const newGroupId = uuidv4();
        
        const newChildElements = childElements.map(child => ({
            ...child,
            id: uuidv4(),
            x: child.x + 20,
            y: child.y + 20,
            zIndex: child.zIndex, 
            groupId: newGroupId
        }));

        const newGroup = {
            ...elementToDuplicate,
            id: newGroupId,
            x: elementToDuplicate.x + 20,
            y: elementToDuplicate.y + 20,
        };
        
        newElementsToReturn = [...elements, newGroup, ...newChildElements];
        setSelectedElementIds([newGroupId]);
    } else {
        const newElement = {
            ...elementToDuplicate,
            id: uuidv4(),
            x: elementToDuplicate.x + 20,
            y: elementToDuplicate.y + 20,
            zIndex: elements.length + 1,
        };
        newElementsToReturn = [...elements, newElement];
        setSelectedElementIds([newElement.id]);
    }

    setElements(newElementsToReturn);
    return newElementsToReturn;
  }, [elements, setSelectedElementIds]);

  const changeElementLayerOrder = useCallback((elementId, direction) => {
    const newElements = produce(elements, draft => {
      const sortedElements = [...draft].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      const targetElementIndex = sortedElements.findIndex(el => el.id === elementId);
  
      if (targetElementIndex === -1) {
        console.error("Target element not found for layer change");
        return;
      }
  
      const targetElement = sortedElements[targetElementIndex];
  
      switch (direction) {
        case 'bringToFront':
          sortedElements.splice(targetElementIndex, 1);
          sortedElements.push(targetElement);
          break;
  
        case 'sendToBack':
          sortedElements.splice(targetElementIndex, 1);
          sortedElements.unshift(targetElement);
          break;
  
        case 'bringForward':
          if (targetElementIndex < sortedElements.length - 1) {
            const temp = sortedElements[targetElementIndex + 1];
            sortedElements[targetElementIndex + 1] = targetElement;
            sortedElements[targetElementIndex] = temp;
          }
          break;
  
        case 'sendBackward':
          if (targetElementIndex > 0) {
            const temp = sortedElements[targetElementIndex - 1];
            sortedElements[targetElementIndex - 1] = targetElement;
            sortedElements[targetElementIndex] = temp;
          }
          break;
  
        default:
          return;
      }
  
      sortedElements.forEach((el, index) => {
        const originalElement = draft.find(e => e.id === el.id);
        if (originalElement) {
          originalElement.zIndex = index + 1;
        }
      });
    });
  
    setElements(newElements);
    return newElements;
  }, [elements]);

  const groupElements = useCallback((name) => {
    if (selectedElementIds.length < 2) {
      toast({ title: "Grouping Error", description: "Select at least two elements to group.", variant: "destructive" });
      return elements;
    }
    
    let newElements;
    let newGroupId;

    newElements = produce(elements, draft => {
      const selectedElements = draft.filter(el => selectedElementIds.includes(el.id));
      
      const minX = Math.min(...selectedElements.map(el => el.x));
      const minY = Math.min(...selectedElements.map(el => el.y));
      const maxX = Math.max(...selectedElements.map(el => el.x + el.width));
      const maxY = Math.max(...selectedElements.map(el => el.y + el.height));
      
      newGroupId = uuidv4();
      const newGroup = {
        id: newGroupId,
        type: 'group',
        name: name,
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        zIndex: Math.max(...selectedElements.map(el => el.zIndex || 0)) + 1,
      };

      selectedElements.forEach(el => {
        el.groupId = newGroupId;
        el.relativeX = el.x - minX;
        el.relativeY = el.y - minY;
      });

      draft.push(newGroup);
    });

    setElements(newElements);
    setSelectedElementIds([newGroupId]); 
    return newElements;
  }, [elements, selectedElementIds, toast, setSelectedElementIds]);

  const ungroupElements = useCallback((groupId) => {
    const newElements = produce(elements, draft => {
      const groupToRemove = draft.find(el => el.id === groupId);
      if (!groupToRemove) return;

      draft.filter(el => el.groupId === groupId).forEach(el => {
        delete el.groupId;
        delete el.relativeX;
        delete el.relativeY;
      });

      const index = draft.findIndex(el => el.id === groupId);
      if (index > -1) {
        draft.splice(index, 1);
      }
    });

    setElements(newElements);
    setSelectedElementIds([]);
    return newElements;
  }, [elements, setSelectedElementIds]);

  // Funzione per applicare il layout mobile verticale
  const applyMobileVerticalLayout = useCallback(() => {
    if (currentMode !== 'mobile') return elements;
    
    const newElements = produce(elements, draft => {
      const elementsWithVerticalLayout = calculateMobileVerticalLayout(draft);
      draft.splice(0, draft.length, ...elementsWithVerticalLayout);
    });
    
    setElements(newElements);
    return newElements;
  }, [elements, currentMode]);
  
  // Funzione per cambiare modalità e applicare le proprietà corrette
  const switchMode = useCallback((newMode) => {
    const newElements = produce(elements, draft => {
      draft.forEach(element => {
        const migratedElement = migrateElementToResponsive(element);
        Object.assign(element, migratedElement);
        
        const appliedElement = applyResponsiveProperties(element, newMode);
        Object.assign(element, appliedElement);
      });
      
      // Se la nuova modalità è mobile, applica il layout verticale
      if (newMode === 'mobile') {
        const elementsWithVerticalLayout = calculateMobileVerticalLayout(draft);
        draft.splice(0, draft.length, ...elementsWithVerticalLayout);
      }
    });
    
    setElements(newElements);
    return newElements;
  }, [elements]);
  
  // Funzione per migrare tutti gli elementi al formato responsive
  const migrateAllElementsToResponsive = useCallback(() => {
    const newElements = produce(elements, draft => {
      draft.forEach(element => {
        const migratedElement = migrateElementToResponsive(element);
        Object.assign(element, migratedElement);
      });
    });
    
    setElements(newElements);
    return newElements;
  }, [elements]);

  return {
    elements,
    setElements,
    addElement,
    addBlock,
    updateElement,
    updateMultipleElements,
    removeElement,
    duplicateElement,
    changeElementLayerOrder,
    groupElements,
    ungroupElements,
    applyMobileVerticalLayout,
    switchMode,
    migrateAllElementsToResponsive,
  };
};

export default useElementManager;
