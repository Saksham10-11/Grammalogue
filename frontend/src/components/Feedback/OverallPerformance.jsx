// components/OverallPerformance.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OverallPerformance = ({ 
  overallScore,
  overallStats,
  grammarPerformance,
  pronunciationPerformance,
  fluencyPerformance,
  vocabularyPerformance,
  correctnessPerformance,
  showDetailedFeedback,
  setShowDetailedFeedback
}) => {
  const getHealthBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-brand-blue';
    if (percentage >= 60) return 'bg-brand-yellow';
    if (percentage >= 40) return 'bg-brand-orange';
    return 'bg-brand-red';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  // Calculate pause performance (lower pauses is better)
  const pausePerformance = Math.max(0, Math.min(100, 100 - (overallStats.totalPauses / overallStats.totalQuestions * 10)));

  // Calculate overall score with weighted metrics
  const calculatedOverallScore = Math.round(
    (grammarPerformance * 0.25) +      // 25% weight for grammar
    (pronunciationPerformance * 0.05) + // 20% weight for pronunciation
    (fluencyPerformance * 0.15) +       // 20% weight for fluency
    (pausePerformance * 0.15) +         // 15% weight for speech pauses
    (correctnessPerformance * 0.40)     // 20% weight for answer correctness (using the new score)
  );

  // Define metrics with special handling for vocabulary
  const metrics = [
    { 
      label: 'Grammar', 
      performance: grammarPerformance, 
      count: overallStats.totalGrammarErrors, 
      unit: 'mistakes',
      showPerformance: true,
      weight: '25%'
    },
    { 
      label: 'Pronunciation', 
      performance: pronunciationPerformance, 
      count: overallStats.totalPronunciationErrors, 
      unit: 'challenges',
      showPerformance: true,
      weight: '5%'
    },
    { 
      label: 'Fluency', 
      performance: fluencyPerformance, 
      count: overallStats.totalFillerWords, 
      unit: 'filler words',
      showPerformance: true,
      weight: '15%'
    },
    { 
      label: 'Speech Pauses', 
      performance: pausePerformance, 
      count: overallStats.totalPauses, 
      unit: 'pauses',
      showPerformance: true,
      weight: '15%'
    },
    { 
      label: 'Answer Correctness', 
      performance: correctnessPerformance, 
      text: 'Based on relevance and quality',
      showPerformance: true,
      weight: '40%'
    },
    { 
      label: 'Vocabulary', 
      count: overallStats.totalAdvancedWords, 
      unit: 'advanced words used',
      showPerformance: false
    },
  ];

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-lg shadow-md p-6 mb-6 hover:shadow-lg transition-shadow duration-300"
    >
      <h2 className="text-2xl font-semibold mb-4">Overall Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Overall Score - Left Side */}
        <motion.div 
          className="flex flex-col items-center justify-center"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                  className="text-5xl font-bold text-brand-blue"
                >
                  {calculatedOverallScore}
                  <div className="text-sm text-gray-500 mt-1">out of 100</div>
                </motion.div>
              </div>
            </div>
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className="text-gray-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="70"
                cx="96"
                cy="96"
              />
              <motion.circle
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (440 * calculatedOverallScore) / 100 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-brand-blue"
                strokeWidth="8"
                strokeDasharray={440}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="70"
                cx="96"
                cy="96"
              />
            </svg>
          </div>
          <div className="mt-4 text-center">
            <div className="text-lg font-medium text-brand-purple mb-2">
              {getScoreGrade(calculatedOverallScore)}
            </div>
            <p className="text-sm text-gray-600">
              Based on Grammar (25%), Pronunciation (5%), Fluency (15%), Speech Pauses (15%), and Answer Correctness (40%)
            </p>
          </div>
        </motion.div>

        {/* Performance Metrics - Right Side */}
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <motion.div 
              key={metric.label}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="bg-gray-50 p-3 rounded-lg hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-800">{metric.label}</h3>
                  {metric.weight && (
                    <span className="text-xs text-gray-500">({metric.weight})</span>
                  )}
                </div>
                {metric.showPerformance && (
                  <span className="text-xs font-medium text-brand-blue">
                    {metric.performance.toFixed(1)}%
                  </span>
                )}
              </div>
              {metric.showPerformance && (
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.performance}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                    className={`h-full ${getHealthBarColor(metric.performance)} transition-all duration-500`}
                  />
                </div>
              )}
              <p className="text-xs text-gray-600 mt-1">
                {metric.count !== undefined ? `${metric.count} ${metric.unit}` : metric.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowDetailedFeedback(!showDetailedFeedback)}
        className="w-full mt-6 px-6 py-3 bg-white border-2 border-brand-blue text-brand-blue rounded-lg 
        hover:bg-brand-blue hover:text-white transition-all duration-300 text-sm font-medium 
        shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        {showDetailedFeedback ? (
          <>
            <span>Hide Detailed Feedback</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </>
        ) : (
          <>
            <span>Show Detailed Feedback</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default OverallPerformance;