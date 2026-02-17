import React from 'react';
import Button from '../common/Button';
import { Home, FileText, CheckCircle, TrendingUp, Building2, Users, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  const handleGetStarted = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Get Started clicked');
    onNext();
  };

  const benefits = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Easy Application",
      description: "Complete our simple 7-step application in minutes"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Quick Approval",
      description: "Get your property listed in as little as 24 hours"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Grow Your Business",
      description: "Reach thousands of students and tenants"
    }
  ];

  const steps = [
    { number: "01", title: "Personal Info", description: "Tell us about yourself" },
    { number: "02", title: "Property Details", description: "Describe your property" },
    { number: "03", title: "Location", description: "Where is your property?" },
    { number: "04", title: "Configuration", description: "Set up your property" },
    { number: "05", title: "Documents", description: "Upload requirements" },
    { number: "06", title: "Review & Submit", description: "Final check" }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 max-w-4xl mx-auto">
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-20 h-20 bg-primary dark:bg-primary text-white dark:text-white rounded-full flex items-center justify-center mx-auto mb-4">
          <Home className="w-10 h-10" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Welcome to BoardTAU</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Transform your property into a thriving boarding house business
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Join thousands of successful landlords on our platform
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            className="text-center p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
              index === 0 ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
              index === 1 ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
              'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
            }`}>
              {benefit.icon}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="w-full max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Application Process
          </h3>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary dark:bg-primary text-white dark:text-white flex items-center justify-center text-sm font-semibold">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{step.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mt-2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Button
          type="button"
          onClick={handleGetStarted}
          className="w-full max-w-xs bg-primary dark:bg-primary hover:bg-primary-hover dark:hover:bg-primary-hover text-white dark:text-white"
          size="large"
        >
          Get Started →
        </Button>
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-2">
          Takes approximately 15 minutes to complete
        </p>
      </motion.div>
    </div>
  );
};

export default WelcomeStep;
