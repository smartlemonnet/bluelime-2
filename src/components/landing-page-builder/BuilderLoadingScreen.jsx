import React from 'react';
import { motion } from 'framer-motion';

const BuilderLoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-80 flex flex-col items-center justify-center z-[10000]">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-20 h-20 border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full"
      />
      <p className="mt-6 text-xl text-slate-200 font-semibold">{message}</p>
    </div>
  );
};

export default BuilderLoadingScreen;