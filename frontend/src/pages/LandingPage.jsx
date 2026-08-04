import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  Settings,
  Zap,
  Share2,
  TrendingUp,
  Globe,
  MessageSquare,
  ArrowRight,
  Sparkles,
  MousePointerClick,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/layout/ThemeToggle";

// ─── Reusable Logo Component ──────────────────────────────────────────────
export const Logo = ({ className = "" }) => (
  <div className={`flex items-center gap-2.5 font-bold text-xl text-[#0f172a] dark:text-white ${className}`}>
    <div className="flex items-end gap-[3px] h-6 w-6">
      <div className="w-[5px] h-[10px] bg-primary-400 rounded-t-[1.5px]" />
      <div className="w-[5px] h-[16px] bg-primary-500 rounded-t-[1.5px]" />
      <div className="w-[5px] h-[22px] bg-primary-600 rounded-t-[1.5px]" />
    </div>
    <span className="tracking-tight">Pollify</span>
  </div>
);

export default function LandingPage() {
  const { status, user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-surface-dark text-[#0f172a] dark:text-gray-100 font-sans overflow-x-hidden selection:bg-primary-200/70">
      
      {/* Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none overflow-hidden z-0 opacity-70">
        <div className="absolute -top-40 left-1/4 w-[400px] h-[400px] rounded-full bg-primary-500/10 dark:bg-primary-500/5 blur-3xl" />
        <div className="absolute -top-40 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-500/10 dark:bg-accent-500/5 blur-3xl" />
      </div>

      {/* ─── NAVBAR ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[#e2e8f0]/80 dark:border-gray-800/85 bg-white/80 dark:bg-surface-dark/85 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            
            {/* Nav links */}
            {status === "authed" && (
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className="px-3.5 py-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400"
                >
                  Dashboard
                </Link>
                <Link
                  to="/explore"
                  className="px-3.5 py-1.5 text-sm font-medium text-[#64748b] hover:text-[#0f172a] dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Explore
                </Link>
                <Link
                  to="/trending"
                  className="px-3.5 py-1.5 text-sm font-medium text-[#64748b] hover:text-[#0f172a] dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Trending
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {status === "authed" ? (
              <>
                <Link
                  to="/dashboard"
                  className="btn bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/20 px-4 py-2 text-sm font-semibold"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[#64748b] hover:text-[#0f172a] dark:text-gray-400 dark:hover:text-gray-200 text-sm font-semibold px-4 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="btn bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/20 px-4 py-2 text-sm font-semibold"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Hero Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 text-left"
        >
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold select-none">
            <Sparkles className="h-3 w-3 fill-current" />
            <span>Next-Gen Polling is here</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0f172a] dark:text-white leading-[1.1]">
            Create polls that people actually{" "}
            <span className="bg-gradient-to-r from-primary-500 to-emerald-600 bg-clip-text text-transparent">love to answer.</span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-[#64748b] dark:text-gray-400 leading-relaxed max-w-xl">
            Say goodbye to boring forms. Pollify combines minimalist design with
            real-time insights to help you capture higher response rates and
            deeper community opinions effortlessly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to={status === "authed" ? "/dashboard" : "/register"}
              className="btn bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md shadow-primary-600/25 px-6 py-3 rounded-xl transition-all duration-200"
            >
              Get Started Free
            </Link>
            <Link
              to="/explore"
              className="btn bg-white dark:bg-surface-dark border border-[#e2e8f0] dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2 transition-all duration-200"
            >
              <span>Explore Polls</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-3 pt-6 border-t border-[#e2e8f0] dark:border-gray-800 max-w-sm">
            <div className="flex -space-x-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=48&h=48&q=80"
                alt="User avatar 1"
                className="h-8 w-8 rounded-full border-2 border-white dark:border-surface-dark object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=48&h=48&q=80"
                alt="User avatar 2"
                className="h-8 w-8 rounded-full border-2 border-white dark:border-surface-dark object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=48&h=48&q=80"
                alt="User avatar 3"
                className="h-8 w-8 rounded-full border-2 border-white dark:border-surface-dark object-cover"
              />
            </div>
            <p className="text-xs text-[#64748b] dark:text-gray-400">
              Trusted by <span className="font-bold text-[#0f172a] dark:text-gray-200">2,500+</span> teams worldwide
            </p>
          </div>
        </motion.div>

        {/* Hero Visual Block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative space-y-4"
        >
          {/* Main Visual Card */}
          <div className="card p-6 bg-white dark:bg-surface-dark-elevated rounded-2xl shadow-xl border border-[#e2e8f0] dark:border-gray-800/80">
            <div className="flex items-center justify-between mb-6">
              <div className="text-left">
                <h3 className="font-bold text-[#0f172a] dark:text-gray-200">Current Performance</h3>
                <p className="text-xs text-[#94a3b8] mt-0.5">Global Employee Survey 2024</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200/40">
                ACTIVE
              </span>
            </div>

            {/* Mock Bar Chart */}
            <div className="flex items-end justify-between h-40 gap-4 pt-4 px-2">
              <div className="w-full bg-primary-100/70 dark:bg-primary-500/10 rounded-lg transition-all hover:opacity-85" style={{ height: "20%" }} />
              <div className="w-full bg-primary-200/80 dark:bg-primary-500/20 rounded-lg transition-all hover:opacity-85" style={{ height: "45%" }} />
              <div className="w-full bg-gradient-to-t from-primary-500 to-primary-600 rounded-lg shadow-sm shadow-primary-500/20 transition-all hover:scale-[1.02]" style={{ height: "85%" }} />
              <div className="w-full bg-primary-200/80 dark:bg-primary-500/20 rounded-lg transition-all hover:opacity-85" style={{ height: "55%" }} />
              <div className="w-full bg-primary-100/70 dark:bg-primary-500/10 rounded-lg transition-all hover:opacity-85" style={{ height: "25%" }} />
            </div>
          </div>

          {/* Sub Stats Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={Zap}
              iconBg="bg-amber-50 dark:bg-amber-500/10"
              iconColor="text-amber-500"
              value="98%"
              label="Completion Rate"
            />
            <StatCard
              icon={Share2}
              iconBg="bg-primary-50 dark:bg-primary-500/10"
              iconColor="text-primary-500"
              value="1.2k"
              label="Shares Today"
            />
          </div>
        </motion.div>
      </main>

      {/* ─── FEATURES SECTION ──────────────────────────────────────────────── */}
      <section className="bg-[#f1f5f9]/50 dark:bg-surface-dark-elevated/40 py-20 border-t border-b border-[#e2e8f0]/80 dark:border-gray-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold text-[#0f172a] dark:text-white tracking-tight">
              Everything you need to <span className="text-primary-600 dark:text-primary-400">decide faster.</span>
            </h2>
            <p className="text-sm text-[#64748b] dark:text-gray-400 leading-relaxed">
              Powerful features designed for professionals. From real-time analytics to custom formatting,
              Pollify puts you in control of your community opinion.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={MousePointerClick}
              iconBg="bg-blue-50 dark:bg-blue-500/10"
              iconColor="text-blue-500"
              title="Instant Deployment"
              description="Create and launch polls in under 60 seconds with our clean form generator and beautiful selection templates."
            />
            <FeatureCard
              icon={TrendingUp}
              iconBg="bg-emerald-50 dark:bg-emerald-500/10"
              iconColor="text-emerald-500"
              title="Deep Analytics"
              description="Visualize response metrics with clean Recharts bars, average scores, view counts, and nested discussions."
            />
            <FeatureCard
              icon={Share2}
              iconBg="bg-purple-50 dark:bg-purple-500/10"
              iconColor="text-purple-500"
              title="Universal Sharing"
              description="Embed polls anywhere or share via secure link. Pollify works perfectly on mobile, tablet, and desktop layout sizes."
            />
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA SECTION ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="card max-w-4xl mx-auto p-10 bg-white dark:bg-surface-dark-elevated rounded-3xl shadow-xl border border-[#e2e8f0]/80 dark:border-gray-800/80 text-center space-y-6"
        >
          <h2 className="text-3xl font-bold text-[#0f172a] dark:text-white">
            Ready to transform your polling?
          </h2>
          <p className="text-sm text-[#64748b] dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Join thousands of active users already using Pollify to gather actionable feedback.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to={status === "authed" ? "/create" : "/register"}
              className="btn bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-sm px-6 py-3 rounded-xl text-sm"
            >
              Create Your First Poll
            </Link>
            <Link
              to="/explore"
              className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-semibold"
            >
              Explore Dashboard
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-[#f1f5f9]/80 dark:bg-surface-dark/60 border-t border-[#e2e8f0] dark:border-gray-800 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <Logo className="justify-center md:justify-start" />
            <p className="text-xs text-[#94a3b8] mt-2">
              &copy; {new Date().getFullYear()} Pollify Inc. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-[#64748b] dark:text-gray-400 font-medium">
            <a href="#privacy" className="hover:text-[#0f172a] dark:hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-[#0f172a] dark:hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#support" className="hover:text-[#0f172a] dark:hover:text-white transition-colors">
              Contact Support
            </a>
          </div>

          <div className="flex items-center gap-4 text-[#94a3b8]">
            <button aria-label="Language selection" className="hover:text-[#64748b] dark:hover:text-white transition-colors">
              <Globe className="h-5 w-5" />
            </button>
            <button aria-label="Support chat" className="hover:text-[#64748b] dark:hover:text-white transition-colors">
              <MessageSquare className="h-5 w-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub Stats Card Component ──────────────────────────────────────────────
const StatCard = ({ icon: Icon, iconBg, iconColor, value, label }) => (
  <div className="card p-5 bg-white dark:bg-surface-dark-elevated rounded-2xl shadow-sm border border-[#e2e8f0]/80 dark:border-gray-800/80 flex items-center gap-4">
    <div className={`h-10 w-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="text-left">
      <p className="text-xl font-bold leading-none text-[#0f172a] dark:text-gray-100">{value}</p>
      <p className="text-xs text-[#94a3b8] mt-1">{label}</p>
    </div>
  </div>
);

// ─── Feature Card Component ────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, iconBg, iconColor, title, description }) => (
  <div className="card p-6 bg-white dark:bg-surface-dark-elevated rounded-2xl border border-[#e2e8f0]/80 dark:border-gray-800/80 shadow-sm flex flex-col justify-between text-left">
    <div>
      <div className={`h-11 w-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center mb-4`}>
        <Icon className="h-5.5 w-5.5" />
      </div>
      <h3 className="font-bold text-[#0f172a] dark:text-gray-100 text-lg mb-2">{title}</h3>
      <p className="text-sm text-[#64748b] dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  </div>
);
