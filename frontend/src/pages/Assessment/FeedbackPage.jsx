import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getIdealAnswer } from '../../services/api';
import OverallPerformance from '../../components/Feedback/OverallPerformance';
import DetailedFeedback from '../../components/Feedback/DetailedFeedback/DetailedFeedback';
import { saveAssessment, deleteAssessment } from '../../services/assessmentService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { 
  calculateOverallStats, 
  calculatePerformanceScores, 
  calculateOverallScore 
} from '../../utils/scoreCalculations';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Core state management for assessment data and UI controls
  const [assessmentData, setAssessmentData] = useState(null);
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const [idealAnswers, setIdealAnswers] = useState({});
  const [loadingIdealAnswer, setLoadingIdealAnswer] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Ref for PDF generation to capture the entire feedback content
  const contentRef = useRef(null);

  // Flag to determine if we're viewing from overall report or fresh assessment
  const isFromOverallReport = location.pathname.includes('/dashboard/reports/');

  const formatScore = (score) => {
    if (score === undefined || isNaN(score)) return 0;
    return score;
  };

  // Load assessment data from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem('assessmentFeedback');
    console.log("Stored data:", storedData);
    if (storedData) {
      setAssessmentData(JSON.parse(storedData));
    }
  }, []);

  // Fetches and processes ideal answer with error handling and state management
  const handleGetIdealAnswer = async (question, answer, index) => {
    try {
      setLoadingIdealAnswer(prev => ({ ...prev, [index]: true }));
      const result = await getIdealAnswer(question, answer);
      
      // Parse response data, handling both string and object formats
      let parsedData;
      try {
        console.log("Ideal answer response:", result.data);
        parsedData = JSON.parse(result.data);

      } catch (e) {
        parsedData = {
          ideal_answer: 'Error parsing response try again...',
          user_strengths: 'Unable to analyze try again...',
          areas_for_improvement: 'Unable to analyze try again...',
          improvement_suggestions: 'Unable to analyze try again...'
        };
      }

      setIdealAnswers(prev => ({
        ...prev,
        [index]: parsedData
      }));
    } catch (error) {
      console.error('Error getting ideal answer:', error);
      setIdealAnswers(prev => ({
        ...prev,
        [index]: {
          ideal_answer: 'Failed to get ideal answer',
          user_strengths: 'Error occurred',
          areas_for_improvement: 'Error occurred',
          improvement_suggestions: 'Please try again later'
        }
      }));
    } finally {
      setLoadingIdealAnswer(prev => ({ ...prev, [index]: false }));
    }
  };

  // Handles assessment saving with progress tracking for video uploads
  const handleSaveAssessment = async () => {
    try {
      setIsSaving(true);
      setUploadProgress(0);
  
      const savedAssessment = await saveAssessment(
        assessmentData, 
        (progress) => setUploadProgress(progress)
      );
  
      console.log("Assessment data ready to save:", savedAssessment);
      alert("Assessment saved successfully!");
    } catch (error) {
      console.error("Error saving assessment:", error);
      alert(`Failed to save assessment: ${error.message}`);
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteAssessment = async () => {
    try {
      setIsDeleting(true);
      const assessmentId = location.pathname.split('/')[3];
      await deleteAssessment(assessmentId);
      alert("Assessment deleted successfully!");
      navigate('/dashboard/reports'); 
    } catch (error) {
      console.error("Error deleting assessment:", error);
      alert(`Failed to delete assessment: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Complex PDF generation process that handles dynamic content and styling
  const handleDownloadPdf = async () => {
    if (!assessmentData?.questions) {
      alert('Assessment data is not fully loaded. Please try again.');
      return;
    }

    try {
      setIsGeneratingPdf(true);

      // Store current UI state to restore after PDF generation
      const previousDetailedFeedback = showDetailedFeedback;
      const previousExpandedQuestions = [...expandedQuestions];

      // Expand all content for PDF capture
      setShowDetailedFeedback(true);
      const allQuestionIndexes = assessmentData.questions.map((_, index) => index);
      setExpandedQuestions(allQuestionIndexes);

      // Fetch any missing ideal answers before PDF generation
      const questionPromises = assessmentData.questions.map((question, index) => {
        const feedback = assessmentData.feedback[index];
        if (!idealAnswers[index] && feedback && feedback.text) {
          return handleGetIdealAnswer(question.text, feedback.text, index);
        }
        return Promise.resolve();
      });

      await Promise.all(questionPromises.filter(Boolean));
      await new Promise(resolve => setTimeout(resolve, 2000)); // Allow time for content to render

      const content = contentRef.current;
      if (!content) {
        throw new Error('Content element not found');
      }

      // Configure html2canvas for optimal PDF quality
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedContent = clonedDoc.querySelector('[data-pdf-content]');
          if (clonedContent) {
            clonedContent.style.height = 'auto';
            clonedContent.style.overflow = 'visible';
            const questions = clonedDoc.querySelectorAll('[data-question-content]');
            questions.forEach(question => {
              question.style.height = 'auto';
              question.style.opacity = '1';
              question.style.overflow = 'visible';
            });
          }
        }
      });

      // Generate PDF from canvas
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save('assessment-feedback.pdf');

      // Restore previous UI state
      setShowDetailedFeedback(previousDetailedFeedback);
      setExpandedQuestions(previousExpandedQuestions);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!assessmentData) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto p-6 text-center"
      >
        <p>No feedback data available.</p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-brand-blue text-white rounded hover:opacity-90"
        >
          Return to Dashboard
        </motion.button>
      </motion.div>
    );
  }

  // Calculate performance metrics using utility functions
  const totalQuestions = assessmentData.questions.length;
  const overallStats = calculateOverallStats(assessmentData.feedback, totalQuestions);
  const performanceScores = calculatePerformanceScores(overallStats, totalQuestions);
  const overallScore = calculateOverallScore(performanceScores);
  console.log("Overall stats:", overallScore);

  const {
    grammarPerformance,
    pronunciationPerformance,
    fluencyPerformance,
    pausePerformance,
    correctnessPerformance
  } = performanceScores;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-6"
    >
      <div ref={contentRef} data-pdf-content>
        <motion.h1 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-3xl font-bold mb-6"
        >
          Assessment Feedback
        </motion.h1>
        
        <OverallPerformance
          overallScore={overallScore}
          overallStats={overallStats}
          grammarPerformance={grammarPerformance}
          pronunciationPerformance={pronunciationPerformance}
          fluencyPerformance={fluencyPerformance}
          correctnessPerformance={correctnessPerformance}
          pausePerformance={pausePerformance}
          showDetailedFeedback={showDetailedFeedback}
          setShowDetailedFeedback={setShowDetailedFeedback}
        />

        <DetailedFeedback 
          showDetailedFeedback={showDetailedFeedback}
          assessmentData={assessmentData}
          expandedQuestion={expandedQuestions}
          setExpandedQuestion={setExpandedQuestions}
          handleGetIdealAnswer={handleGetIdealAnswer}
          loadingIdealAnswer={loadingIdealAnswer}
          idealAnswers={idealAnswers}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex flex-row flex-wrap justify-center items-center gap-4 px-4"
      >
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 4px 15px rgba(124, 58, 237, 0.25)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className={`min-w-[160px] px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow-md transition-all duration-300 text-sm flex items-center justify-center gap-2 ${isGeneratingPdf ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-700 hover:to-purple-800'}`}
        >
          {isGeneratingPdf ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating PDF...
            </>
          ) : (
            'Download PDF'
          )}
        </motion.button>

        {isFromOverallReport ? (
          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: '0 4px 15px rgba(239, 68, 68, 0.25)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDeleteAssessment}
            disabled={isDeleting}
            className={`min-w-[160px] px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-md transition-all duration-300 text-sm flex items-center justify-center gap-2 ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:from-red-700 hover:to-red-800'}`}
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              'Delete Assessment'
            )}
          </motion.button>
        ) : (
          <>
            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveAssessment}
              disabled={isSaving}
              className={`min-w-[160px] px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-md transition-all duration-300 text-sm flex items-center justify-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-700 hover:to-green-800'}`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Assessment'
              )}
            </motion.button>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </>
        )}

        <motion.button 
          whileHover={{ scale: 1.02, boxShadow: '0 4px 15px rgba(59, 130, 246, 0.25)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard')}
          className="min-w-[160px] px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md transition-all duration-300 text-sm hover:from-blue-700 hover:to-blue-800"
        >
          Return to Dashboard
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default FeedbackPage;