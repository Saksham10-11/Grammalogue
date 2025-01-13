import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GithubOutlined } from "@ant-design/icons";
import Profile from "./Profile";

function Navbar(props) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => navigate("/login");
  const handleSignUp = () => navigate("/register");
  const handleGithubClick = () => {
    window.location.href = "https://github.com/AryaK19/AI-driven-English-communication-assessment-system/tree/main";
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container px-4 mx-auto">
        <div className="flex justify-between h-20">
          {/* Logo with hover animation */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
          >
            <Link to="/" className="flex items-center">
              <img src="/images/logo.png" alt="Logo" className="h-24" />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          {!props.isUserAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-6 py-2 text-brand-blue hover:text-brand-purple transition-colors duration-200"
                onClick={handleLogin}
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                onClick={handleSignUp}
              >
                <User className="w-4 h-4" />
                <span>Sign Up</span>
              </motion.button>
            </div>
          )}

          {props.isUserAuthenticated && (
            <div className="hidden md:flex items-center space-x-6">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGithubClick}
            className="text-gray-700 hover:text-brand-blue transition-colors"
          >
            <GithubOutlined style={{ fontSize: '28px' }} />
          </motion.button>
              <Profile />
            </div>
          )}

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-600 hover:text-brand-blue focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu with Animation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-white rounded-b-xl shadow-lg"
            >
              <div className="px-4 py-6 space-y-4">
                {!props.isUserAuthenticated ? (
                  <div className="space-y-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-4 py-3 text-center text-brand-blue hover:bg-gray-50 rounded-xl transition-colors"
                      onClick={handleLogin}
                    >
                      Login
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-4 py-3 text-center bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-xl shadow-md"
                      onClick={handleSignUp}
                    >
                      Sign Up
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGithubClick}
                      className="text-gray-700 hover:text-brand-blue transition-colors"
                    >
                      <GitHub size={28} />
                    </motion.button>
                    <Profile />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

export default Navbar;