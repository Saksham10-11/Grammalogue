import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionCard from './QuestionCard';

const DetailedFeedback = ({ 
  showDetailedFeedback, 
  assessmentData,
  expandedQuestion,
  setExpandedQuestion,
  handleGetIdealAnswer,
  loadingIdealAnswer,
  idealAnswers 
}) => {
  // Helper function to check if a question is expanded
  const isQuestionExpanded = (index) => {
    if (Array.isArray(expandedQuestion)) {
      return expandedQuestion.includes(index);
    }
    return expandedQuestion === index;
  };

  // Helper function to toggle question expansion
  const toggleQuestion = (index) => {
    if (Array.isArray(expandedQuestion)) {
      if (expandedQuestion.includes(index)) {
        setExpandedQuestion(expandedQuestion.filter(i => i !== index));
      } else {
        setExpandedQuestion([...expandedQuestion, index]);
      }
    } else {
      setExpandedQuestion([index]);
    }
  };

  return (
    <AnimatePresence>
      {showDetailedFeedback && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-6"
        >
          {assessmentData.questions.map((question, index) => (
            <QuestionCard
              key={index}
              index={index}
              question={question}
              isExpanded={isQuestionExpanded(index)}
              toggleExpanded={() => toggleQuestion(index)}
              feedback={assessmentData.feedback[index]}
              handleGetIdealAnswer={handleGetIdealAnswer}
              loadingIdealAnswer={loadingIdealAnswer}
              idealAnswer={idealAnswers[index]}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DetailedFeedback;