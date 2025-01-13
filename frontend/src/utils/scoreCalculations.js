// src/utils/scoreCalculations.js

// Helper function to handle NaN values
export const formatScore = (score) => {
    if (score === undefined || isNaN(score)) return 0;
    return score;
  };
  
  export const calculateOverallStats = (feedback, totalQuestions) => {
    return feedback.reduce((acc, questionFeedback) => {
      if (questionFeedback) {
        acc.totalGrammarErrors += questionFeedback.grammar?.error_count;
        acc.totalPronunciationErrors += questionFeedback.pronunciation?.error_count;
        if (questionFeedback.fluency) {
          acc.totalFluencyScore += formatScore(questionFeedback.fluency.fluency_score);
          acc.totalFillerWords += questionFeedback.fluency.filler_word_count;
          acc.fluencyCount += 1;
        }
        if (questionFeedback.vocabulary) {
          acc.totalAdvancedWords += questionFeedback.vocabulary.total_advanced_words;
        }
        if (questionFeedback.correctness) {
          acc.totalRelevanceScore += formatScore(questionFeedback.correctness.relevance_score);
          acc.totalQualityScore += formatScore(questionFeedback.correctness.quality_score);
          acc.totalCorrectnessScore += formatScore(questionFeedback.correctness.score);
          acc.correctnessCount += 1;
        }
        if (questionFeedback.pauses.total_pauses !== undefined) {
          acc.totalPauses += questionFeedback.pauses.total_pauses;
          acc.pauseCount += 1;
        }
      }
      return acc;
    }, {
      totalGrammarErrors: 0,
      totalPronunciationErrors: 0,
      totalFluencyScore: 0,
      totalFillerWords: 0,
      fluencyCount: 0,
      totalAdvancedWords: 0,
      totalRelevanceScore: 0,
      totalQualityScore: 0,
      totalCorrectnessScore: 0,
      correctnessCount: 0,
      totalPauses: 0,
      pauseCount: 0,
      totalQuestions
    });
  };
  
  export const calculatePerformanceScores = (overallStats, totalQuestions) => {
    const grammarPerformance = Math.max(0, Math.min(100, 100 - (overallStats.totalGrammarErrors / totalQuestions * 5)));
    const pronunciationPerformance = Math.max(0, Math.min(100, 100 - (overallStats.totalPronunciationErrors / totalQuestions * 5)));
    const fluencyPerformance = overallStats.fluencyCount > 0
      ? formatScore(overallStats.totalFluencyScore / overallStats.fluencyCount)
      : 100;
    const pausePerformance = overallStats.pauseCount > 0
      ? Math.max(0, Math.min(100, 100 - (overallStats.totalPauses / overallStats.pauseCount * 10)))
      : 100;
    const correctnessPerformance = overallStats.correctnessCount > 0
      ? formatScore(overallStats.totalCorrectnessScore / overallStats.correctnessCount)
      : 0;
  
    return {
      grammarPerformance,
      pronunciationPerformance,
      fluencyPerformance,
      pausePerformance,
      correctnessPerformance
    };
  };
  
  export const calculateOverallScore = (performanceScores) => {
    const baseScore = (
      (performanceScores.grammarPerformance * 0.3) +
      (performanceScores.pronunciationPerformance * 0.2) +
      (performanceScores.fluencyPerformance * 0.25) +
      (performanceScores.pausePerformance * 0.25)
    );
  
    const correctnessImpact = 0.3 + (performanceScores.correctnessPerformance / 100 * 0.3);
    return Math.round(baseScore * correctnessImpact);
  };