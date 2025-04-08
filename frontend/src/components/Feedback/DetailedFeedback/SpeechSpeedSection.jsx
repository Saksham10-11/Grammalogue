import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SpeechSpeedSection = ({ feedback }) => {
  const [modifiedFeedback, setModifiedFeedback] = useState(feedback);

  // Extract variables from modifiedFeedback safely
  const speechData = modifiedFeedback?.speed || {};
  const wpm = speechData.wpm;
  const score = speechData.score;
  const category = speechData.category;
  const duration = speechData.duration;
  const speedFeedback = speechData.feedback;

  useEffect(() => {
    console.log("Component mounted/updated with new feedback:", feedback);
    // Force recalculation even if speed exists
    if (feedback && feedback.text) {
      setModifiedFeedback(null); // Clear existing data
    }
  }, [feedback]);

  // Move this useEffect after the variables are defined
  useEffect(() => {
    if (wpm !== undefined) {
      console.log("Rendering speech section with data:", {
        wpm,
        score,
        category,
        duration,
        feedback: speedFeedback
      });
    }
  }, [wpm, score, category, duration, speedFeedback]);

  // Calculate speech speed data if it doesn't exist
  useEffect(() => {
    if (!feedback || (!feedback.speed && feedback.text)) {
      console.log("Speed data is missing, calculating locally", feedback);

      const calculateDuration = async () => {
        // First check if recordingDuration is available in the feedback data
        // This would come from the timer shown during recording
        let estimatedDuration;
        let durationSource;

        // Use a fixed duration for testing
        const FIXED_DURATION = 60; // 1 minute
        const USE_FIXED_DURATION = false; // Set to false when you want to go back to automatic calculation

        if (USE_FIXED_DURATION) {
          estimatedDuration = FIXED_DURATION;
          durationSource = "fixed-duration-override";
          console.log("Using fixed duration override:", estimatedDuration);
        } else if (feedback?.recordingDuration) {
          // If we have the recording duration from the timer, use that
          estimatedDuration = feedback.recordingDuration;
          durationSource = "recording-timer";
          console.log("Using recording timer duration:", estimatedDuration);
        } else if (feedback?.duration) {
          // If we have a direct duration property, use that
          estimatedDuration = feedback.duration;
          durationSource = "direct-property";
          console.log("Using direct duration property:", estimatedDuration);
        } else {
          // Try to extract duration from localStorage assessment data
          try {
            const storedData = localStorage.getItem('assessmentFeedback');
            if (storedData) {
              const parsedData = JSON.parse(storedData);
              // Check if there's recordingTime or recordingDuration in the stored data
              const storedDuration =
                parsedData.recordingTime ||
                parsedData.recordingDuration ||
                (parsedData.setup && parsedData.setup.recordingDuration);

              if (storedDuration) {
                estimatedDuration = storedDuration;
                durationSource = "localStorage";
                console.log("Using duration from localStorage:", estimatedDuration);
              }
            }
          } catch (error) {
            console.error("Error extracting duration from localStorage:", error);
          }

          // If still no duration, use a conservative estimate
          if (!estimatedDuration) {
            // For mixed language or problematic transcripts, use a more conservative approach
            estimatedDuration = 60; // Default to 60 seconds for safety
            durationSource = "default-fallback";
            console.log("Using default fallback duration:", estimatedDuration);
          }
        }

        // Calculate WPM based on our best duration estimate
        const text = feedback?.text || "";

        // Clean the transcript to handle mixed language and special characters better
        const cleanedText = text
          .replace(/[^\w\s]|_/g, "") // Remove punctuation and special chars
          .replace(/\s+/g, " ") // Normalize spaces
          .trim();

        const wordsCount = cleanedText.split(/\s+/).length || 0;

        // For non-English text, adjust the word count
        // Some languages like Korean or Chinese might need different tokenization
        // This is a simple heuristic - for production use a proper tokenizer
        const hasNonLatinChars = /[^\u0000-\u007F]/.test(text);
        const adjustedWordCount = hasNonLatinChars
          ? Math.ceil(wordsCount * 0.8) // Adjust for non-Latin scripts
          : wordsCount;

        console.log("Word count adjustment:", {
          original: wordsCount,
          adjusted: adjustedWordCount,
          hasNonLatinChars
        });

        // Maximum reasonable WPM (300 is extremely fast but possible)
        const MAX_WPM = 300;
        const MIN_WPM = 80;
        let estimatedWpm = Math.round((adjustedWordCount / estimatedDuration) * 60);

        // Apply normalization to keep WPM in reasonable bounds
        estimatedWpm = Math.max(MIN_WPM, Math.min(estimatedWpm, MAX_WPM));

        console.log("Speech calculation details:", {
          originalWordsCount: wordsCount,
          adjustedWordCount,
          duration: estimatedDuration,
          durationSource,
          estimatedWpm
        });

        // Score calculation with more realistic distribution
        let calculatedScore;
        if (estimatedWpm >= 120 && estimatedWpm <= 160) {
          // Optimal range
          calculatedScore = 90 + Math.floor(Math.random() * 10); // 90-99
        } else if (estimatedWpm > 160 && estimatedWpm <= 180) {
          // Slightly fast
          calculatedScore = 80 + Math.floor(Math.random() * 10); // 80-89
        } else if (estimatedWpm >= 100 && estimatedWpm < 120) {
          // Slightly slow
          calculatedScore = 75 + Math.floor(Math.random() * 10); // 75-84
        } else if (estimatedWpm > 180 && estimatedWpm <= 220) {
          // Too fast
          calculatedScore = 65 + Math.floor(Math.random() * 10); // 65-74
        } else if (estimatedWpm >= 80 && estimatedWpm < 100) {
          // Too slow
          calculatedScore = 60 + Math.floor(Math.random() * 10); // 60-69
        } else {
          // Extremely fast or slow
          calculatedScore = 40 + Math.floor(Math.random() * 20); // 40-59
        }

        // Prevent perfect 100 scores unless truly perfect
        if (calculatedScore > 99) calculatedScore = 99;

        function getFeedbackText(wpm) {
          if (wpm >= 120 && wpm <= 160) {
            return "Your speaking rate is optimal for clear communication.";
          } else if (wpm > 160 && wpm <= 180) {
            return "Your speaking rate is slightly faster than optimal, but still within an acceptable range.";
          } else if (wpm > 180 && wpm <= 220) {
            return "Your speaking rate is too fast. Consider slowing down to improve clarity.";
          } else if (wpm >= 100 && wpm < 120) {
            return "Your speaking rate is slightly slower than optimal, but still acceptable.";
          } else if (wpm >= 80 && wpm < 100) {
            return "Your speaking rate is too slow. Consider speaking more fluently to maintain audience engagement.";
          } else {
            return "Your speaking rate is extremely " + (wpm > 220 ? "fast" : "slow") + ". This may significantly impact understanding and engagement.";
          }
        }

        function getSpeedCategory(wpm) {
          if (wpm >= 120 && wpm <= 160) return "optimal";
          if (wpm > 160 && wpm <= 180) return "slightly_fast";
          if (wpm > 180 && wpm <= 220) return "too_fast";
          if (wpm >= 100 && wpm < 120) return "slightly_slow";
          if (wpm >= 80 && wpm < 100) return "too_slow";
          return wpm > 220 ? "extremely_fast" : "extremely_slow";
        }

        // Create estimated speech data
        if (feedback) {
          setModifiedFeedback({
            ...feedback,
            speed: {
              wpm: estimatedWpm,
              score: calculatedScore,
              feedback: getFeedbackText(estimatedWpm),
              category: getSpeedCategory(estimatedWpm),
              duration: estimatedDuration,
              source: durationSource
            }
          });
        }
      };

      calculateDuration();
    } else if (feedback?.speed) {
      // If feedback already has speed data, just use that
      setModifiedFeedback(feedback);
    }
  }, [feedback]);

  // If feedback is not available yet, show loading state
  if (!modifiedFeedback) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Calculating speech metrics...</p>
      </div>
    );
  }

  // If we still don't have speed data after our fallback, don't render the component
  if (!wpm) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6"
    >
      <h3 className="text-lg font-semibold mb-3 text-brand-blue">Speaking Speed</h3>
      <div className="text-xs text-gray-400 mb-2">
        Source: {modifiedFeedback?.speed?.source || "calculated"} |
        Words: {feedback?.text?.split(/\s+/).length || 0} |
        WPM: {wpm} | Score: {score} | Duration: {duration?.toFixed(1) || 0}s
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className={`px-3 py-1 ${getCategoryStyle()} rounded-full text-sm font-medium`}>
            {getCategoryLabel()}: {wpm} WPM
          </span>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Duration:</span>
            <span>{Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Score:</span>
            <span className="font-medium text-brand-blue">{score}%</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-md text-sm">
          <p className="text-gray-700">{speedFeedback}</p>

          <div className="mt-3">
            <h4 className="font-medium text-gray-700 mb-1">Speaking Rate Categories:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Optimal: 120-160 WPM</li>
              <li>Slightly fast: 161-180 WPM</li>
              <li>Too fast: 181-220 WPM</li>
              <li>Slightly slow: 100-119 WPM</li>
              <li>Too slow: 80-99 WPM</li>
              <li>Extremely fast/slow: Below 80 or above 220 WPM</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Function to get category specific styling
  function getCategoryStyle() {
    switch (category) {
      case 'too_fast':
        return 'bg-orange-100 text-orange-700';
      case 'extremely_fast':
        return 'bg-red-100 text-red-700';
      case 'slightly_fast':
        return 'bg-yellow-100 text-yellow-700';
      case 'too_slow':
        return 'bg-blue-100 text-blue-700';
      case 'slightly_slow':
        return 'bg-indigo-100 text-indigo-700';
      case 'extremely_slow':
        return 'bg-purple-100 text-purple-700';
      case 'optimal':
      default:
        return 'bg-green-100 text-green-700';
    }
  }

  function getCategoryLabel() {
    switch (category) {
      case 'optimal': return 'Optimal';
      case 'slightly_fast': return 'Slightly Fast';
      case 'too_fast': return 'Too Fast';
      case 'extremely_fast': return 'Extremely Fast';
      case 'slightly_slow': return 'Slightly Slow';
      case 'too_slow': return 'Too Slow';
      case 'extremely_slow': return 'Extremely Slow';
      default: return 'Unknown';
    }
  }
};

export default SpeechSpeedSection;