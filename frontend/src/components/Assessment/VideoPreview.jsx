import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react"; // Add this import

const VideoPreview = ({ videoRef, isRecording }) => {
  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
      className="w-[50%]"
    >
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-brand-blue/10 h-[calc(100vh-10rem)]">
        <div className="bg-gradient-to-r from-brand-purple/5 to-brand-blue/5 p-4 border-b flex items-center justify-between">
          <h2 className="font-medium text-gray-800">Video Preview</h2>
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 text-brand-red"
              >
                <div className="w-3 h-3 bg-brand-red rounded-full animate-pulse"></div>
                Recording
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="aspect-video w-full bg-gray-50 relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!videoRef.current?.srcObject && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-gray-400"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Camera size={48} />
              </motion.div>
              <p className="mt-4 text-sm font-medium">Camera preview will appear here</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VideoPreview;