import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Target,
  Eye,
  Award,
  TrendingUp,
  Globe,
  Code,

  Linkedin,
  Mail,
  Zap,
  Shield,
  Facebook,
  Instagram,
  MapPin
} from 'lucide-react';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';

/**
 * About page with company information and team showcase
 */
const About = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const founderRef = React.useRef(null);

  const handleToggle = () => {
    if (isExpanded) {
      founderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setIsExpanded(!isExpanded);
  };

  const [isCOOExpanded, setIsCOOExpanded] = React.useState(false);
  const cooRef = React.useRef(null);

  const handleCOOToggle = () => {
    if (isCOOExpanded) {
      cooRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setIsCOOExpanded(!isCOOExpanded);
  };
  const values = [
    {
      icon: Zap,
      title: 'Innovation that Inspires',
      description: 'We constantly push the boundaries of what\'s possible with technology, always seeking new and better ways to solve problems.'
    },
    {
      icon: Shield,
      title: 'Integrity in Action',
      description: 'We maintain the highest standards of honesty, transparency, and ethical practices in all our interactions.'
    },
    {
      icon: Users,
      title: 'Collaboration that Resonates',
      description: 'We believe in the power of teamwork and work closely with our clients to ensure their vision becomes reality.'
    },
    {
      icon: Award,
      title: 'Excellence in Delivery',
      description: 'We maintain the highest standards in everything we do, from code quality to customer service.'
    }
  ];



  const stats = [
    { number: '3+', label: 'Years Experience', icon: TrendingUp },
    { number: '25+', label: 'Projects Completed', icon: Code },
    { number: '20+', label: 'Happy Clients', icon: Users },
    { number: 'x+', label: 'Team Members', icon: Globe }
  ];

  const milestones = [
    {
      year: '2025',
      title: 'Company Founded',
      description: 'Resonira was established with a vision to democratize AI and make advanced technology accessible to businesses of all sizes.'
    },
    {
      year: '2025',
      title: 'First AI Product',
      description: 'Launched our first AI-powered solution, helping businesses automate their customer service operations.'
    },
    {
      year: '2026',
      title: 'Future Vision',
      description: "Continuing to innovate and push the boundaries of what's possible with AI and technology."
    }
    /* {
       year: '2021',
       title: 'Series A Funding',
       description: 'Secured $5M in Series A funding to accelerate product development and expand our team.'
     },
     {
       year: '2022',
       title: 'International Expansion',
       description: 'Expanded our services globally, serving clients across North America, Europe, and Asia.'
     },
     {
       year: '2023',
       title: 'AI Platform Launch',
       description: 'Launched our comprehensive AI platform, enabling businesses to build and deploy AI solutions at scale.'
     },
     {
       year: '2024',
       title: 'Future Vision',
       description: 'Continuing to innovate and push the boundaries of what\'s possible with AI and technology.'
     } */
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
              Who We <span className="gradient-text">Are</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Resonira Technologies is a forward-thinking IT company driven by innovation and excellence. We help businesses amplify their potential by designing solutions that truly resonate with their goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
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
              Meet Our <span className="gradient-text">Founder</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The visionary leadership driving Resonira's innovation and success.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden"
            >
              <div className="md:flex">
                <div className="md:w-5/12 bg-blue-50 dark:bg-gray-750 p-8 lg:p-10 flex flex-col items-center text-center">
                  <div className="w-64 h-64 mb-6 rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-gray-600 transform hover:scale-105 transition-transform duration-300">
                    <img
                      src="/images/srilekha-ceo.png"
                      alt="Ms. Srilekha Eakula"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>


                  <div className="flex space-x-4 justify-center mt-2">
                    <a href="https://www.linkedin.com/in/sri-lekha-resonira?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-gray-800 rounded-full text-[#0077b5] hover:bg-[#0077b5] hover:text-white hover:scale-110 transition-all shadow-sm">
                      <Linkedin size={20} />
                    </a>
                    <a href="https://www.facebook.com/Eakulasrilu" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-gray-800 rounded-full text-[#1877F2] hover:bg-[#1877F2] hover:text-white hover:scale-110 transition-all shadow-sm">
                      <Facebook size={20} />
                    </a>
                    <a href="https://www.instagram.com/srilueakula?igsh=NHRxZTdnbDFtbmw5" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-gray-800 rounded-full text-[#E4405F] hover:bg-[#E4405F] hover:text-white hover:scale-110 transition-all shadow-sm">
                      <Instagram size={20} />
                    </a>
                    <a href="https://maps.app.goo.gl/Qg126C7rTHYC74P67" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-gray-800 rounded-full text-primary-500 hover:bg-primary-500 hover:text-white hover:scale-110 transition-all shadow-sm">
                      <MapPin size={20} />
                    </a>
                  </div>
                </div>

                <div className="md:w-7/12 p-8 lg:p-12 bg-white dark:bg-gray-800">
                  <h3 ref={founderRef} className="text-2xl lg:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Founder & CEO — Ms. Srilekha Eakula</h3>
                  <div className="space-y-5 text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    <p>Srilekha Eakula, Founder and CEO of Resonira Technologies, is driven by a clear belief — businesses don’t fail due to lack of effort; they fail due to lack of clarity. With academic foundations from the Manipal Academy of Higher Education (MAHE) and a Post-Graduate degree from T. A. Pai Management Institute (TAPMI), her journey blends structured learning with real-world business experience.</p>
                    <p>She began her career in the Banking and NBFC sector, where she developed a deep understanding of financial systems, risk assessment, and business sustainability. It was here she recognized that numbers tell powerful stories — and that every strategic move must make financial sense before it makes visual sense.</p>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-5"
                      >
                        <p>Her transition into an international Brand Management role expanded her worldview. Working across diverse countries and industries, she observed that while markets differ in culture and language, they respond to universal fundamentals: trust, value, and consistency. This exposure shaped her ability to align brand strategy with measurable business outcomes.</p>
                        <p>As technology began transforming industries at unprecedented speed, Srilekha chose adaptation over hesitation. She proactively integrated Artificial Intelligence into business strategy, analytics, creativity, and execution — building teams and processes designed for the future. Her philosophy is simple: the next generation of successful businesses will not be those that work harder, but those that work smarter.</p>
                        <p>This vision led to the creation of Resonira Technologies — not merely as a digital agency, but as a strategic growth partner. The company operates at the intersection of psychology, technology, finance, and brand strategy to help businesses grow with clarity, direction, and long-term purpose.</p>
                        <p>Srilekha believes marketing should not chase attention; it should build credibility, confidence, and sustainable value.</p>
                        <div className="bg-primary-50 dark:bg-gray-700/50 p-5 rounded-xl border-l-4 border-primary-500 my-6">
                          <p className="font-semibold text-gray-800 dark:text-gray-200 italic">
                            "Her mission is to help businesses stop guessing and start growing — consciously, intelligently, and with financial clarity."
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <button
                      onClick={handleToggle}
                      className="text-primary-600 hover:text-primary-700 font-semibold focus:outline-none flex items-center mt-2 group"
                    >
                      {isExpanded ? 'Read Less' : 'Read More'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* COO Section */}
            <motion.div
              className="text-center mb-16 mt-24"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Meet Our <span className="gradient-text">COO</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Driving operational excellence and global innovation at Resonira.
              </p>
            </motion.div>

            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden"
              >
                <div className="md:flex">
                  <div className="md:w-5/12 bg-blue-50 dark:bg-gray-750 p-8 lg:p-10 flex flex-col items-center text-center">
                    <div className="w-72 h-96 mb-6 rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-gray-600 transform hover:scale-105 transition-transform duration-300">
                      <img
                        src="/images/quaisar-coo.jpg"
                        alt="Quaisar Jahan"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    <div className="flex space-x-4 justify-center mt-2">
                      <a href="https://www.linkedin.com/in/quaisar-jahan-b91866225?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-gray-800 rounded-full text-[#0077b5] hover:bg-[#0077b5] hover:text-white hover:scale-110 transition-all shadow-sm">
                        <Linkedin size={20} />
                      </a>
                      <a href="https://www.instagram.com/kesar_j?igsh=eTZuazk1a2RsejA0" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-gray-800 rounded-full text-[#E4405F] hover:bg-[#E4405F] hover:text-white hover:scale-110 transition-all shadow-sm">
                        <Instagram size={20} />
                      </a>
                      <a href="https://maps.app.goo.gl/Qg126C7rTHYC74P67" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-gray-800 rounded-full text-primary-500 hover:bg-primary-500 hover:text-white hover:scale-110 transition-all shadow-sm">
                        <MapPin size={20} />
                      </a>
                    </div>
                  </div>

                  <div className="md:w-7/12 p-8 lg:p-12 bg-white dark:bg-gray-800">
                    <h3 ref={cooRef} className="text-2xl lg:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Chief Operating Officer — Quaisar Jahan</h3>
                    <div className="space-y-5 text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                      <p>Quaisar Jahan serves as the Chief Operating Officer at Resonira Technologies, leading operational strategy and execution across global markets. Her journey reflects disciplined growth, strategic thinking, and performance-driven leadership.</p>
                      <p>She completed her Master’s in Technology from Guru Jambeshwar University of Science and Technology, strengthening her analytical mindset and systems-driven approach.</p>

                      {isCOOExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-5"
                        >
                          <p>She began her career in sales, gaining hands-on experience in revenue growth, client engagement, and performance accountability. Working in high-pressure environments, she developed resilience, negotiation capability, and a results-focused execution style. Her consistent performance expanded her exposure to international markets and cross-border stakeholders.</p>
                          <p>As her responsibilities evolved, she transitioned from individual contribution to operational leadership — designing scalable systems, improving team efficiency, and aligning execution with long-term strategy. Her ability to integrate technology with structured business processes enabled sustainable and measurable growth.</p>
                          <p>Today, she oversees global operations across AI, Blockchain, Web3, Crypto, and Software Development. Her focus is on converting strategic vision into disciplined execution, ensuring operational clarity, scalability, and measurable impact.</p>

                          <div className="bg-primary-50 dark:bg-gray-700/50 p-5 rounded-xl border-l-4 border-primary-500 my-6">
                            <p className="font-semibold text-gray-800 dark:text-gray-200 italic">
                              "Quaisar believes sustainable success is built on accountability, direction, and continuous evolution — where leadership is defined by responsibility and results."
                            </p>
                          </div>
                        </motion.div>
                      )}

                      <button
                        onClick={handleCOOToggle}
                        className="text-primary-600 hover:text-primary-700 font-semibold focus:outline-none flex items-center mt-2 group"
                      >
                        {isCOOExpanded ? 'Read Less' : 'Read More'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div >
      </section >

      {/* Mission & Vision */}
      < section className="py-20" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card variant="elevated" className="h-full">
                <CardContent>
                  <motion.div
                    className="w-16 h-16 mb-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Target className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Our Mission</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    To resonate innovation into every industry by building reliable, scalable, and futuristic technology solutions.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card variant="elevated" className="h-full">
                <CardContent>
                  <motion.div
                    className="w-16 h-16 mb-6 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Eye className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Our Vision</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    To be a global leader in crafting technology that echoes excellence and empowers businesses worldwide.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section >

      {/* Values */}
      < section className="py-20 bg-indigo-50 dark:bg-gray-900" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Our <span className="gradient-text">Values</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              These core values guide everything we do and shape our company culture.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card variant="glass" className="h-full text-center">
                  <CardContent>
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <value.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{value.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* Stats Section */}
      < section className="py-20 bg-indigo-50 dark:bg-gray-900" >
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
      </section >

      {/* Timeline */}
      < section className="py-20" >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Our <span className="gradient-text">Journey</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Key milestones in our company's growth and evolution.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary-500 to-secondary-500"></div>

            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <Card variant="glass">
                    <CardContent>
                      <div className="text-2xl font-bold gradient-text mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{milestone.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{milestone.description}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full border-4 border-white dark:border-gray-900"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* CTA Section */}
      < section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500" >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Work With Us?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join the growing number of businesses that trust Resonira for their technology needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                className="text-lg px-8 py-4 bg-white text-primary-500 hover:bg-gray-100"
              >
                <Mail className="mr-2 w-5 h-5" />
                Get In Touch
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-500"
              >
                View Our Work
              </Button>
            </div>
          </motion.div>
        </div>
      </section >
    </div >
  );
};

export default About;
