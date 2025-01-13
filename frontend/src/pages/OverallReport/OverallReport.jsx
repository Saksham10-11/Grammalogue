import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  BarChart2,
  Award,
  ChevronRight,
  Filter,
  Download,
  Search,
} from "lucide-react";
import { getAllAssessments } from "../../services/assessmentService";
import {
  calculateOverallStats,
  calculatePerformanceScores,
  calculateOverallScore,
} from "../../utils/scoreCalculations";

function OverallReport() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(reports);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const assessments = await getAllAssessments();
        const processedReports = assessments
          .map((assessment) => {
            let parsedData;
            try {
              parsedData = JSON.parse(assessment.data);
              parsedData = JSON.parse(parsedData);
              console.log(parsedData);

              const feedbackArray = Array.isArray(parsedData?.feedback)
                ? parsedData.feedback
                : [];
              const totalQuestions = parsedData.questions.length;

              // Calculate overall stats and performance scores
              const overallStats = calculateOverallStats(
                parsedData.feedback,
                totalQuestions
              );
              const performanceScores = calculatePerformanceScores(
                overallStats,
                totalQuestions
              );
              // const overallScore = calculateOverallScore(performanceScores) ;

              const {
                grammarPerformance,
                pronunciationPerformance,
                fluencyPerformance,
                pausePerformance,
                correctnessPerformance,
              } = performanceScores;

              const overallScore = Math.round(
                grammarPerformance * 0.25 +
                  pronunciationPerformance * 0.05 +
                  fluencyPerformance * 0.15 +
                  pausePerformance * 0.15 +
                  correctnessPerformance * 0.4
              );

              console.log(overallScore);
              const firstFeedback = feedbackArray[0];
              const duration = firstFeedback?.duration || "N/A";

              return {
                id: assessment._id || assessment.id,
                date: new Date(assessment.dateAndTime).toISOString(),
                numberOfQuestions: parsedData.setup?.numberOfQuestions || "N/A",
                score: overallScore,
                fluency: Math.round(performanceScores.fluencyPerformance),
                grammar: Math.round(performanceScores.grammarPerformance),
                pronunciation: Math.round(
                  performanceScores.pronunciationPerformance
                ),
                questions: totalQuestions,
                type: parsedData.setup?.language || "English Assessment",
                difficulty: parsedData.setup?.difficulty || "N/A",
                topic: parsedData.setup?.topic || "General",
              };
            } catch (parseError) {
              console.error("Error parsing assessment data:", parseError);
              return null;
            }
          })
          .filter(Boolean);

        setReports(processedReports);
      } catch (err) {
        console.error("Error fetching assessments:", err);
        setError("Failed to load assessments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const handleViewDetails = (reportId) => {
    navigate(`/dashboard/reports/${reportId}/feedback`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredReports = reports.filter(
    (report) =>
      report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Assessment Reports
          </h1>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredReports.map((report) => (
            <motion.div
              key={report.id}
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-brand-purple">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(report.date).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-sm">
                    {report.type}
                  </span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm">
                    {report.difficulty}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-6 h-6 text-brand-orange" />
                  <span className="text-2xl font-bold">{report.score}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Fluency</div>
                    <div className="font-semibold text-brand-blue">
                      {report.fluency}%
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Grammar</div>
                    <div className="font-semibold text-brand-purple">
                      {report.grammar}%
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Pronunciation</div>
                    <div className="font-semibold text-brand-orange">
                      {report.pronunciation}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(report.date).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
                <button
                  onClick={() => handleViewDetails(report.id)}
                  className="flex items-center text-brand-blue hover:text-brand-purple transition-colors"
                >
                  View Details <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredReports.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No assessment reports found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OverallReport;
