
import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants, slideUpVariants } from '@/utils/animations';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade' | 'slide' | 'none';
  delay?: number;
  duration?: number;
  once?: boolean;
}

export const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  className = '',
  animation = 'fade',
  delay = 0,
  duration = 0.5,
  once = true,
}) => {
  const getVariants = () => {
    switch (animation) {
      case 'slide':
        return {
          ...slideUpVariants,
          visible: {
            ...slideUpVariants.visible,
            transition: {
              ...slideUpVariants.visible.transition,
              delay,
              duration,
            },
          },
        };
      case 'fade':
        return {
          ...fadeInVariants,
          visible: {
            ...fadeInVariants.visible,
            transition: {
              ...fadeInVariants.visible.transition,
              delay,
              duration,
            },
          },
        };
      default:
        return {};
    }
  };

  if (animation === 'none') {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      exit="exit"
      variants={getVariants()}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedTransition;
