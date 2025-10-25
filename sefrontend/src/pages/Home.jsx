import React from 'react';
import { Link } from 'react-router-dom';
import { authUtils, userUtils } from '../utils/auth';
import { useTheme } from '../utils/ThemeContext';
import { oauthLogin } from '../utils/api';
// Removed imports for Button, Card, and Error

const Home = () => {
  const isAuthenticated = authUtils.isAuthenticated();
  const userRole = userUtils.getUserRole();
  const { darkMode } = useTheme();

  const handleLogin = () => {
    try { localStorage.setItem('authIntent', 'signin'); } catch (e) {}
    oauthLogin();
  };

  const handleGetStarted = () => {
    try { localStorage.setItem('authIntent', 'register'); } catch (e) {}
    oauthLogin();
  };

  const features = [
    {
      title: 'For Students',
      description: 'Take quizzes with real-time timer, instant feedback, and detailed result analysis.',
      icon: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />)
    },
    {
      title: 'For Faculty',
      description: 'Create and manage quizzes, track student performance, and maintain question banks.',
      icon: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />)
    },
    {
      title: 'For Administrators',
      description: 'Comprehensive system management, user administration, and analytics dashboard.',
      icon: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />)
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-all duration-200 pt-16">
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary-500/10 dark:bg-secondary-500/20 rounded-full blur-3xl"></div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400">
            Welcome to College Quiz System
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
            A comprehensive platform for students, faculty, and administrators to manage and take quizzes efficiently.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            {!isAuthenticated ? (
              <>
                {/* Replaced <Button> with <button> */}
                <button onClick={handleGetStarted} className="btn-primary px-8 py-3">Get Started</button>
                <button onClick={handleLogin} className="btn-secondary px-8 py-3">Sign In</button>
              </>
            ) : (
              // Replaced <Button> with <Link> styled as a button
              <Link to={`/${userRole?.toLowerCase()}/dashboard`} className="btn-primary px-8 py-3">
                Go to Dashboard
              </Link>
            )}
          </div>
        </section>

        <section className="py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Key Features
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
                Everything you need for effective quiz management
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                // Replaced <Card> with <div>, applying card styles
                <div 
                  key={i} 
                  className="card glass-card p-8 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl dark:hover:shadow-primary-500/10"
                >
                  <div className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-6 
                    bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/30 
                    ring-1 ring-primary-500/20 dark:ring-primary-400/10">
                    <svg className="h-10 w-10 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">{f.icon}</svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{f.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent"></div>
            <div className="absolute -bottom-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent"></div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            &copy; {new Date().getFullYear()} College Quiz System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;