import { motion } from "framer-motion";
import { Lock, Mail, ShieldCheck, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const fields = [
  {
    icon: User,
    label: "Full Name",
    type: "text",
    placeholder: "John Doe",
    name: "name",
  },
  {
    icon: Mail,
    label: "Email Address",
    type: "email",
    placeholder: "you@gmail.com",
    name: "email",
  },
  {
    icon: Lock,
    label: "Password",
    type: "password",
    placeholder: "Password",
    name: "password",
  },
  {
    icon: ShieldCheck,
    label: "Confirm Password",
    type: "password",
    placeholder: "Confirm password",
    name: "confirmPassword",
  },
];

const Register = () => {
  const { loginWithGoogle, register, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "attendee",
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleRoleChange = (role) => {
    setFormData((current) => ({ ...current, role }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    setIsLoading(true);

    const errorMsg = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.role,
    );

    if (errorMsg) {
      toast.error(errorMsg);
    } else {
      toast.success("Registration successful!");
      navigate(formData.role === "organizer" ? "/events/new" : "/");
    }

    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-125 w-125 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-125 w-125 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[32px_32px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <div className="hidden flex-1 flex-col justify-center px-20 lg:flex">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 via-blue-500 to-cyan-400 shadow-2xl shadow-violet-500/30">
                <Sparkles className="h-7 w-7 text-white" />
              </div>

              <div>
                <h1 className="text-3xl font-bold">Nexora</h1>
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                  AI Event Platform
                </p>
              </div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 text-6xl font-black leading-tight"
            >
              Discover <br />
              <span className="bg-linear-to-r from-violet-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Events That
              </span>
              <br />
              Move You.
            </motion.h2>

            <p className="mb-12 max-w-lg text-lg leading-relaxed text-zinc-400">
              Join thousands of users exploring premium events, concerts,
              tournaments, and unforgettable experiences powered by AI.
            </p>

            <div className="grid grid-cols-3 gap-5">
              {/* {[
                { value: "12K+", label: "Tickets Sold" },
                { value: "480+", label: "Events" },
                { value: "24/7", label: "AI Support" },
              ].map((item) => (
                <motion.div
                  whileHover={{ y: -5 }}
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
                >
                  <h3 className="mb-2 text-3xl font-bold text-cyan-400">
                    {item.value}
                  </h3>
                  <p className="text-sm text-zinc-400">{item.label}</p>
                </motion.div>
              ))} */}
            </div>
          </motion.div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Link to="/" className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-r from-violet-600 to-cyan-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>

              <div>
                <h1 className="text-xl font-bold">Nexora</h1>
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  AI Platform
                </p>
              </div>
            </Link>

            <div className="rounded-4xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
              <div className="mb-8">
                <h2 className="mb-2 text-4xl font-bold">Create Account</h2>
                <p className="text-zinc-400">
                  Start your journey with Ventro today.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {fields.map((field) => {
                  const Icon = field.icon;

                  return (
                    <div key={field.name}>
                      <label
                        htmlFor={field.name}
                        className="mb-2 block text-sm text-zinc-400"
                      >
                        {field.label}
                      </label>

                      <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 transition-all duration-300 focus-within:border-violet-500/50 focus-within:bg-white/5">
                        <Icon className="h-5 w-5 text-zinc-500 transition-colors group-focus-within:text-violet-400" />
                        <input
                          id={field.name}
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          required
                          className="login-input w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="pt-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    I want to:
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleRoleChange("attendee")}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        formData.role === "attendee"
                          ? "border-violet-400 bg-violet-500/15 text-violet-200"
                          : "border-white/10 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      Buy Tickets
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange("organizer")}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        formData.role === "organizer"
                          ? "border-violet-400 bg-violet-500/15 text-violet-200"
                          : "border-white/10 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      Host Events
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={isLoading ? undefined : { scale: 1.02 }}
                  whileTap={isLoading ? undefined : { scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="mt-3 w-full rounded-2xl bg-linear-to-r from-violet-600 via-blue-500 to-cyan-500 py-4 text-sm font-bold tracking-wide text-white shadow-2xl shadow-violet-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading
                    ? "Creating Account..."
                    : formData.role === "organizer"
                      ? "Create Organizer Account"
                      : "Create Your Account"}
                </motion.button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-semibold uppercase tracking-widest text-zinc-600">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                onClick={loginWithGoogle}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-semibold text-white backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-black text-blue-600">
                  G
                </span>
                Sign up with Google
              </button>

              <p className="mt-8 text-center text-sm text-zinc-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Login
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
