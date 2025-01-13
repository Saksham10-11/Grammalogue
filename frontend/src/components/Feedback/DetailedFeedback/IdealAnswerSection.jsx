import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IdealAnswerSection = ({
  question,
  answer,
  index,
  handleGetIdealAnswer,
  loadingIdealAnswer,
  idealAnswer
}) => {
  // Helper function to safely get text content
  const getQuestionText = (question) => {
    if (!question) return '';
    return typeof question === 'string' ? question : question.text || '';
  };

  const getAnswerText = (answer) => {
    if (!answer) return '';
    return typeof answer === 'string' ? answer : answer.text || '';
  };

  const questionText = getQuestionText(question);
  const answerText = getAnswerText(answer);

  const canShowIdealAnswer = Boolean(questionText && answerText);

  return (
    <>
      <div className="mt-4">
        {canShowIdealAnswer ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGetIdealAnswer(questionText, answerText, index)}
            disabled={loadingIdealAnswer[index]}
            className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:opacity-90 transition-all duration-300 text-sm disabled:opacity-50"
          >
            {loadingIdealAnswer[index] ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
            ) : 'Show Ideal Answer'}
          </motion.button>
        ) : (
          <div className="text-sm text-gray-500 italic">
            Cannot generate ideal answer due to missing question or answer data
          </div>
        )}
      </div>

      <AnimatePresence>
        {idealAnswer && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-purple-50 p-4 rounded-lg mt-4"
          >
            <h3 className="font-semibold text-brand-purple mb-3">Ideal Answer Analysis</h3>
            <div className="space-y-3">
              {[
                { title: 'Ideal Answer', content: idealAnswer.ideal_answer },
                { title: 'Your Strengths', content: idealAnswer.user_strengths },
                { title: 'Areas for Improvement', content: idealAnswer.areas_for_improvement },
                // { title: 'Improvement Suggestions', content: idealAnswer.improvement_suggestions }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <h4 className="text-sm font-medium text-gray-700">{item.title}:</h4>
                  <p className="text-sm text-gray-600 mt-1">{String(item.content || 'Not available')}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default IdealAnswerSection;