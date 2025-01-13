import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  UserCircle, 
  Video, 
  Brain, 
  FileText, 
  ChevronRight,
  Languages,
  GraduationCap,
  Target
} from "lucide-react";

function Home() {
  const [isHovered, setIsHovered] = useState(null);
  const navigate = useNavigate();

  const supportedLanguages = [
    "English",
    "Hindi" ,
    "Bengali",
    // "Gujarati",
    "Kannada",
    // "Malayalam",
    "Marathi",
    "Punjabi",
    "Tamil" ,
    "Telugu" ,
  ];

  const difficultyLevels = [
    {
      level: "Beginner",
      description: "Essential communication skills and fundamental concepts"
    },
    {
      level: "Intermediate",
      description: "Professional discourse and business communication"
    },
    {
      level: "Advanced",
      description: "Technical discussions and specialized terminology"
    }
  ];

  const features = [
    {
      icon: <Languages className="w-10 h-10" />,
      title: "Multi-Language Support",
      description: "Communication practice across 8 international languages",
      colorClass: "text-brand-blue",
    },
    {
      icon: <Brain className="w-10 h-10" />,
      title: "AI Assessment",
      description: "Real-time analysis of pronunciation, grammar & fluency",
      colorClass: "text-brand-purple",
    },
    {
      icon: <Target className="w-10 h-10" />,
      title: "Structured Learning",
      description: "Progressive skill development through targeted practice",
      colorClass: "text-brand-orange",
    },
    {
      icon: <GraduationCap className="w-10 h-10" />,
      title: "Specialized Content",
      description: "Industry-focused communication scenarios",
      colorClass: "text-brand-yellow",
    },
  ];

  const handleClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="space-y-16 bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section with Logo */}
      <section className="text-center space-y-8 py-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-brand-blue/5 to-brand-purple/5" />
        <div className="max-w-xs mx-auto mb-8">
          <img src="\images\logo.png" alt="PluginLive Logo" className="w-full" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 relative">
          Professional <span className="text-brand-blue">Communication</span>{" "}
          <span className="block mt-2">Assessment</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Advanced communication assessment platform supporting
          <span className="text-brand-purple font-semibold"> multiple languages and industries</span>
        </p>
        <button
          className="bg-brand-blue text-white px-10 py-4 rounded-lg hover:bg-brand-purple 
          transition-all duration-300 transform hover:scale-105 flex items-center mx-auto gap-2"
          onClick={handleClick}
        >
          Access Dashboard <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* Language Support Grid */}
      <section className="px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Available Languages</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {supportedLanguages.map((language, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all
              text-center border-2 border-brand-blue/20 hover:border-brand-blue"
            >
              <span className="text-lg font-semibold text-brand-blue">{language}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Assessment Levels */}
      <section className="bg-gradient-to-r from-brand-blue to-brand-purple p-16 rounded-2xl text-white">
        <h2 className="text-3xl font-bold text-center mb-8">Assessment Levels</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {difficultyLevels.map((diff, index) => (
            <div key={index} className="bg-white/10 p-6 rounded-xl backdrop-blur-lg">
              <h3 className="text-2xl font-bold mb-4">{diff.level}</h3>
              <p className="opacity-90">{diff.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 
              transform hover:-translate-y-1"
            onMouseEnter={() => setIsHovered(index)}
            onMouseLeave={() => setIsHovered(null)}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={feature.colorClass}>{feature.icon}</div>
              <h3 className="text-2xl font-semibold">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Call to Action */}
      <section className="text-center bg-gradient-to-r from-brand-blue to-brand-purple p-16 rounded-2xl text-white">
        <h2 className="text-4xl font-bold mb-6">
          Communication Assessment Platform
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Access comprehensive language and communication evaluation tools
        </p>
        <button
          className="bg-white text-brand-blue px-8 py-4 rounded-lg 
          hover:bg-brand-yellow hover:text-gray-900 transition-all duration-300"
          onClick={handleClick}
        >
          Access Platform
        </button>
      </section>
    </div>
  );
}

export default Home;