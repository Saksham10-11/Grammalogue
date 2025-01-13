import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  BookOpen,
  BarChart3,
  List,
  ChevronRight,
  Sparkles,
  Plus,
  Lightbulb,
  Gauge,
  Globe2
} from 'lucide-react';

function AssessmentSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    questionType: 'general',
    numberOfQuestions: 4,
    topic: 'daily_life',
    difficulty: 'intermediate',
    language: 'English',
    customQuestionType: '',
    customTopic: ''
  });

  const [showCustomInputs, setShowCustomInputs] = useState({
    questionType: false,
    topic: false
  });

  const languages = [
    { id: 'English', label: 'English', nativeName: 'English' },
    { id: 'Hindi', label: 'Hindi', nativeName: 'हिंदी' },
    { id: 'Bengali', label: 'Bengali', nativeName: 'বাংলা' },
    { id: 'Gujarati', label: 'Gujarati', nativeName: 'ગુજરાતી' },
    { id: 'Kannada', label: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { id: 'Malayalam', label: 'Malayalam', nativeName: 'മലയാളം' },
    { id: 'Marathi', label: 'Marathi', nativeName: 'मराठी' },
    { id: 'Punjabi', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { id: 'Tamil', label: 'Tamil', nativeName: 'தமிழ்' },
    { id: 'Telugu', label: 'Telugu', nativeName: 'తెలుగు' },
];

  const questionTypes = [
    { id: 'general', label: 'General Conversation', icon: BookOpen, description: 'Everyday communication scenarios' },
    { id: 'business', label: 'Business English', icon: BarChart3, description: 'Professional workplace contexts' },
    { id: 'academic', label: 'Academic English', icon: Settings, description: 'Educational and research settings' },
    { id: 'custom', label: 'Custom Type', icon: Plus, description: 'Create your own category' },
  ];

  const topics = [
    { id: 'daily_life', label: 'Daily Life', icon: Lightbulb },
    { id: 'work', label: 'Work & Career', icon: BarChart3 },
    { id: 'travel', label: 'Travel & Culture', icon: Settings },
    { id: 'technology', label: 'Technology', icon: Settings },
    { id: 'environment', label: 'Environment', icon: Settings },
    { id: 'education', label: 'Education', icon: BookOpen },
    { id: 'custom', label: 'Custom Topic', icon: Plus },
  ];

  const difficulties = [
    { id: 'beginner', label: 'Beginner', color: 'bg-green-500', icon: Gauge },
    { id: 'intermediate', label: 'Intermediate', color: 'bg-brand-blue', icon: Gauge },
    { id: 'advanced', label: 'Advanced', color: 'bg-brand-purple', icon: Gauge },
    { id: 'expert', label: 'Expert', color: 'bg-brand-orange', icon: Gauge },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'questionType') {
      setShowCustomInputs(prev => ({ ...prev, questionType: value === 'custom' }));
    }
    if (field === 'topic') {
      setShowCustomInputs(prev => ({ ...prev, topic: value === 'custom' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      questionType: formData.questionType === 'custom' ? formData.customQuestionType : formData.questionType,
      topic: formData.topic === 'custom' ? formData.customTopic : formData.topic,
    };
    localStorage.setItem('assessmentSetup', JSON.stringify(finalData));
    navigate('/dashboard/assessment/grammar');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-brand-yellow/10 rounded-2xl">
                <Sparkles className="w-8 h-8 text-brand-yellow" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Assessment Setup
            </h1>
            <p className="mt-3 text-gray-600 text-lg">
              Customize your speaking assessment experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Language Selection */}
            <div className="space-y-4">
              <label className="text-xl font-semibold text-gray-900 block flex items-center gap-2">
                <Globe2 className="w-6 h-6 text-brand-blue" />
                Assessment Language
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {languages.map(lang => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => handleInputChange('language', lang.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      formData.language === lang.id
                        ? 'border-brand-blue bg-brand-blue/5 shadow-lg'
                        : 'border-gray-100 hover:border-brand-blue/50 shadow hover:shadow-lg'
                    }`}
                  >
                    <span className="block text-lg font-semibold mb-1">{lang.label}</span>
                    <span className="block text-sm text-gray-500">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Type Selection */}
            <div className="space-y-4">
              <label className="text-xl font-semibold text-gray-900 block">
                Question Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {questionTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleInputChange('questionType', type.id)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      formData.questionType === type.id
                        ? 'border-brand-blue bg-brand-blue/5 shadow-lg'
                        : 'border-gray-100 hover:border-brand-blue/50 shadow'
                    }`}
                  >
                    <type.icon
                      className={`w-8 h-8 mb-3 ${
                        formData.questionType === type.id
                          ? 'text-brand-blue'
                          : 'text-gray-400'
                      }`}
                    />
                    <span className="block text-base font-semibold mb-2">
                      {type.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      {type.description}
                    </span>
                  </button>
                ))}
              </div>
              {showCustomInputs.questionType && (
                <div className="animate-fadeIn">
                  <input
                    type="text"
                    value={formData.customQuestionType}
                    onChange={(e) => handleInputChange('customQuestionType', e.target.value)}
                    placeholder="Enter your custom question type"
                    className="mt-4 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all duration-300"
                  />
                </div>
              )}
            </div>

            {/* Number of Questions */}
            <div className="space-y-4">
              <label className="text-xl font-semibold text-gray-900 block">
                Number of Questions
              </label>
              <div className="bg-gray-50 p-6 rounded-2xl">
                <input
                  type="range"
                  min="1"
                  max="7" 
                  value={formData.numberOfQuestions}
                  onChange={(e) =>
                    handleInputChange('numberOfQuestions', parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                />
                <div className="mt-4 text-center">
                  <span className="text-3xl font-bold text-brand-blue">
                    {formData.numberOfQuestions}
                  </span>
                  <span className="text-gray-600 ml-2">Questions</span>
                </div>
              </div>
            </div>

            {/* Topic Selection */}
            <div className="space-y-4">
              <label className="text-xl font-semibold text-gray-900 block">
                Topic
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {topics.map(topic => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleInputChange('topic', topic.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      formData.topic === topic.id
                        ? 'border-brand-purple bg-brand-purple/5 text-brand-purple shadow-lg'
                        : 'border-gray-100 text-gray-600 hover:border-brand-purple/50 shadow hover:shadow-lg'
                    }`}
                  >
                    <topic.icon className={`w-6 h-6 mb-2 mx-auto ${
                      formData.topic === topic.id ? 'text-brand-purple' : 'text-gray-400'
                    }`} />
                    <span className="block text-center">{topic.label}</span>
                  </button>
                ))}
              </div>
              {showCustomInputs.topic && (
                <div className="animate-fadeIn">
                  <input
                    type="text"
                    value={formData.customTopic}
                    onChange={(e) => handleInputChange('customTopic', e.target.value)}
                    placeholder="Enter your custom topic"
                    className="mt-4 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition-all duration-300"
                  />
                </div>
              )}
            </div>

            {/* Difficulty Level */}
            <div className="space-y-4">
              <label className="text-xl font-semibold text-gray-900 block">
                Difficulty Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {difficulties.map(level => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => handleInputChange('difficulty', level.id)}
                    className={`group p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      formData.difficulty === level.id
                        ? `${level.color} border-transparent text-white shadow-lg`
                        : 'border-gray-100 text-gray-600 hover:shadow-lg'
                    }`}
                  >
                    <level.icon className={`w-6 h-6 mb-2 mx-auto ${
                      formData.difficulty === level.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    <span className="block text-center font-medium">
                      {level.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-5 px-6 bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-xl font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 text-lg"
            >
              Start Assessment
              <ChevronRight className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AssessmentSetup;