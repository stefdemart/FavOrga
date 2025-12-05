import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

// --- Colors & Gradients ---
export const gradients = {
  primary: "bg-gradient-to-r from-violet-600 to-indigo-600",
  text: "bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-indigo-700",
  surface: "bg-white/80 backdrop-blur-md",
  subtle: "bg-slate-50/50",
};

// --- Animations ---
export const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// --- Components ---

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const GammaCard: React.FC<CardProps> = ({ children, className = "", noPadding = false, ...props }) => {
  return (
    <motion.div
      variants={fadeIn}
      className={`bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden ${noPadding ? "" : "p-6"} ${className}`}
      whileHover={{ y: -2, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.05)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const GammaButton: React.FC<ButtonProps> = ({ 
  children, 
  variant = "primary", 
  icon, 
  isLoading, 
  className = "", 
  ...props 
}) => {
  const baseStyles = "relative px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:shadow-indigo-500/20",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </motion.button>
  );
};

export const GammaInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <input
        ref={ref}
        className={`w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 ${props.className}`}
        {...props}
      />
    </motion.div>
  );
});

export const GammaBadge: React.FC<{ children: React.ReactNode; color?: "blue" | "green" | "red" | "yellow" | "slate" }> = ({ children, color = "slate" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-red-50 text-red-700 border-red-100",
    yellow: "bg-amber-50 text-amber-700 border-amber-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${colors[color]}`}>
      {children}
    </span>
  );
};

export const SectionTitle: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode }> = ({ title, subtitle, icon }) => (
  <div className="mb-8">
    <motion.h2 
      initial={{ opacity: 0, x: -10 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="text-3xl font-bold text-slate-800 flex items-center gap-3"
    >
      {icon && <span className="text-indigo-600">{icon}</span>}
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.1 }}
        className="text-slate-500 mt-2 text-lg max-w-2xl font-light"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);