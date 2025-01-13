import React from 'react';
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowLeft, Volume2, Video, VideoOff, Clock, Target, BookOpen, Star, XCircle, Loader, FileText, ChevronRight, AlertCircle} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WaveformVisualizer from "./WaveformVisualizer";

function AssessmentContent({currentQuestionIndex,questions,isRecording,startRecording,stopRecording,transcribedText,error,recordingDuration,mediaStream,resetAssessment,nextQuestion,viewFeedback,isAssessmentComplete,formatTime,MAX_RECORDING_TIME}) {
  const navigate = useNavigate();
  const questionIcons = [
    <Clock key="clock" className="text-brand-blue" size={24} />,
    <BookOpen key="book" className="text-brand-blue" size={24} />,
    <Target key="target" className="text-brand-blue" size={24} />,
    <Star key="star" className="text-brand-blue" size={24} />
  ];

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).length;
  };

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
      className="w-[50%] flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="text-lg font-bold text-brand-purple flex items-center gap-2"
          >
            <CheckCircle className="text-brand-blue" size={20} />
            Grammar Assessment
          </motion.span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="px-3 py-1 bg-brand-purple/10 rounded-full text-xs font-medium text-brand-purple"
          >
            {currentQuestionIndex + 1}/{questions.length}
          </motion.span>
        </div>
        <button
          onClick={() => navigate('/dashboard/assessment/setup')}
          className="text-gray-600 hover:text-brand-blue transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back to Setup</span>
        </button>
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-brand-blue/10 relative overflow-hidden"
      >
        <div className="absolute top-4 right-4">
          {questionIcons[currentQuestionIndex % questionIcons.length]}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3 pr-10">
          {questions[currentQuestionIndex]}
        </h2>
        <p className="text-gray-600 flex items-center gap-2">
          <Volume2 className="text-brand-orange" size={18} />
          Speak clearly into your microphone
        </p>
      </motion.div>

      {/* Recording Interface */}
      <div className="relative">
        <AnimatePresence>
          {!isRecording ? (
            <motion.button
              key="start-recording"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="w-full h-16 flex items-center justify-center gap-3 bg-gradient-to-r from-brand-blue to-brand-purple text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Video size={20} />
              Start Recording
            </motion.button>
          ) : (
            <motion.div
              key="recording-wave"
              initial={{ height: 64, opacity: 0.8 }}
              animate={{ height: 128, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden relative"
            >
              <WaveformVisualizer
                isRecording={isRecording}
                stream={mediaStream}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {isRecording && (
          <div className="absolute top-4 left-4 text-sm font-medium text-brand-purple">
            {formatTime(recordingDuration)} /{" "}
            {formatTime(MAX_RECORDING_TIME)}
          </div>
        )}

        {isRecording && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stopRecording}
            className="absolute -top-3 -right-3 bg-brand-red text-white px-4 py-3 rounded-full shadow-lg hover:bg-brand-red/90 transition-colors flex items-center gap-2 font-medium border-2 border-white"
          >
            <VideoOff size={20} />
            <span>Stop Recording</span>
          </motion.button>
        )}
      </div>

      {/* Transcribed Text Display */}
      {transcribedText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 p-4 bg-white rounded-xl shadow-md border border-brand-blue/10"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">Transcribed Speech:</h3>
            <span className={`text-sm font-medium ${getWordCount(transcribedText) >= 30 ? 'text-green-600' : 'text-orange-500'}`}>
              Word Count: {getWordCount(transcribedText)}
            </span>
          </div>
          <div className="max-h-[90px] overflow-y-auto pr-2 custom-scrollbar">
            <p className="text-gray-800">{transcribedText}</p>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-red-600 font-medium">{error}</p>
            {error.includes("word") && (
              <p className="text-red-500 text-sm mt-1">
                Please provide a longer answer to proceed.
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-auto flex gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={resetAssessment}
          className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl flex items-center justify-center font-medium shadow-md hover:shadow-lg transition-all"
        >
          Restart
          <XCircle className="ml-2" size={18} />
        </motion.button>

        {isAssessmentComplete ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={viewFeedback}
            className="flex-1 bg-gradient-to-r from-brand-purple to-brand-blue text-white py-3 rounded-xl flex items-center justify-center font-medium shadow-md hover:shadow-lg transition-all"
          >
            View Feedback
            <FileText className="ml-2" size={18} />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={nextQuestion}
            disabled={!transcribedText}
            className="flex-1 bg-gradient-to-r from-brand-yellow to-brand-orange text-white py-3 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transition-all"
          >
            Next Question
            <ChevronRight className="ml-2" size={18} />
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}

export default AssessmentContent;