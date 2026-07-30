import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Vote, BarChart3, Users, Zap, Star, ArrowRight, MessageCircle, Bookmark } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/layout/ThemeToggle";
import logo from "../assets/logo.png";

const features = [
  { icon: Vote, title: "5 poll formats", desc: "Single choice, yes/no, star ratings, image polls, and open-ended questions." },
  { icon: BarChart3, title: "Live results", desc: "Watch percentages update the moment votes come in, with clean animated bars." },
  { icon: Users, title: "Follow creators", desc: "Build a feed around the people whose polls you actually care about." },
  { icon: MessageCircle, title: "Threaded discussion", desc: "Every poll has its own comment thread, right where the vote happened." },
  { icon: Bookmark, title: "Save for later", desc: "Bookmark polls you want to revisit, all in one place." },
  { icon: Zap, title: "Built for speed", desc: "A fast, keyboard-friendly interface that gets out of your way." },
];

export default function LandingPage() {
  const { status } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-surface-dark/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="h-10 w-10 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Pollify" className="h-8 w-auto max-w-full object-contain" />
            </span>
            Pollify
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {status === "authed" ? (
              <Link to="/dashboard" className="btn bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:opacity-90 shadow-glow px-5 py-2.5 text-sm">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 text-sm">
                  Log in
                </Link>
                <Link to="/register" className="btn bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:opacity-90 shadow-glow px-5 py-2.5 text-sm">
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300 mb-6">
            <Star className="h-3 w-3 fill-current" /> Community polling, done right
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Ask the question.
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Let the crowd decide.</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Pollify is a community polling platform for real conversations — create a poll, watch the votes
            roll in, and discuss the results with people who actually showed up to vote.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/register" className="btn bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:opacity-90 shadow-glow px-8 py-3.5">
              Start polling free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-3.5">
              I have an account
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="card p-6"
            >
              <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="font-semibold mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Pollify. Built for communities that like to vote.
      </footer>
    </div>
  );
}
