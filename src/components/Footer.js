import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  ArrowRight,
  Send
} from 'lucide-react';

/**
 * Footer component with newsletter signup and social links
 */
const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Contact', path: '/contact' },
  ];

  const services = [
    'Software Development',
    'AI Development',
    'AI Workflows & Automation',
    'Web Development',
    'Technology Solutions',
  ];

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/resonira__technologies/', color: 'text-pink-500' },
    { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/people/Resonira-Technologies/61582985617083/?sk=followers', color: 'text-blue-500' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/company/resonira-technologies/posts/?feedView=all', color: 'text-blue-400' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@resoniratechnologies?si=mVZR4swwyZ4bRdRa', color: 'text-red-500' },
  ];

  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-start">

          {/* Company Info */}
          <div className="flex flex-col">
            <Link to="/" className="flex items-center mb-6">
              <img src="/images/logo-final.png" alt="Resonira Technologies" className="h-20 max-w-[220px] w-auto object-contain" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Empowering innovation with AI & technology. We deliver cutting-edge solutions
              that transform businesses and drive digital transformation.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-primary-500 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className={`w-5 h-5 ${social.color}`} />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-6 h-20 flex items-center">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-6 h-20 flex items-center">Services</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200 cursor-pointer">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-6 h-20 flex items-center">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to our newsletter for the latest updates and insights.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="w-full">
              <div className="flex flex-col space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full h-10 px-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm placeholder-gray-500"
                  required
                />
                <motion.button
                  type="submit"
                  className="w-full h-10 px-4 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mr-2">Subscribe</span>
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
              {isSubscribed && (
                <motion.p
                  className="text-green-400 text-xs mt-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Thank you for subscribing!
                </motion.p>
              )}
            </form>
          </div>

          {/* Contact */}
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-6 h-20 flex items-center">Contact</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center text-gray-400 text-sm">
                <Mail className="w-5 h-5 mr-3 text-red-500 flex-shrink-0" />
                <span>info@resonira.com</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <Phone className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                <span>+91 9154289324</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <svg className="w-5 h-5 mr-3 flex-shrink-0 text-orange-500" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path d="M25 35 Q25 25 35 25 L40 25 L40 32 L35 35 L35 38 L65 38 L65 35 L60 32 L60 25 L65 25 Q75 25 75 35 L75 40 Q75 45 70 45 L30 45 Q25 45 25 40 Z" />
                  <path d="M30 48 L70 48 L70 75 Q70 80 65 80 L35 80 Q30 80 30 75 Z" />
                  <circle cx="50" cy="62" r="12" fill="#1f2937" />
                  <circle cx="50" cy="62" r="6" fill="currentColor" />
                </svg>
                <span>0878 4085 341</span>
              </div>
              <a
                href="https://maps.app.goo.gl/DPKBvU2jGotHN6BF6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200"
              >
                <MapPin className="w-5 h-5 mr-3 text-primary-500 flex-shrink-0" />
                <span>Karimnagar, Telangana</span>
              </a>
              <div className="pt-4 w-full">
                <a
                  href="https://calendly.com/srilekha-resonira/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl h-10"
                >
                  Book an Appointment
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Resonira. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
