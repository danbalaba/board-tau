import React, { useState, useEffect } from 'react';
import Button from '../../common/Button';
import { Home, FileText, CheckCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeSkeleton = () => (
  <div className="flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto w-full">
    <div className="text-center space-y-4 w-full">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto" />
      <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl w-3/4 mx-auto" />
      <div className="h-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg w-1/2 mx-auto" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 h-32" />
      ))}
    </div>
    <div className="w-full max-w-3xl h-64 bg-gray-50/50 dark:bg-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800" />
  </div>
);

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  const benefits = [
    {
      icon: <FileText className="w-6 h-6 text-emerald-500" />,
      title: "Easy Application",
      description: "Complete our simple steps in minutes",
      bgColor: "bg-emerald-500/5",
      borderColor: "border-emerald-500/10"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-blue-500" />,
      title: "Quick Approval",
      description: "Get your property listed faster than ever",
      bgColor: "bg-blue-500/5",
      borderColor: "border-blue-500/10"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-500" />,
      title: "Grow Your Business",
      description: "Reach thousands of students and tenants",
      bgColor: "bg-purple-500/5",
      borderColor: "border-purple-500/10"
    }
  ];

  const steps = [
    { number: "01", title: "Personal Info", description: "Tell us about yourself" },
    { number: "02", title: "Property Basics", description: "Describe your property" },
    { number: "03", title: "Location", description: "Where is your property located?" },
    { number: "04", title: "Property Setup", description: "Configure your listing" }
  ];

  return (
    <div className="flex flex-col items-center py-4 space-y-12">
      {/* Hero Section */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-6 hover:rotate-0 transition-transform duration-500 group">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <Home className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Welcome to <span className="text-emerald-500">BoardTAU</span>
        </h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium">
          Transform your property into a thriving boarding house business
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Join thousands of successful landlords</span>
        </div>
      </motion.div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-8 rounded-[2rem] border ${benefit.borderColor} ${benefit.bgColor} backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 group`}
          >
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md transition-shadow">
              {benefit.icon}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{benefit.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Application Process Section */}
      <motion.div
        className="w-full max-w-2xl px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="bg-white dark:bg-gray-800/40 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Application Process</h3>
            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800 mx-6" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-xs font-black text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                  {step.number}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">{step.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="pt-4"
      >
        <Button
          onClick={onNext}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-7 rounded-2xl text-sm font-bold tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
        >
          START MY APPLICATION
        </Button>
      </motion.div>
    </div>
  );
};

export default WelcomeStep;
