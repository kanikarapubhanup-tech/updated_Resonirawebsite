import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Code, Home, Users, Briefcase, Mail, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';
import Button from '../components/Button';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Navigation component with responsive design and theme toggle
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Services', path: '/services', icon: Code },
    { name: 'About', path: '/about', icon: Users },
    { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700'
        : 'bg-transparent'
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/images/logo-final.png" alt="Resonira Technologies" className="h-24 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 ml-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-3 py-2 text-base font-bold transition-colors duration-200 ${location.pathname === item.path
                  ? 'text-primary-500'
                  : 'text-gray-700 dark:text-gray-300 hover:text-primary-500'
                  }`}
              >
                {item.name}
                {location.pathname === item.path && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            <a
              href="https://calendly.com/srilekha-resonira/30min"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="px-4 py-2 text-base font-bold whitespace-nowrap">Book a Call</Button>
            </a>
          </div>

          {/* Theme Toggle & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Location Display - Desktop */}
            <a
              href="https://maps.app.goo.gl/DPKBvU2jGotHN6BF6"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors duration-200 ml-8"
            >
              <MapPin className="w-5 h-5 mr-1 text-primary-500" />
              <span className="text-base font-bold whitespace-nowrap">Karimnagar, Telangana</span>
            </a>

            {/* Social Icons - Desktop */}
            <div className="hidden md:flex items-center space-x-3 mr-8">
              <a
                href="https://www.instagram.com/resonira__technologies/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-600 transition-colors duration-200"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/people/Resonira-Technologies/61582985617083/?sk=followers"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/resonira-technologies/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>

            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${location.pathname === item.path
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Location Display - Mobile */}
              <a
                href="https://maps.app.goo.gl/DPKBvU2jGotHN6BF6"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 mt-1 block"
              >
                <div className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors duration-200">
                  <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                  <span className="text-sm font-medium">Karimnagar, Telangana</span>
                </div>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
