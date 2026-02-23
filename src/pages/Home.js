import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Code,
  Brain,
  Zap,
  Globe,
  Users,
  Award,
  TrendingUp,
  Star,
  Shield,
  Calendar
} from 'lucide-react';
import Button from '../components/Button';
import Card, { CardContent } from '../components/Card';
import VoiceAgentWidget from '../components/VoiceAgentWidget';

/**
 * Home page with hero section, features, and call-to-action
 */
const Home = () => {
  const features = [
    {
      icon: Zap,
      title: 'Innovation First',
      description: 'Cutting-edge solutions tailored to your vision.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Trusted & Secure',
      description: 'Robust, reliable, enterprise-grade technology.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      title: 'Future-Ready',
      description: 'Scalable platforms for long-term success.',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const stats = [
    { number: '25+', label: 'Projects Delivered', icon: Award },
    { number: '20+', label: 'Happy Clients', icon: Users },
    { number: '3+', label: 'Years Experience', icon: TrendingUp },
    { number: '98%', label: 'Client Satisfaction', icon: Star }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CEO, TechFlow Solutions',
      content: 'Resonira\'s AI-powered recommendation engine increased our conversion rates by 40%. Their machine learning expertise is exceptional.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'CTO, Blockchain Ventures',
      content: 'The smart contract platform they built for us is robust and secure. Resonira\'s blockchain expertise helped us launch ahead of schedule.',
      rating: 5
    },
    {
      name: 'Dr. Priya Sharma',
      role: 'Founder, MedTech Innovations',
      content: 'Their AI diagnostic system reduced our analysis time by 60%. The team\'s understanding of healthcare AI is outstanding.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 opacity-10 dark:opacity-20" />
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-500 rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              <span className="gradient-text">
                Trusted IT. Smarter AI. Lasting Impact
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Resonira Technologies empowers businesses with future-ready digital solutions that echo innovation, precision, and impact.
            </p>

            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/services">
                  <Button size="lg" className="text-lg px-8 py-4">
                    Explore Services
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                    Contact Us
                  </Button>
                </Link>
              </div>

              <a
                href="https://calendly.com/srilekha-resonira/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-lg px-10 py-4 w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-primary-100 dark:border-primary-900 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-bold"
                >
                  <Calendar className="mr-2 w-5 h-5" />
                  Book Appointment
                </Button>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Voice Agent Widget Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Try Our <span className="gradient-text">Voice AI Assistant</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience our AI-powered voice assistant. Ask questions, schedule meetings, and learn about our services.
            </p>
          </motion.div>
          <VoiceAgentWidget
            showCalendar={false}
            showWhatsApp={false}
          />
        </div>
      </section>

      {/* Quick Intro Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              At Resonira Technologies, we specialize in creating scalable, secure, and innovative technology solutions that drive growth and transform industries.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Key Highlights Section */}
      <section className="py-20 bg-indigo-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Choose <span className="gradient-text">Resonira</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Three pillars that define our approach to technology solutions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card variant="elevated" className="h-full text-center">
                  <CardContent>
                    <motion.div
                      className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
                <motion.div
                  className="text-3xl md:text-4xl font-bold gradient-text mb-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                >
                  {stat.number}
                </motion.div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-indigo-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              What Our <span className="gradient-text">Clients Say</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our satisfied clients have to say.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card variant="glass" className="h-full">
                  <CardContent>
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Let's discuss how our AI and technology solutions can help you achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="text-lg px-8 py-4">
                  Start Your Project
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
