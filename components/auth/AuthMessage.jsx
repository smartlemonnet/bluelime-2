import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

const AuthMessage = ({ message }) => {
  const getMessageStyle = (type) => {
    switch (type) {
      case 'error': return "bg-red-500/20 border-red-500 text-red-200";
      case 'success': return "bg-green-500/20 border-green-500 text-green-200";
      case 'info': return "bg-sky-600/30 border-sky-500 text-sky-200";
      default: return "bg-slate-700/50 border-slate-600 text-slate-300";
    }
  };

  return (
    <AnimatePresence>
      {message && message.content && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          className={`p-3 text-sm rounded-md flex items-start space-x-2 ${getMessageStyle(message.type)}`}
        >
          <Info className="h-5 w-5 flex-shrink-0" />
          <p>{message.content}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthMessage;