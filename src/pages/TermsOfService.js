import React from 'react';
import { motion } from 'framer-motion';

const TermsOfService = () => {
    return (
        <div className="min-h-screen pt-24 pb-16 bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Terms of Service</h1>

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">1. Agreement to Terms</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                By accessing or using our services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">2. Intellectual Property</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                The service and its original content, features, and functionality are and will remain the exclusive property of Resonira Technologies and its licensors. The service is protected by copyright, trademark, and other laws.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">3. Services</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We provide software development, AI solutions, and technology consulting services. We reserve the right to withdraw or amend our service, and any service or material we provide, in our sole discretion without notice.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">4. Limitation of Liability</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                In no event shall Resonira Technologies, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">5. Governing Law</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">6. Changes to Terms</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TermsOfService;
