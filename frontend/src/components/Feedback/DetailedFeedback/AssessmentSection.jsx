// src/components/Feedback/DetailedFeedback/AssessmentSection.jsx
import React from 'react';
import { motion } from 'framer-motion';

const AssessmentSection = ({ feedback }) => {
  // Helper function to handle NaN values
  const formatScore = (score) => {
    if (score === undefined || isNaN(score)) return 0;
    return score;
  };

  console.log(feedback);



  const sections = [
    {
      title: 'Answer Assessment',
      content: feedback.correctness,
      score: formatScore(feedback.correctness?.score),
      relevanceScore: feedback.correctness?.relevance_score,
      qualityScore: feedback.correctness?.quality_score,
      relevance: feedback.correctness?.Relevance || 'No relevance feedback available',
      quality: feedback.correctness?.Quality || 'No quality feedback available',
      remark: feedback.correctness?.remark || 'No remarks available',
      bgColor: 'bg-blue-100',
      textColor: 'text-brand-blue',
      showScore: true
    },
    {
      title: 'Speech Pauses',
      content: feedback.pauses.total_pauses !== undefined,
      count: feedback.pauses.total_pauses,
      pause_details: feedback.pauses.pause_details,
      total_durations: feedback.pauses.total_pause_duration,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      showScore: false
    },
    {
      title: 'Grammar Assessment',
      content: feedback.grammar,
      errorCount: feedback.grammar.error_count,
      errors: feedback.grammar.errors,
      bgColor: 'bg-red-100',
      textColor: 'text-brand-red',
      showScore: false
    },
    {
      title: 'Pronunciation Assessment',
      content: feedback.pronunciation,
      errorCount: feedback.pronunciation.error_count,
      errors: feedback.pronunciation.errors,
      bgColor: 'bg-purple-100',
      textColor: 'text-brand-purple',
      showScore: false
    },
    {
      title: 'Fluency Assessment',
      content: feedback.fluency,
      score: formatScore(feedback.fluency?.fluency_score),
      fillerCount: feedback.fluency?.filler_word_count,
      fillerWords: feedback.fluency?.filler_words,
      feedback: feedback.fluency?.feedback,
      bgColor: 'bg-blue-100',
      textColor: 'text-brand-blue',
      showScore: true
    },
    {
      title: 'Vocabulary Assessment',
      content: feedback.vocabulary,
      advancedWords: feedback.vocabulary?.unique_advanced_words,
      feedback: feedback.vocabulary?.feedback,
      bgColor: 'bg-purple-100',
      textColor: 'text-brand-purple',
      showScore: false
    }
  ];

  const renderErrors = (errors, isGrammar, textColor) => (
    <ul className="list-disc pl-5 space-y-2">
      {errors.map((error, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="text-gray-700 text-sm"
        >
          <span className={isGrammar ? 'text-brand-red' : 'font-medium'}>
            {error.word}
          </span>
          {isGrammar ? (
            <span className="text-brand-blue ml-2">→ {error.suggestion}</span>
          ) : (
            <span className="text-brand-blue ml-2">/{error.phonetic}/</span>
          )}
          <p className="text-xs text-gray-600 mt-1">{error.explanation}</p>
        </motion.li>
      ))}
    </ul>
  );

  const renderCorrectnessContent = (section) => (
    <div className="mt-2 space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Relevance (out of 50)</h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-grow bg-gray-200 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(section.relevanceScore / 50) * 100}%` }}
                className="h-full bg-brand-blue"
              />
            </div>
            <span className="text-xs font-medium text-brand-blue">
              {section.relevanceScore?.toFixed(1)}/50
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">{section.relevance}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700">Quality (out of 50)</h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-grow bg-gray-200 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(section.qualityScore / 50) * 100}%` }}
                className="h-full bg-brand-blue"
              />
            </div>
            <span className="text-xs font-medium text-brand-blue">
              {section.qualityScore?.toFixed(1)}/50
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">{section.quality}</p>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700">Overall Score</h4>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-grow bg-gray-200 h-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${section.score}%` }}
              className="h-full bg-brand-blue"
            />
          </div>
          <span className="text-xs font-medium text-brand-blue">
            {section.score?.toFixed(1)}/100
          </span>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700">Remarks</h4>
        <p className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded">
          {section.remark}
        </p>
      </div>
    </div>
  );

  const renderFluencyContent = (section) => (
    <div className="mt-2 space-y-3">
      <p className="text-sm text-gray-700">
        Detected {section.fillerCount} filler words or hesitations
      </p>
      {section.feedback && (
        <p className="text-sm text-gray-600 italic">{section.feedback}</p>
      )}
      <div className="space-y-2">
        {section.fillerWords.map((filler, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="text-sm bg-blue-50 p-2 rounded"
          >
            <span className="font-medium text-brand-blue">"{filler.word}"</span>
            <p className="text-xs text-gray-600 mt-1">
              Context: "...{filler.context}..."
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderVocabularyContent = (section) => (
    <div className="mt-2">
      <div className="flex flex-wrap gap-1.5 mt-2">
        {section.advancedWords.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="inline-block px-2 py-0.5 text-xs bg-purple-50 text-brand-purple rounded"
          >
            {word}
          </motion.span>
        ))}
      </div>
      {section.feedback && (
        <p className="text-xs text-gray-600 mt-2">{section.feedback}</p>
      )}
    </div>
  );

  const renderPauseContent = (section) => (
    <div className="mt-2 space-y-3">
      <p className="text-sm text-gray-700">
        Detected {section.count} pauses in your speech
      </p>
      <p className="text-xs text-gray-600 mt-2">
        {section.count > 8 
          ? 'Consider reducing the number of pauses to improve speech fluency'
          : section.count > 4
          ? 'Moderate number of pauses - your speech flow is acceptable'
          : 'Good speech flow with minimal pauses'}
      </p>
      <div className="space-y-2">
        {section.pause_details.map((pause, i) => (
          <motion.div
  key={i}
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: i * 0.05 }}
  className="text-sm bg-yellow-50 p-2 rounded-lg shadow-sm"
>
  <div className="flex justify-between items-center mb-1">
    <span className="font-medium text-yellow-700 text-xs">
      Pause {i + 1}
    </span>
    <span className="text-xs bg-yellow-100 px-2 py-0.5 rounded-full">
      {pause.duration.toFixed(1)}s
    </span>
  </div>
  <div className="flex justify-between items-center text-xs text-gray-600">
    <div className="flex items-center gap-4">
      <span>
        <span className="text-gray-500">Start:</span> {pause.start.toFixed(1)}s
      </span>
      <span>
        <span className="text-gray-500">End:</span> {pause.end.toFixed(1)}s
      </span>
    </div>
  </div>
</motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {sections.map((section, index) => 
        section.content && (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{section.title}</h3>
              {section.showScore && section.score !== undefined && section.title !== 'Answer Assessment' && (
                <span className={`${section.bgColor} ${section.textColor} px-2 py-0.5 rounded-full text-xs`}>
                  {section.score}% score
                </span>
              )}
              {section.errorCount !== undefined && (
                <span className={`${section.bgColor} ${section.textColor} px-2 py-0.5 rounded-full text-xs`}>
                  {section.errorCount} {section.title === 'Grammar Assessment' ? 'mistakes' : 'challenges'}
                </span>
              )}
            {section.count !== undefined && (
              <div className="flex  items-center gap-4">
                <span className={`${section.bgColor} ${section.textColor} px-2 py-0.5 rounded-full text-xs`}>
                  {section.count} pauses
                </span>
                <span className={`${section.bgColor} ${section.textColor} px-2 py-0.5 rounded-full text-xs`}>
                  {section.total_durations.toFixed(1)} seconds
                </span>
              </div>
            )}
              
            </div>

            {/* console.log("THISSIS SI SISIIS SSI",section.title); */}

            {section.title === 'Answer Assessment' && renderCorrectnessContent(section)}
            {section.errors && renderErrors(section.errors, section.title === 'Grammar Assessment')}
            {section.title === 'Fluency Assessment' && section.fillerWords && renderFluencyContent(section)}
            {section.title === 'Vocabulary Assessment' && section.advancedWords && renderVocabularyContent(section)}
            {section.title === 'Speech Pauses' && renderPauseContent(section)}
          </motion.div>
        )
      )}
    </div>
  );
};

export default AssessmentSection;