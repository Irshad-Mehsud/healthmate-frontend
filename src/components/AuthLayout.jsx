const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">

      {/* Left Brand Section */}
      <div className="hidden lg:flex flex-col justify-center p-16 relative overflow-hidden
        bg-gradient-to-br from-indigo-600 to-purple-600 text-white">

        {/* Background Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative max-w-md">

          {/* Logo */}
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 shadow-lg">
            <span className="text-2xl font-bold">+</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-extrabold mb-5 tracking-tight">
            HealthMate
          </h1>

          {/* Description */}
          <p className="text-lg text-white/80 leading-relaxed">
            Your smart healthcare companion that helps you track and understand your medical data intelligently.
          </p>

          {/* Feature Highlight */}
          <div className="mt-10 space-y-4">

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-sm">
                AI-powered health insights and report analysis.
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex items-center justify-center p-6 md:p-12">

        <div className="w-full max-w-md">

          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>

            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {subtitle}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
            {children}
          </div>

        </div>

      </div>

    </div>
  );
};

export default AuthLayout;