import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mic,
  VideoIcon,
  BookOpen,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();

  const assessmentTypes = [
    {
      title: "Assessment",
      icon: <Mic className="w-8 h-8" />,
      description:
        "Evaluate your spoken English skills with AI-powered analysis",
      color: "bg-brand-blue",
      count: "Custom Tests Available",
      path: "assessment/setup",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 relative"
        >
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Welcome back,{" "}
              {JSON.parse(localStorage.getItem("currUser"))?.username ||
                "Guest"}
              👋
            </h1>
            <p className="text-gray-600 text-lg">
              Continue your learning journey today
            </p>
          </div>
        </motion.div>

        {/* Assessment Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-6"
        >
          {assessmentTypes.map((assessment, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
              onClick={() => navigate(assessment.path)}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`${assessment.color} p-4 rounded-2xl text-white transform transition-transform hover:scale-110`}
                >
                  {assessment.icon}
                </div>
                <span className="text-sm font-medium px-4 py-2 bg-gray-50 rounded-full">
                  {assessment.count}
                </span>
              </div>
              <h3 className="text-2xl font-semibold mt-4 text-gray-900">
                {assessment.title}
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                {assessment.description}
              </p>

              <motion.button
                whileHover={{ x: 5 }}
                className="mt-4 text-brand-blue flex items-center text-sm font-medium hover:text-brand-purple transition-colors"
              >
                Start Assessment <ChevronRight className="w-4 h-4 ml-1" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;