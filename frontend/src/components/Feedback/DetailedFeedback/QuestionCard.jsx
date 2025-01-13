import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlayer from './VideoPlayer';
import IdealAnswerSection from './IdealAnswerSection';
import AssessmentSection from './AssessmentSection';

const QuestionCard = ({
  index,
  question,
  isExpanded,
  toggleExpanded,
  feedback,
  handleGetIdealAnswer,
  loadingIdealAnswer,
  idealAnswer
}) => {
  // Helper function to safely get text content
  const getQuestionText = (text) => {
    if (!text) return '';
    return typeof text === 'string' ? text : text.text || '';
  };

  const questionText = getQuestionText(question);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      {/* Question Header */}
      <motion.div
        className="p-6 cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Question {index + 1}</h2>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-brand-blue"
          >
            ▼
          </motion.div>
        </div>
        <p className="text-gray-700 mt-2">{questionText}</p>
      </motion.div>

      {/* Expanded Content */}
      <div 
        data-question-content
        style={{
          display: isExpanded ? 'block' : 'none',
          opacity: isExpanded ? 1 : 0,
          height: isExpanded ? 'auto' : 0,
          overflow: isExpanded ? 'visible' : 'hidden'
        }}
        className="px-6 pb-6 space-y-4"
      >
        {feedback && (
          <>
            <VideoPlayer videoUrl={feedback.videoUrl} />
            
            <div className="text-gray-600">
              Your answer: {feedback.text}
            </div>

            <IdealAnswerSection 
              question={questionText}
              answer={feedback.text}
              index={index}
              handleGetIdealAnswer={handleGetIdealAnswer}
              loadingIdealAnswer={loadingIdealAnswer}
              idealAnswer={idealAnswer}
            />

            <AssessmentSection feedback={feedback} />
          </>
        )}
      </div>
    </motion.div>
  );
};

export default QuestionCard;