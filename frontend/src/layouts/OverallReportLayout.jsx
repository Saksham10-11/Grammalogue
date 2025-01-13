import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import FeedbackPage from '../pages/Assessment/FeedbackPage';
import LoadingScreen from '../components/LoadingScreen';
import { getAssessment } from '../services/assessmentService';

const OverallReportLayout = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        setLoading(true);
        const response = await getAssessment(id);
        
        // Parse the string data from MongoDB
        let parsedData;
        try {
          parsedData = typeof response.data === 'string' 
            ? JSON.parse(response.data) 
            : response.data;
            
          // Store the parsed data in localStorage for FeedbackPage
          localStorage.setItem('assessmentFeedback', JSON.stringify(parsedData));
          setAssessmentData(parsedData);
        } catch (parseError) {
          console.error('Error parsing assessment data:', parseError);
          setError('Failed to parse assessment data. Please try again.');
        }
      } catch (fetchError) {
        console.error('Error fetching assessment:', fetchError);
        setError(fetchError.message || 'Failed to load assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAssessmentData();
    } else {
      setError('No assessment ID provided');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center p-4"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-red-800 text-xl font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <FeedbackPage />
        </div>
      </div>
    </motion.div>
  );
};

export default OverallReportLayout;