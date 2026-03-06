import { useState } from 'react';
import { CloudArrowUpIcon, DocumentTextIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

const ReportViewer = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Simulated AI result based on project goals [cite: 28, 29, 30]
  const mockAnalysis = {
    summary: "Your Blood Report shows low Hemoglobin levels.",
    urduSummary: "Aapki blood report mein khoon ki kami (Hemoglobin low) nazar aa rahi hai.",
    abnormalValues: ["Hb: 10.5 g/dL (Low)", "WBC: 11,000 (Slightly High)"],
    questions: ["Should I take iron supplements?", "Is this related to my fatigue?"],
    remedies: "Palak (Spinach) aur anaar ka istemal barha dein."
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      {/* Upload Section [cite: 43] */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center justify-center text-center">
        <CloudArrowUpIcon className="w-12 h-12 text-brand-primary mb-4" />
        <h3 className="text-lg font-bold dark:text-white">Upload Medical Report</h3>
        <p className="text-slate-500 text-sm mb-6">PDF or Image (Gemini will read it directly) [cite: 21]</p>
        <button 
          onClick={() => { setIsUploading(true); setTimeout(() => { setAiAnalysis(mockAnalysis); setIsUploading(false); }, 2000); }}
          className="bg-brand-primary text-white px-6 py-2 rounded-full font-medium"
        >
          {isUploading ? "Gemini is reading..." : "Choose File"}
        </button>
      </div>

      {/* AI Summary Section [cite: 45] */}
      {aiAnalysis && (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-brand-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <CheckBadgeIcon className="w-6 h-6 text-brand-primary" />
            <h3 className="font-bold text-lg dark:text-white">AI Insight (Samajh)</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
              <p className="text-xs font-bold text-brand-secondary uppercase">Bilingual Summary</p>
              <p className="mt-1 dark:text-white">{aiAnalysis.summary}</p>
              <p className="mt-2 text-brand-primary italic font-medium">{aiAnalysis.urduSummary}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {aiAnalysis.abnormalValues.map((val, i) => (
                <div key={i} className="bg-rose-50 dark:bg-rose-900/20 p-2 rounded border border-rose-100 dark:border-rose-800 text-rose-600 text-xs font-bold">
                  ⚠️ {val}
                </div>
              ))}
            </div>

            <div className="p-4 border-l-4 border-brand-secondary bg-indigo-50 dark:bg-indigo-900/20">
              <p className="text-xs font-bold text-brand-secondary">Gharghuti Nuskhay (Remedies)</p>
              <p className="text-sm dark:text-slate-300">{aiAnalysis.remedies} [cite: 32]</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default ReportViewer;