import React from "react";
import { FileText, Brain, Activity, Sparkles } from "lucide-react";

const ReportAnalysis = () => {

  const aiInsights = [
    {
      title: "Report Understanding",
      value: "95% Confidence",
      color: "from-indigo-500 to-purple-500",
      icon: Brain,
    },
    {
      title: "Health Risk Score",
      value: "Low Risk",
      color: "from-emerald-500 to-teal-500",
      icon: Activity,
    },
    {
      title: "AI Recommendation",
      value: "Continue monitoring vitals",
      color: "from-amber-500 to-orange-500",
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">

      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">
        🤖 AI Report Analysis
      </h2>

      {/* Uploaded Report Preview */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 mb-10">
        <div className="flex items-center gap-4">
          <FileText className="w-10 h-10 text-indigo-500" />

          <div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-white">
              Uploaded Medical Report
            </h3>
            <p className="text-slate-500 text-sm">
              AI has analyzed your medical document
            </p>
          </div>
        </div>
      </div>

      {/* AI Insight Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {aiInsights.map((insight, index) => {
          const Icon = insight.icon;

          return (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${insight.color} flex items-center justify-center mb-4`}
              >
                <Icon className="text-white w-6 h-6" />
              </div>

              <h4 className="text-sm text-slate-500">
                {insight.title}
              </h4>

              <p className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                {insight.value}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ReportAnalysis;