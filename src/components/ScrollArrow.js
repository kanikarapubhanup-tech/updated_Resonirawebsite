import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Scroll Arrow component - shows down arrow at top, up arrow when scrolled
 */
const ScrollArrow = () => {
    const [isAtTop, setIsAtTop] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            // Check if user has scrolled more than 300px
            setIsAtTop(window.scrollY < 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToFooter = () => {
        const footer = document.querySelector('footer');
        if (footer) {
            footer.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AnimatePresence>
            <motion.button
                key={isAtTop ? 'down' : 'up'}
                onClick={isAtTop ? scrollToFooter : scrollToTop}
                className="fixed bottom-24 right-6 z-40 p-3 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={isAtTop ? 'Scroll to footer' : 'Scroll to top'}
            >
                {isAtTop ? (
                    <ChevronDown className="w-6 h-6" />
                ) : (
                    <ChevronUp className="w-6 h-6" />
                )}
            </motion.button>
        </AnimatePresence>
    );
};

export default ScrollArrow;
