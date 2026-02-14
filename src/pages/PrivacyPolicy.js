import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen pt-24 pb-16 bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Privacy Policy</h1>

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">1. Information We Collect</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We collect information that you provide directly to us, including:
                            </p>
                            <ul className="list-disc pl-6 mb-4 text-gray-600 dark:text-gray-300 space-y-2">
                                <li>Name and contact information</li>
                                <li>Company details</li>
                                <li>Project requirements and preferences</li>
                                <li>Communication history</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">2. How We Use Your Information</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc pl-6 mb-4 text-gray-600 dark:text-gray-300 space-y-2">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Communicate with you about projects and updates</li>
                                <li>Send you technical notices and support messages</li>
                                <li>Respond to your comments and questions</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">3. Information Sharing</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">4. Data Security</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">5. Contact Us</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                If you have any questions about this Privacy Policy, please contact us at:
                            </p>
                            <p className="text-primary-500 font-medium">info@resonira.com</p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
