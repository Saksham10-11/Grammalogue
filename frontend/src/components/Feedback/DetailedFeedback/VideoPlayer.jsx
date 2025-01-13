// src/components/Feedback/DetailedFeedback/VideoPlayer.jsx
import React from 'react';
import { motion } from 'framer-motion';

const VideoPlayer = ({ videoUrl }) => {
  if (!videoUrl) return null;

  return (
    <motion.div 
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="bg-gray-50 p-4 rounded-lg"
    >
      <h3 className="font-semibold text-sm mb-2">Your Response Video</h3>
      <div className="aspect-video w-full max-w-2xl mx-auto bg-black rounded-lg overflow-hidden shadow-lg">
        <video 
          src={videoUrl}
          controls
          className="w-full h-full object-contain"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;