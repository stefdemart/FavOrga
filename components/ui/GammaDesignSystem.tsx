import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

// --- Colors & Gradients (Chartre Gamma) ---
export const colors = {
  bg: "#F5F6F8",
  white: "#FFFFFF",
  textMain: "#1A1A1A",
  textMuted: "#6C6E73",
  accent: "#3A7BFF", // Azure Blue
  mint: "#4BE2B0",
  purple: "#7B5CFA",
};

export const gradients = {
  primary: "bg-[#3A7BFF]", // Aplat Azure (Gamma style préfère les aplats ou gradients très subtils)
  primaryHover: "bg-[#2563EB]", 
  text: "text-[#1A1A1A]", // Noir pur ou presque
  surface: "bg-white",
  subtle: "bg-[#F5F6F8]",
};

// --- Category Colors (Gamma Palette - Pastels avec accents) ---
export const getCategoryColor = (category: string | null) => {
  const map: Record<string, string> = {
    "Développement & Tech": "bg-blue-50 text-[#3A7BFF] border-blue-100",
    "Design & UX": "bg-purple-50 text-[#7B5CFA] border-purple-100",
    "Actualités & Média": "bg-gray-100 text-[#6C6E73] border-gray-200",
    "Commerce & Shopping": "bg-emerald-50 text-[#4BE2B0] border-emerald-100",
    "Finance & Business": "bg-amber-50 text-amber-600 border-amber-100",
    "Éducation & Apprentissage": "bg-violet-50 text-violet-600 border-violet-100",
    "Divertissement & Loisirs": "bg-orange-50 text-orange-600 border-orange-100",
    "Outils & Productivité": "bg-indigo-50 text-indigo-600 border-indigo-100",
    "Voyage & Lifestyle": "bg-teal-50 text-teal-600 border-teal-100",
    "Autre": "bg-[#F5F6F8] text-[#6C6E73] border-gray-200",
  };
  return map[category || "Autre"] || map["Autre"];
};

// --- Animations (Douces, 200-300ms) ---
export const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }, // Cubic bezier doux
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
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
      className={`bg-white rounded-[20px] gamma-shadow overflow-hidden border border-white/50 ${noPadding ? "" : "p-8"} ${className}`}
      whileHover={{ y: -4, boxShadow: "0 12px 24px -4px rgba(0,0,0,0.06)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
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
  const baseStyles = "relative px-6 py-3 rounded-xl font-medium text-[15px] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  // Style Gamma : Aplat couleur Azure pour primary, Blanc + Border pour secondary
  const variants = {
    primary: "bg-[#3A7BFF] hover:bg-[#2563EB] text-white shadow-md shadow-blue-500/20",
    secondary: "bg-white text-[#1A1A1A] border border-gray-200 hover:border-gray-300 hover:bg-[#F9FAFB] shadow-sm",
    ghost: "text-[#6C6E73] hover:bg-[#F5F6F8] hover:text-[#1A1A1A]",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
  };

  return (
    <motion.button
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
        className={`w-full bg-white border border-gray-200 text-[#1A1A1A] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3A7BFF]/20 focus:border-[#3A7BFF] transition-all placeholder:text-[#9CA3AF] shadow-sm ${props.className}`}
        {...props}
      />
    </motion.div>
  );
});

export const GammaBadge: React.FC<{ children: React.ReactNode; color?: "blue" | "green" | "red" | "yellow" | "slate" }> = ({ children, color = "slate" }) => {
  // Badge style : Pastel background, saturated text, no border
  const colors = {
    blue: "bg-blue-50 text-[#3A7BFF]",
    green: "bg-emerald-50 text-[#4BE2B0]",
    red: "bg-red-50 text-red-600",
    yellow: "bg-amber-50 text-amber-600",
    slate: "bg-[#F5F6F8] text-[#6C6E73]",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
};

export const GammaPill: React.FC<{ 
  label: string; 
  active?: boolean; 
  count?: number;
  onClick?: () => void 
}> = ({ label, active, count, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      layout
      className={`
        px-5 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2
        ${active 
          ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md" 
          : "bg-white text-[#6C6E73] border-gray-200 hover:border-gray-300 hover:text-[#1A1A1A]"
        }
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {label}
      {count !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-[#F5F6F8] text-[#6C6E73]"}`}>
          {count}
        </span>
      )}
    </motion.button>
  );
};

export const SectionTitle: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode }> = ({ title, subtitle, icon }) => (
  <div className="mb-10">
    <motion.h2 
      initial={{ opacity: 0, x: -10 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="text-[32px] font-bold text-[#1A1A1A] flex items-center gap-3 tracking-tight"
    >
      {icon && <span className="text-[#3A7BFF]">{icon}</span>}
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.1 }}
        className="text-[#6C6E73] mt-2 text-lg max-w-2xl font-normal leading-relaxed"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);
