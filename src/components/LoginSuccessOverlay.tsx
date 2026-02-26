import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

type Props = {
  show: boolean;
  onComplete: () => void;
};

const LoginSuccessOverlay = ({ show, onComplete }: Props) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gradient-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onAnimationComplete={() => {
            setTimeout(onComplete, 1200);
          }}
        >
          {/* Checkmark circle */}
          <motion.div
            className="w-28 h-28 rounded-full bg-success/20 border-2 border-success flex items-center justify-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", damping: 10 }}
            >
              <Check className="w-14 h-14 text-success" strokeWidth={3} />
            </motion.div>
          </motion.div>

          {/* Success text */}
          <motion.p
            className="mt-6 text-xl font-semibold text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            Successfully Logged In
          </motion.p>

          {/* Ripple effect */}
          <motion.div
            className="absolute w-28 h-28 rounded-full border-2 border-success/30"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          />
          <motion.div
            className="absolute w-28 h-28 rounded-full border-2 border-success/20"
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ delay: 0.7, duration: 1.2, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginSuccessOverlay;
