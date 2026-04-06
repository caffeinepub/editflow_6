import { Button } from "@/components/ui/button";
import { FileText, Loader2, Shield, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  {
    icon: FileText,
    label: "Rich text editing",
    desc: "Full formatting toolbar with fonts, styles, and layouts",
  },
  {
    icon: Zap,
    label: "Version history",
    desc: "Track every save and restore previous versions",
  },
  {
    icon: Users,
    label: "Collaboration",
    desc: "Share documents and work with your team",
  },
  {
    icon: Shield,
    label: "Secure & private",
    desc: "Your documents live on the Internet Computer",
  },
];

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "oklch(0.955 0.01 240)" }}
    >
      {/* Left panel */}
      <motion.div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12"
        style={{
          background:
            "linear-gradient(145deg, oklch(0.33 0.072 247), oklch(0.27 0.06 250))",
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.55 0.1 200 / 0.3)" }}
          >
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-xl font-semibold tracking-tight">
            EditFlow
          </span>
        </div>

        <div>
          <motion.h1
            className="text-5xl font-bold text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Write, edit,
            <br />
            <span style={{ color: "oklch(0.78 0.1 200)" }}>collaborate.</span>
          </motion.h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-md">
            A professional document editor built on the Internet Computer. Your
            work stays yours — always.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              className="rounded-xl p-4"
              style={{ background: "oklch(1 0 0 / 0.07)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            >
              <f.icon
                className="w-5 h-5 mb-2"
                style={{ color: "oklch(0.78 0.1 200)" }}
              />
              <p className="text-white font-medium text-sm">{f.label}</p>
              <p className="text-white/55 text-xs mt-0.5 leading-snug">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Right panel */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.37 0.065 245)" }}
            >
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-xl font-semibold"
              style={{ color: "oklch(0.3 0.065 245)" }}
            >
              EditFlow
            </span>
          </div>

          <h2
            className="text-2xl font-bold mb-1"
            style={{ color: "oklch(0.18 0.04 250)" }}
          >
            Welcome back
          </h2>
          <p className="text-sm mb-8" style={{ color: "oklch(0.5 0.025 245)" }}>
            Sign in to access your documents and continue writing.
          </p>

          <Button
            data-ocid="login.primary_button"
            className="w-full h-11 text-sm font-semibold btn-new-doc rounded-lg shadow-sm"
            onClick={login}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting…
              </>
            ) : (
              "Sign in with Internet Identity"
            )}
          </Button>

          <p
            className="text-xs text-center mt-4"
            style={{ color: "oklch(0.6 0.015 245)" }}
          >
            Secure, passwordless authentication powered by the IC
          </p>

          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-xs" style={{ color: "oklch(0.65 0.015 245)" }}>
              © {new Date().getFullYear()}. Built with ♥ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
