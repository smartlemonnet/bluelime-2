import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronsUp, ChevronUp, ChevronDown, ChevronsDown } from 'lucide-react';

const LayerArrangementProperties = ({ selectedElementId, zIndex, onChangeLayerOrder }) => {
  if (!selectedElementId || !onChangeLayerOrder) return null;

  return (
    <div className="space-y-3 p-3 border border-slate-700 rounded-md bg-slate-700/30">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Arrange (Z-Index: {zIndex || 0})</h4>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => onChangeLayerOrder(selectedElementId, 'bringForward')} variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-purple-400">
          <ChevronUp size={16} className="mr-2"/> Forward
        </Button>
        <Button onClick={() => onChangeLayerOrder(selectedElementId, 'sendBackward')} variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-purple-400">
          <ChevronDown size={16} className="mr-2"/> Backward
        </Button>
        <Button onClick={() => onChangeLayerOrder(selectedElementId, 'bringToFront')} variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-purple-400">
          <ChevronsUp size={16} className="mr-2"/> To Front
        </Button>
        <Button onClick={() => onChangeLayerOrder(selectedElementId, 'sendToBack')} variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-purple-400">
          <ChevronsDown size={16} className="mr-2"/> To Back
        </Button>
      </div>
    </div>
  );
};

export default LayerArrangementProperties;