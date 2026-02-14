import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  Calendar,
  User,
  Building
} from 'lucide-react';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';

/**
 * Contact page with form validation and contact information
 */
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    message: '',
    'bot-field': ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const services = [
    'Software Development',
    'AI Development',
    'AI Workflows & Automation',
    'Web Development',
    'Mobile Development',
    'Cloud Solutions',
    'Technology Consulting',
    'Other'
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'info@resonira.com',
      description: 'Send us an email anytime',
      color: 'from-blue-500 to-cyan-500',
      url: 'mailto:info@resonira.com'
    },
    {
      icon: Phone,
      title: 'Phone',
      details: [
        { value: '+91 9154289324', url: 'tel:+919154289324' },
        { value: '0878 4085 341', url: 'tel:08784085341' }
      ],
      color: 'from-green-500 to-emerald-500',
      url: 'tel:+919154289324'
    },
    {
      icon: MapPin,
      title: 'Address',
      value: 'Karimnagar, Telangana',
      description: 'Click to open in Google Maps',
      color: 'from-purple-500 to-pink-500',
      url: 'https://www.google.com/maps/place/Resonira+Technologies/@18.4468946,79.1327256,19.44z/data=!4m12!1m5!3m4!2zMTjCsDI2JzQ5LjAiTiA3OcKwMDcnNTkuOSJF!8m2!3d18.4469444!4d79.1333056!3m5!1s0x3bccd965feaf1ff9:0x10369a08ba25eb0f!8m2!3d18.44694!4d79.1333866!16s%2Fg%2F11mm6dlz3t?entry=ttu&g_ep=EgoyMDI1MTIwMS4wIKXMDSoASAFQAw%3D%3D'
    },
    {
      icon: Clock,
      title: 'Response Time',
      value: '< 24 hours',
      description: 'We respond quickly to all inquiries',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const encode = (data) =>
    Object.keys(data)
      .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submission = {
        'form-name': 'contact',
        ...formData,
      };

      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(submission),
      });

      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        service: '',
        message: '',
        'bot-field': ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card variant="elevated">
              <CardContent>
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Thank You!</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your message has been sent successfully. We'll get back to you within 24 hours.
                </p>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full"
                >
                  Send Another Message
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

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
              Let's Create Something That <span className="gradient-text">Resonates</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Ready to transform your business with AI and technology? Let's discuss your project
              and see how we can help you achieve your goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-indigo-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card variant="glass" className="h-full text-center hover:bg-white dark:hover:bg-gray-800 transition-colors duration-300">
                  <CardContent>
                    {info.url ? (
                      <a
                        href={info.url}
                        target={info.url.startsWith('tel:') ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                      >
                        <motion.div
                          className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r ${info.color} flex items-center justify-center cursor-pointer`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <info.icon className="w-8 h-8 text-white" />
                        </motion.div>
                      </a>
                    ) : (
                      <motion.div
                        className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r ${info.color} flex items-center justify-center`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <info.icon className="w-8 h-8 text-white" />
                      </motion.div>
                    )}
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{info.title}</h3>
                    {info.details ? (
                      <div className="flex flex-wrap justify-center items-center gap-2 mb-2">
                        {info.details.map((detail, i) => (
                          <React.Fragment key={i}>
                            <a
                              href={detail.url}
                              target={detail.url.startsWith('tel:') ? '_self' : '_blank'}
                              rel="noopener noreferrer"
                              className="text-primary-500 font-medium hover:underline"
                            >
                              {detail.value}
                            </a>
                            {i < info.details.length - 1 && <span className="text-gray-400">/</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : info.url ? (
                      <a
                        href={info.url}
                        target={info.url.startsWith('tel:') ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                        className="text-primary-500 font-medium mb-2 inline-block hover:underline"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-primary-500 font-medium mb-2">{info.value}</p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-300">{info.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-indigo-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Send Us a <span className="gradient-text">Message</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
            <div className="mt-6">
              <a href="https://calendly.com/srilekha-resonira/30min" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  Book an Appointment
                </Button>
              </a>
            </div>
          </motion.div>

          <Card variant="elevated">
            <CardContent>
              <form
                name="contact"
                method="POST"
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Netlify hidden form-name field */}
                <input type="hidden" name="form-name" value="contact" />
                {/* Honeypot field */}
                <input type="hidden" name="bot-field" value={formData['bot-field']} onChange={handleInputChange} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User className="inline w-4 h-4 mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 ${errors.name
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <motion.p
                        className="mt-1 text-sm text-red-500 flex items-center"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                      </motion.p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Mail className="inline w-4 h-4 mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 ${errors.email
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <motion.p
                        className="mt-1 text-sm text-red-500 flex items-center"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  {/* Company */}
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Building className="inline w-4 h-4 mr-1" />
                      Company/Organization (optional)
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 transition-colors duration-200"
                      placeholder="Enter your company name"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Phone className="inline w-4 h-4 mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 transition-colors duration-200"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Service */}
                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Service Interested In
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 transition-colors duration-200"
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MessageSquare className="inline w-4 h-4 mr-1" />
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 resize-none ${errors.message
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      }`}
                    placeholder="Tell us about your project requirements..."
                  />
                  {errors.message && (
                    <motion.p
                      className="mt-1 text-sm text-red-500 flex items-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.message}
                    </motion.p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    className="px-8 py-4"
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
                    <Send className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Here are some common questions we receive from our clients.
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: "How long does a typical project take?",
                answer: "Project timelines vary depending on complexity and scope. Simple web applications typically take 2-4 weeks, while complex AI solutions can take 3-6 months. We provide detailed timelines during our initial consultation."
              },
              {
                question: "Do you provide ongoing support after project completion?",
                answer: "Yes, we offer comprehensive support and maintenance packages. This includes bug fixes, updates, performance monitoring, and feature enhancements. We believe in long-term partnerships with our clients."
              },
              {
                question: "What technologies do you specialize in?",
                answer: "We specialize in modern web technologies (React, Node.js, Python), AI/ML frameworks (TensorFlow, PyTorch), cloud platforms (AWS, Azure, GCP), and mobile development (React Native, Flutter)."
              },
              {
                question: "How do you ensure project quality?",
                answer: "We follow agile development methodologies with regular testing, code reviews, and client feedback sessions. Our team maintains high coding standards and uses automated testing to ensure quality."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card variant="glass">
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{faq.question}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
