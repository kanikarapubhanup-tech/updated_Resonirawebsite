
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  Github,
  Filter,
  Search,
  Brain,
  Zap,
  Globe,
  Smartphone,
  Cloud,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';

/**
 * Portfolio page showcasing past projects and case studies
 */
const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProject, setExpandedProject] = useState(null);

  const categories = [
    { id: 'all', name: 'All Projects', icon: Filter },
    { id: 'ai', name: 'AI Solutions', icon: Brain },
    { id: 'web', name: 'Web Development', icon: Globe },
    { id: 'mobile', name: 'Mobile Apps', icon: Smartphone },
    { id: 'automation', name: 'Automation', icon: Zap },
    { id: 'cloud', name: 'Cloud Solutions', icon: Cloud },
    { id: 'marketing', name: 'Digital Marketing', icon: TrendingUp }
  ];

  const projects = [
    {
      id: 1,
      title: 'AI-Powered Customer Service Platform',
      description: 'Revolutionary customer service platform using natural language processing and machine learning to provide instant, accurate responses.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      category: 'ai',
      technologies: ['Python', 'TensorFlow', 'React', 'Node.js', 'MongoDB'],
      client: 'TechCorp',
      year: '2025',
      link: 'https://soa.resonira.com',
      features: [
        'Natural Language Processing',
        'Real-time Response Generation',
        'Multi-language Support',
        'Analytics Dashboard',
        'API Integration'
      ],
      results: {
        'Response Time': '90% faster',
        'Customer Satisfaction': '+45%',
        'Cost Reduction': '60%'
      }
    },
    {
      id: 2,
      title: 'E-commerce Automation Suite',
      description: 'Comprehensive automation solution for e-commerce businesses, streamlining inventory management, order processing, and customer communication.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
      category: 'automation',
      technologies: ['Python', 'Django', 'PostgreSQL', 'Redis', 'AWS'],
      client: 'ShopMaster',
      year: '2025',
      link: 'https://example.com',
      features: [
        'Inventory Management',
        'Order Processing',
        'Customer Communication',
        'Analytics & Reporting',
        'Multi-platform Integration'
      ],
      results: {
        'Processing Speed': '5x faster',
        'Error Reduction': '85%',
        'Revenue Growth': '+30%'
      }
    },
    {
      id: 3,
      title: 'MediCare Hospital Management System',
      description: 'Comprehensive hospital management and analytics platform for clinics and hospitals, covering operations, patient data, and insights.',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop',
      category: 'ai',
      technologies: ['Python', 'Pandas', 'React', 'FastAPI', 'PostgreSQL'],
      client: 'MediCare',
      year: '2025',
      link: 'https://portfolio.resonira.com',
      features: [
        'Hospital Management',
        'Patient Data Analysis',
        'Predictive Analytics',
        'Compliance Reporting',
        'Real-time Monitoring'
      ],
      results: {
        'Diagnosis Accuracy': '+25%',
        'Processing Time': '70% faster',
        'Operational Efficiency': '+40%'
      }
    },
    {
      id: 4,
      title: 'Real-time News & Media Application',
      description: 'Modern news and media application delivering real-time updates, personalized feeds, and rich content across devices.',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop',
      category: 'mobile',
      technologies: ['React Native', 'Node.js', 'MongoDB', 'AWS'],
      client: 'MediaNow',
      year: '2025',
      link: 'https://portfolio.resonira.com',
      features: [
        'Real-time News Updates',
        'Personalized Feeds',
        'Offline Reading',
        'Multi-language Support',
        'Rich Media Content'
      ],
      results: {
        'User Engagement': '+150%',
        'Session Duration': '+60%',
        'App Store Rating': '4.8/5'
      }
    },
    {
      id: 5,
      title: 'Cloud Infrastructure Migration',
      description: 'Complete migration of legacy systems to modern cloud infrastructure, improving scalability and reducing operational costs.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop',
      category: 'cloud',
      technologies: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Python'],
      client: 'Enterprise Solutions Inc.',
      year: '2025',
      link: 'https://example.com',
      features: [
        'Infrastructure as Code',
        'Auto-scaling',
        'Load Balancing',
        'Monitoring & Alerting',
        'Disaster Recovery'
      ],
      results: {
        'Infrastructure Costs': '-40%',
        'Performance': '+300%',
        'Uptime': '99.9%'
      }
    },
    {
      id: 6,
      title: 'AI Video Automation & Reels Platform',
      description: 'AI-powered video automation platform for creating, scheduling, and managing short-form reels and social content.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
      category: 'web',
      technologies: ['React', 'Node.js', 'MongoDB', 'FFmpeg', 'TensorFlow'],
      client: 'Rise Beyond Now',
      year: '2025',
      link: 'https://www.instagram.com/rise.beyond.now',
      features: [
        'Automated Reel Generation',
        'Template-based Editing',
        'Scheduled Posting',
        'Multi-platform Support',
        'Analytics Dashboard'
      ],
      results: {
        'Content Output': '+300%',
        'Production Time': '-70%',
        'Audience Growth': '+120%'
      }
    },
    {
      id: 7,
      title: 'Swetha Sai Phani Clinic',
      description: 'Complete clinic management system for Swetha Sai Phani Clinic with patient appointments, doctor management, and comprehensive healthcare administration.',
      image: '/images/swetha-clinic.png',
      category: 'web',
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
      client: 'Swetha Sai Phani Clinic',
      year: '2025',
      link: 'https://swethasaiphaniclinics.com',
      features: [
        'Online Appointment Booking',
        'Patient Records Management',
        'Doctor Schedule Management',
        'Prescription Management',
        'Payment Integration'
      ],
      results: {
        'Appointment Efficiency': '+80%',
        'Patient Satisfaction': '+65%',
        'Administrative Time': '-50%'
      }
    },
    {
      id: 8,
      title: 'Student Bus Tracking System',
      description: 'Real-time GPS-based bus tracking system for schools, enabling parents and administrators to monitor student transportation safely.',
      image: '/images/student-bus-tracking.jpg',
      category: 'mobile',
      technologies: ['React Native', 'Node.js', 'MongoDB', 'Google Maps API', 'Socket.io'],
      client: 'Student Bus Tracking',
      year: '2025',
      link: '#',
      features: [
        'Real-time GPS Tracking',
        'Parent Mobile App',
        'Driver Management',
        'Route Optimization',
        'Push Notifications'
      ],
      results: {
        'Parent Satisfaction': '+90%',
        'Route Efficiency': '+35%',
        'Safety Incidents': '-75%'
      }
    },
    {
      id: 9,
      title: 'School ERP System',
      description: 'Comprehensive school management ERP system covering admissions, attendance, academics, fees, and communication.',
      image: '/images/school-erp.png',
      category: 'web',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'AWS'],
      client: 'School ERP',
      year: '2025',
      link: '#',
      features: [
        'Student Admissions Management',
        'Attendance Tracking',
        'Academic Performance',
        'Fee Management',
        'Parent-Teacher Communication'
      ],
      results: {
        'Administrative Efficiency': '+70%',
        'Fee Collection': '+45%',
        'Parent Engagement': '+80%'
      }
    },
    {
      id: 10,
      title: 'Freshmart E-commerce Platform',
      description: 'Modern e-commerce platform for fresh groceries and daily essentials with real-time inventory and delivery tracking.',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',
      category: 'web',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redis'],
      client: 'Freshmart',
      year: '2025',
      link: '#',
      features: [
        'Product Catalog Management',
        'Shopping Cart & Checkout',
        'Real-time Inventory',
        'Delivery Tracking',
        'Payment Gateway Integration'
      ],
      results: {
        'Online Orders': '+200%',
        'Customer Retention': '+55%',
        'Delivery Time': '-40%'
      }
    },
    {
      id: 11,
      title: 'Girish John Portfolio',
      description: 'Professional portfolio website showcasing skills, projects, and experience with a modern, responsive design.',
      image: '/images/girish-john.png',
      category: 'web',
      technologies: ['React', 'Tailwind CSS', 'Framer Motion', 'EmailJS'],
      client: 'Girish John',
      year: '2025',
      link: 'https://www.girishjohn.in/',
      features: [
        'Interactive User Interface',
        'Project Showcase Gallery',
        'Responsive Design',
        'Contact Form Integration',
        'Smooth Animations'
      ],
      results: {
        'User Engagement': '+150%',
        'Lead Generation': '+40%',
        'Page Load Speed': '0.8s'
      }
    },
    {
      id: 12,
      title: 'Digital Marketing & Growth Strategy',
      description: 'Data-driven digital marketing campaign focusing on SEO, social media growth, and conversion rate optimization for maximum ROI.',
      image: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=600&h=400&fit=crop',
      category: 'marketing',
      technologies: ['Google Analytics', 'SEO', 'Meta Ads', 'Content Strategy', 'SEMrush'],
      client: 'GrowthScale',
      year: '2025',
      link: '#',
      features: [
        'SEO Optimization',
        'Social Media Management',
        'PPC Campaigns',
        'Conversion Rate Optimization',
        'Analytics & Reporting'
      ],
      results: {
        'Organic Traffic': '+200%',
        'Conversion Rate': '+45%',
        'ROI': '350%'
      }
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
              Our <span className="gradient-text">Portfolio</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Explore our successful projects and see how we've helped businesses transform
              their operations with cutting-edge technology solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedCategory === category.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 bg-indigo-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory + searchTerm}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card variant="elevated" className="h-full overflow-hidden">
                    <div className="relative">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 right-4 flex space-x-2">
                        {project.link && (
                          <motion.a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ExternalLink className="w-4 h-4 text-gray-700" />
                          </motion.a>
                        )}
                      </div>
                    </div>

                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-primary-500 font-medium">{project.client}</span>
                        <span className="text-sm text-gray-500">{project.year}</span>
                      </div>

                      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{project.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                        {project.description}
                      </p>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2">Technologies:</h4>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-md"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2">Key Results:</h4>
                        <div className="space-y-1">
                          {Object.entries(project.results).slice(0, 2).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                              <span className="font-medium text-green-600">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Expandable Case Study Details */}
                      <AnimatePresence>
                        {expandedProject === project.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden mb-4"
                          >
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                              {/* Features */}
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Key Features</h4>
                                <ul className="space-y-1">
                                  {project.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                                      <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                                      {feature}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* All Results */}
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">All Results</h4>
                                <div className="space-y-1">
                                  {Object.entries(project.results).map(([key, value]) => (
                                    <div key={key} className="flex justify-between text-xs">
                                      <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                                      <span className="font-medium text-green-600">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Visit Project Link */}
                              {project.link && project.link !== '#' && (
                                <a
                                  href={project.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-sm text-primary-500 hover:text-primary-600 font-medium"
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  Visit Live Project
                                </a>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                      >
                        {expandedProject === project.id ? 'Hide Details' : 'View Case Study'}
                        {expandedProject === project.id ? (
                          <ChevronUp className="ml-2 w-4 h-4" />
                        ) : (
                          <ChevronDown className="ml-2 w-4 h-4" />
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredProjects.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                No projects found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria.
              </p>
            </motion.div>
          )}
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
              Let's create something amazing together. Contact us to discuss your project requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                className="text-lg px-8 py-4 bg-white text-primary-500 hover:bg-gray-100"
              >
                Start Your Project
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-500"
              >
                View All Services
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
