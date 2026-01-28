import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code,
  Brain,
  Zap,
  Globe,
  Smartphone,
  Cloud,
  Shield,
  Users,
  BarChart3,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';

/**
 * Services page showcasing all company services
 */
const Services = () => {
  const [expandedService, setExpandedService] = useState(null);
  const services = [
    {
      icon: Code,
      title: 'Software Development',
      description: 'Custom software solutions built with modern technologies and best practices.',
      features: [
        'Web & Mobile App Development',
        'Custom Enterprise Solutions',
        'API & System Integration'
      ],
      details: {
        overview: 'We build robust, scalable software solutions tailored to your business needs. Our team follows agile methodologies to ensure timely delivery and continuous improvement.',
        technologies: ['React', 'Node.js', 'Python', 'TypeScript', 'PostgreSQL', 'MongoDB'],
        deliverables: ['Full-stack web applications', 'Mobile apps (iOS & Android)', 'REST & GraphQL APIs', 'Database design & optimization', 'Code documentation & training']
      },
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: Cloud,
      title: 'Cloud & Infrastructure',
      description: 'Scalable cloud infrastructure and deployment solutions for modern applications.',
      features: [
        'Cloud Migration & Management',
        'DevOps & Automation',
        'Cybersecurity Solutions'
      ],
      details: {
        overview: 'We help businesses leverage cloud technologies for improved scalability, reliability, and cost-efficiency. Our certified cloud architects design solutions that grow with your business.',
        technologies: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform'],
        deliverables: ['Cloud architecture design', 'Migration strategy & execution', 'CI/CD pipeline setup', 'Infrastructure monitoring', 'Security compliance implementation']
      },
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: Brain,
      title: 'Data & AI Solutions',
      description: 'Intelligent AI systems that learn, adapt, and deliver exceptional results.',
      features: [
        'Data Analytics & Insights',
        'AI-Powered Automation',
        'Machine Learning Applications'
      ],
      details: {
        overview: 'Transform your data into actionable insights with our AI and machine learning solutions. We build intelligent systems that automate processes and drive business growth.',
        technologies: ['TensorFlow', 'PyTorch', 'OpenAI', 'LangChain', 'Pandas', 'Scikit-learn'],
        deliverables: ['Custom AI/ML models', 'Chatbots & virtual assistants', 'Predictive analytics dashboards', 'Natural language processing', 'Computer vision solutions']
      },
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: Globe,
      title: 'Digital Transformation Consulting',
      description: 'Strategic guidance to help businesses navigate digital transformation.',
      features: [
        'IT Strategy & Advisory',
        'Business Process Automation',
        'Blockchain, IoT, AR/VR Integration'
      ],
      details: {
        overview: 'Navigate the digital landscape with expert guidance. We help organizations modernize their technology stack and processes to stay competitive in the digital age.',
        technologies: ['Blockchain', 'IoT Platforms', 'AR/VR', 'RPA Tools', 'Low-code Platforms'],
        deliverables: ['Digital strategy roadmap', 'Process automation workflows', 'Technology assessment reports', 'Change management support', 'Innovation workshops']
      },
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  const toggleService = (title) => {
    setExpandedService(expandedService === title ? null : title);
  };

  const process = [
    {
      step: '01',
      title: 'Discovery & Planning',
      description: 'We analyze your requirements and create a detailed project plan.',
      icon: Users
    },
    {
      step: '02',
      title: 'Design & Architecture',
      description: 'Our team designs the solution architecture and user experience.',
      icon: BarChart3
    },
    {
      step: '03',
      title: 'Development & Testing',
      description: 'We build and thoroughly test your solution using agile methodologies.',
      icon: Code
    },
    {
      step: '04',
      title: 'Deployment & Support',
      description: 'We deploy your solution and provide ongoing support and maintenance.',
      icon: Shield
    }
  ];

  const technologies = [
    { name: 'React', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Python', category: 'AI/ML' },
    { name: 'TensorFlow', category: 'AI/ML' },
    { name: 'AWS', category: 'Cloud' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'TypeScript', category: 'Frontend' },
    { name: 'Kubernetes', category: 'DevOps' },
    { name: 'GraphQL', category: 'API' },
    { name: 'Redis', category: 'Database' },
    { name: 'Vue.js', category: 'Frontend' }
  ];

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Our <span className="gradient-text">Services</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We provide end-to-end digital solutions designed to meet today's challenges and tomorrow's opportunities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                layout
              >
                <Card variant="elevated" className={`h-full ${service.bgColor}`}>
                  <CardContent>
                    <motion.div
                      className={`w-16 h-16 mb-6 rounded-xl bg-gradient-to-r ${service.color} flex items-center justify-center`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <service.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{service.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {service.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Expandable Details */}
                    <AnimatePresence>
                      {expandedService === service.title && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden mb-6"
                        >
                          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            {/* Overview */}
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Overview</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{service.details.overview}</p>
                            </div>

                            {/* Technologies */}
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Technologies</h4>
                              <div className="flex flex-wrap gap-2">
                                {service.details.technologies.map((tech, techIndex) => (
                                  <span
                                    key={techIndex}
                                    className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${service.color} text-white`}
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Deliverables */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Key Deliverables</h4>
                              <ul className="space-y-1">
                                {service.details.deliverables.map((deliverable, delIndex) => (
                                  <li key={delIndex} className="flex items-start text-xs text-gray-600 dark:text-gray-300">
                                    <ArrowRight className="w-3 h-3 text-primary-500 mr-1 mt-0.5 flex-shrink-0" />
                                    {deliverable}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => toggleService(service.title)}
                    >
                      {expandedService === service.title ? 'Show Less' : 'Learn More'}
                      {expandedService === service.title ? (
                        <ChevronUp className="ml-2 w-4 h-4" />
                      ) : (
                        <ChevronDown className="ml-2 w-4 h-4" />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
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
              Our <span className="gradient-text">Process</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We follow a proven methodology to ensure your project's success from start to finish.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <motion.div
                key={step.step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <step.icon className="w-10 h-10 text-white" />
                </motion.div>
                <div className="text-4xl font-bold gradient-text mb-2">{step.step}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Technologies We <span className="gradient-text">Use</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We work with the latest technologies and frameworks to deliver cutting-edge solutions.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {technologies.map((tech, index) => (
              <motion.div
                key={tech.name}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="font-semibold text-gray-900 dark:text-white mb-1">
                  {tech.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {tech.category}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Let's discuss how we can help you achieve your goals with our technology solutions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                className="text-lg px-8 py-4 bg-white text-primary-500 hover:bg-gray-100"
              >
                Let's Build Together
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <a href="https://calendly.com/srilekha-resonira/30min" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-500">
                  Book a Call
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services;
