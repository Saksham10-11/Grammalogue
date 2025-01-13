import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, FileText, Settings, LogOut, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { logoutUser } from "../services/logoutUser";

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  // Controls sidebar expanded/collapsed state
  const [isExpanded, setIsExpanded] = useState(true);

  // Navigation configuration with icons and routes
  const sidebarLinks = [
    { icon: <Home size={20} />, label: "Overview", path: "/dashboard" },
    {
      icon: <FileText size={20} />,
      label: "Reports",
      path: "/dashboard/reports",
    },
    { icon: <Settings size={20} />, label: "Settings", path: "/" },
  ];

  // Toggle sidebar expansion state
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle user logout with Firebase auth
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Animated Sidebar with Responsive Behavior */}
      <motion.aside
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className={`${
          isExpanded ? "w-64" : "w-20"
        } bg-white shadow-lg hidden md:block transition-all duration-300 ease-in-out fixed h-[calc(100vh-64px)] top-16`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header with Toggle Button */}
          <motion.div
            className="p-4 mt-4 flex items-center justify-between"
            whileHover={{ scale: 1.01 }}
          >
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-2xl font-bold text-brand-blue ${
                !isExpanded && "hidden"
              }`}
            >
              Dashboard
            </motion.h2>
            <motion.button
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </motion.button>
          </motion.div>

          {/* Navigation Links with Active State Animations */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {sidebarLinks.map((link, index) => {
                const isActive = location.pathname === link.path;
                return (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.a
                      href={link.path}
                      className={`flex items-center space-x-3 p-3 rounded-lg relative group ${
                        isActive
                          ? "text-brand-blue font-medium"
                          : "text-gray-600 hover:text-brand-blue"
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      {/* Active Tab Background Animation */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-brand-blue bg-opacity-10 rounded-lg"
                          initial={false}
                          transition={{ type: "spring", bounce: 0.2 }}
                        />
                      )}
                      <span className="relative z-10">{link.icon}</span>
                      {isExpanded && (
                        <span className="relative z-10">{link.label}</span>
                      )}
                      {/* Active Tab Indicator */}
                      {isActive && (
                        <motion.div
                          className="absolute left-0 w-1 h-full bg-brand-blue rounded-r-full"
                          layoutId="activeBorder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </motion.a>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button with Animation */}
          <motion.div
            className="p-4 border-t"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              whileHover={{ x: 4, color: "#cc0530" }}
              className="flex items-center space-x-3 w-full p-3 rounded-lg transition-colors duration-300 text-gray-600 group"
              onClick={handleLogout}
            >
              <LogOut
                size={20}
                className="group-hover:rotate-12 transition-transform"
              />
              <span className={!isExpanded ? "hidden" : ""}>Logout</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.aside>

      {/* Main Content Area with Dynamic Margin */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`h-auto flex-1 transition-all duration-300 ${
          !isExpanded ? "ml-20" : "ml-64"
        } mt-6`}
      >
        <div className="h-[calc(100vh-64px)]">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}

export default DashboardLayout;