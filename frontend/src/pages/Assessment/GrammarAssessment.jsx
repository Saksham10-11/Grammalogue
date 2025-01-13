import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import VideoPreview from "../../components/Assessment/VideoPreview";
import AssessmentContent from "../../components/Assessment/AssessmentContent";
import { fetchQuestions } from "../../services/questionService";
import { sendMediaToServer } from "../../services/mediaService";

function GrammarAssessment() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [assessmentStage, setAssessmentStage] = useState("preview");
  const [transcribedText, setTranscribedText] = useState("");
  const [feedbackData, setFeedbackData] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [setupData, setSetupData] = useState(null);
  const [videoUrls, setVideoUrls] = useState([]);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const videoRef = useRef(null);

  const MAX_RECORDING_TIME = 120; // 2 minutes
  const MIN_WORD_COUNT = 2; // Minimum word count required

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        const storedSetup = localStorage.getItem('assessmentSetup');
        if (!storedSetup) {
          navigate('/dashboard/assessment/setup');
          return;
        }

        const parsedSetup = JSON.parse(storedSetup);
        setSetupData(parsedSetup);

        const questionsList = await fetchQuestions(parsedSetup);
        setQuestions(questionsList);
        setError(null);
      } catch (err) {
        setError('Failed to load questions. Please try again.');
        console.error('Error fetching questions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();

    return () => {
      stopRecording();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [navigate]);

  const handleMediaUpload = async (mediaBlob) => {
    setIsLoading(true);
    setError(null);
    const currentQuestionText = questions[currentQuestionIndex];

    try {
      const result = await sendMediaToServer(mediaBlob, currentQuestionIndex, currentQuestionText, setupData?.language || "English");
      setTranscribedText(result.transcribedText);
      
      // Create a URL for the video blob
      const videoUrl = URL.createObjectURL(mediaBlob);
      setVideoUrls(prev => {
        const newUrls = [...prev];
        newUrls[currentQuestionIndex] = videoUrl;
        return newUrls;
      });

      setFeedbackData(prev => {
        const newFeedback = [...prev];
        newFeedback[currentQuestionIndex] = {
          text: result.transcribedText,
          videoUrl: videoUrl,
          ...result.feedback
        };
        return newFeedback;
      });

      return result;
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message || "Failed to upload recording. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    setError(null);
    setTranscribedText("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      // Try MP4 with H.264 codec first
      const mimeType = 'video/mp4; codecs="avc1.42E01E,mp4a.40.2"';
      const options = { mimeType };

      try {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
      } catch (e) {
        // Fallback to WebM if MP4 is not supported
        console.warn("MP4 recording not supported, falling back to WebM");
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp9,opus"
        });
      }

      setMediaStream(stream);
      videoRef.current.srcObject = stream;
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const mediaBlob = new Blob(chunksRef.current, { 
          type: mediaRecorderRef.current.mimeType 
        });

        try {
          await handleMediaUpload(mediaBlob);
          setAssessmentStage("review");
        } catch (error) {
          console.error("Failed to process recording:", error);
          setAssessmentStage("preview");
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAssessmentStage("recording");
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setError(
        "Error accessing media devices. Please check your camera and microphone permissions."
      );
      console.error("Error accessing media devices:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();

      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }

      setIsRecording(false);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).length;
  };

  const nextQuestion = () => {
    const wordCount = getWordCount(transcribedText);
    if (wordCount < MIN_WORD_COUNT) {
      setError(`Your answer is too short. Please provide at least ${MIN_WORD_COUNT} words. Current word count: ${wordCount}`);
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setAssessmentStage("preview");
      setError(null);
      setRecordingDuration(0);
      setTranscribedText("");
    }
  };

  const resetAssessment = () => {
    setCurrentQuestionIndex(0);
    setAssessmentStage("preview");
    setError(null);
    setRecordingDuration(0);
    setTranscribedText("");
    setFeedbackData([]);
    setVideoUrls([]);
    stopRecording();
  };

  const viewFeedback = () => {
    const wordCount = getWordCount(transcribedText);
    if (wordCount < MIN_WORD_COUNT) {
      setError(`Your answer is too short. Please provide at least ${MIN_WORD_COUNT} words. Current word count: ${wordCount}`);
      return;
    }

    localStorage.setItem('assessmentFeedback', JSON.stringify({
      questions,
      feedback: feedbackData,
      setup: setupData,
      videoUrls: videoUrls
    }));
    navigate('/dashboard/assessment/feedback');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isAssessmentComplete = currentQuestionIndex === questions.length - 1 && transcribedText;

  if (isLoading && questions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-brand-blue mx-auto mb-4" />
          <p className="text-gray-600">Loading your assessment questions...</p>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
          <XCircle className="w-12 h-12 text-brand-red mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to Load Questions</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard/assessment/setup')}
            className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors"
          >
            Return to Setup
          </button>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
          <XCircle className="w-12 h-12 text-brand-red mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Questions Available</h2>
          <p className="text-gray-600 mb-4">Please return to setup and try again.</p>
          <button
            onClick={() => navigate('/dashboard/assessment/setup')}
            className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors"
          >
            Return to Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-7 h-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex gap-6"
      >
        <AssessmentContent
          currentQuestionIndex={currentQuestionIndex}
          questions={questions}
          isRecording={isRecording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          transcribedText={transcribedText}
          error={error}
          recordingDuration={recordingDuration}
          mediaStream={mediaStream}
          resetAssessment={resetAssessment}
          nextQuestion={nextQuestion}
          viewFeedback={viewFeedback}
          isAssessmentComplete={isAssessmentComplete}
          formatTime={formatTime}
          MAX_RECORDING_TIME={MAX_RECORDING_TIME}
        />
        
        <VideoPreview videoRef={videoRef} isRecording={isRecording} />
      </motion.div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3">
            <Loader className="animate-spin" />
            <span>Processing recording...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default GrammarAssessment;