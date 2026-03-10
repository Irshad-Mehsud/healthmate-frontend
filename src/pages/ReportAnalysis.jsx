import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FileText, Brain, Activity, Sparkles, Upload, 
  AlertTriangle, Stethoscope, Utensils, Home, Info, Loader2, Calendar, File,
  RefreshCw, ArrowLeft
} from "lucide-react";
import { getReportAnalysis, uploadReport, saveReportAnalysis, getReportDetails } from "../api/auth";

const ReportAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fileName, reportId, savedAnalysis, reportStatus } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isUrdu, setIsUrdu] = useState(false);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [currentReportId, setCurrentReportId] = useState(reportId || null);
  const [viewingSaved, setViewingSaved] = useState(false);
  const [formData, setFormData] = useState({
    file: null,
    reportType: '',
    reportDate: new Date().toISOString().split('T')[0]
  });

  // Check for saved analysis on mount
  useEffect(() => {
    if (savedAnalysis) {
      setReportData(savedAnalysis);
      setViewingSaved(true);
    } else if (reportId && reportStatus === 'Analyzed') {
      // Fetch saved analysis from backend if status is Analyzed
      fetchSavedAnalysis(reportId);
    } else if (reportId) {
      // No saved analysis, fetch new AI insights
      fetchAIInsights(reportId);
    }
  }, [reportId, savedAnalysis, reportStatus]);

  // Function to fetch saved analysis from database
  const fetchSavedAnalysis = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getReportDetails(id);
      
      if (result.success && result.report?.analysis) {
        setReportData(result.report.analysis);
        setViewingSaved(true);
      } else {
        // No saved analysis, fetch new AI insights
        await fetchAIInsights(id);
      }
    } catch (err) {
      console.error("Fetch saved analysis error:", err);
      // Try fetching new AI insights as fallback
      await fetchAIInsights(id);
    } finally {
      setLoading(false);
    }
  };

  // Function to re-analyze report
  const handleReAnalyze = async () => {
    if (currentReportId) {
      setViewingSaved(false);
      setReportData(null);
      await fetchAIInsights(currentReportId);
    }
  };

  // Function to save analysis to database
  const saveAnalysisToDatabase = async (id, data) => {
    try {
      setSaving(true);
      
      const saveData = {
        reportId: id,
        summaryEnglish: data.summaryEnglish,
        summaryRomanUrdu: data.summaryRomanUrdu,
        abnormalValues: data.abnormalValues,
        dietSuggestions: data.dietSuggestions,
        homeRemedies: data.homeRemedies,
        doctorAdvice: data.doctorAdvice,
        analyzedAt: new Date().toISOString()
      };
      
      await saveReportAnalysis(id, saveData);
      setSaveSuccess('Analysis saved to your records!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save analysis:', err);
      // Don't show error to user - analysis is still displayed
      // Just log it for debugging
    } finally {
      setSaving(false);
    }
  };

  // Function to fetch AI insights using a specific Report ID
  const fetchAIInsights = async (id) => {
    setLoading(true);
    setError(null);
    setCurrentReportId(id);
    try {
      const result = await getReportAnalysis(id);
      
      if (result.success) {
        setReportData(result.data);
        // Save to database after successfully receiving the response
        await saveAnalysisToDatabase(id, result.data);
      } else {
        setError(result.message || "Failed to analyze the report.");
      }
    } catch (err) {
      console.error("AI Insights Error:", err);
      setError(err.message || "Network error while connecting to AI service.");
    } finally {
      setLoading(false);
    }
  };

  // Form submission handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const { file, reportType, reportDate } = formData;
    
    if (!file || !reportType || !reportDate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setReportData(null);
    setUploadSuccess("");

    try {
      // Prepare Form Data for Upload
      const uploadFormData = new FormData();
      uploadFormData.append("report", file);
      
      // Fetching user info from localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData.id || userData._id;
      uploadFormData.append("userId", userId);
      uploadFormData.append("reportType", reportType);
      uploadFormData.append("reportDate", reportDate);
      
      const fileType = file.type.includes('pdf') ? 'pdf' : 'image';
      uploadFormData.append("fileType", fileType);
      
      const uploadData = await uploadReport(uploadFormData);
      
      // Get the report ID from the upload response (newReport._id based on API response)
      const newReportId = uploadData.newReport?._id || uploadData.newReport?.id || uploadData.reportId;
      
      if (newReportId) {
        setUploadSuccess(`Report "${reportType}" uploaded successfully! Analyzing...`);
        // Reset form
        setFormData({ file: null, reportType: '', reportDate: new Date().toISOString().split('T')[0] });
        // Automatically trigger AI analysis using the new ID
        await fetchAIInsights(newReportId);
      } else {
        setError(uploadData.message || "Upload succeeded but no report ID returned.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Upload Error:", err);
      setError(err.message || "Failed to upload file. Check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <Brain className="text-indigo-500 w-8 h-8" /> AI Report Insights
            </h2>
            {fileName && (
              <p className="text-slate-500 mt-1">
                {viewingSaved ? 'Viewing saved analysis for: ' : 'Analyzing: '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{fileName}</span>
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {reportData && viewingSaved && (
              <button 
                onClick={handleReAnalyze}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Re-Analyze
              </button>
            )}
            {reportData && (
              <button 
                onClick={() => setIsUrdu(!isUrdu)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition shadow-md"
              >
                {isUrdu ? "English" : "Roman Urdu"}
              </button>
            )}
          </div>
        </div>

        {/* Viewing Saved Analysis Badge */}
        {viewingSaved && reportData && (
          <div className="mb-6 p-4 bg-emerald-100 dark:bg-emerald-900/30 border-l-4 border-emerald-500 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center gap-3">
            <Sparkles size={20} />
            <div>
              <p className="font-medium">Saved Analysis</p>
              <p className="text-sm opacity-80">This analysis was saved on {reportData.analyzedAt ? new Date(reportData.analyzedAt).toLocaleString() : 'a previous date'}</p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-lg">
            <AlertTriangle size={20} /> {error}
          </div>
        )}

        {/* Save Success Notification */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 flex items-center gap-3 rounded-lg">
            <Sparkles size={20} /> {saveSuccess}
          </div>
        )}

        {/* Saving Indicator */}
        {saving && (
          <div className="mb-6 p-4 bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 text-blue-700 dark:text-blue-300 flex items-center gap-3 rounded-lg">
            <Loader2 size={20} className="animate-spin" /> Saving analysis to your records...
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-3xl p-12 text-center bg-white dark:bg-slate-800 shadow-sm">
            <div className="flex flex-col items-center">
              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-4" />
              <p className="text-xl font-semibold dark:text-white animate-pulse">Processing & Analyzing...</p>
              {fileName && <p className="text-slate-500 mt-2">{fileName}</p>}
            </div>
          </div>
        )}

        {/* Upload Success Message */}
        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 rounded-lg">
            <p className="font-medium">{uploadSuccess}</p>
          </div>
        )}

        {/* Upload Form - Show when no report selected and not loading */}
        {!reportData && !loading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="w-8 h-8 text-indigo-500" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upload Medical Report</h3>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <File className="w-4 h-4 inline mr-1" />
                  Medical Report File *
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                  <input
                    type="file"
                    id="fileInput"
                    accept=".pdf,image/*"
                    required
                    onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
                    className="hidden"
                  />
                  <label htmlFor="fileInput" className="cursor-pointer">
                    {formData.file ? (
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-indigo-500 mb-2" />
                        <p className="text-slate-900 dark:text-white font-medium">{formData.file.name}</p>
                        <p className="text-sm text-slate-500 mt-1">Click to change file</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-12 h-12 text-slate-400 mb-2" />
                        <p className="text-slate-600 dark:text-slate-400">Click to select a file</p>
                        <p className="text-sm text-slate-500 mt-1">PDF or Images supported</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Report Type *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Blood Test, X-Ray, MRI, CBC, etc."
                  value={formData.reportType}
                  onChange={(e) => setFormData(prev => ({ ...prev, reportType: e.target.value }))}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Report Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Report Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.reportDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, reportDate: e.target.value }))}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Upload className="w-5 h-5" />
                Upload & Analyze Report
              </button>
            </form>
          </div>
        )}

        {/* Results Section */}
        {reportData && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Summary Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border-l-4 border-indigo-500">
              <div className="flex items-center gap-3 mb-4 text-indigo-500">
                <FileText />
                <h3 className="text-xl font-bold dark:text-white">Report Summary</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                {isUrdu ? reportData.summaryRomanUrdu : reportData.summaryEnglish}
              </p>
            </div>

            {/* Analysis Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Abnormal Values */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-3 mb-4 text-red-500">
                  <AlertTriangle size={24} />
                  <h4 className="font-bold">Abnormal Values</h4>
                </div>
                <ul className="space-y-2">
                  {(reportData.abnormalValues || []).map((val, i) => (
                    <li key={i} className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-2 rounded-lg text-sm font-medium border-l-2 border-red-500">
                      • {val}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Diet Suggestions */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-3 mb-4 text-emerald-500">
                  <Utensils size={24} />
                  <h4 className="font-bold">Diet Suggestions</h4>
                </div>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                  {(reportData.dietSuggestions || []).map((item, i) => <li key={i}>✅ {item}</li>)}
                </ul>
              </div>

              {/* Home Remedies */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center gap-3 mb-4 text-amber-500">
                  <Home size={24} />
                  <h4 className="font-bold">Home Remedies</h4>
                </div>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                  {(reportData.homeRemedies || []).map((item, i) => <li key={i}>🏠 {item}</li>)}
                </ul>
              </div>
            </div>

            {/* Questions for Doctor */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-center gap-3 mb-4 text-indigo-600 dark:text-indigo-400">
                <Stethoscope size={24} />
                <h4 className="font-bold text-lg">Ask Your Doctor These Questions:</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {(reportData.doctorQuestions || []).map((q, i) => (
                  <p key={i} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm text-sm dark:text-slate-300 italic">
                    "{q}"
                  </p>
                ))}
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-slate-200 dark:bg-slate-800/50 p-4 rounded-xl gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <Info size={14} />
                <span>{reportData.disclaimer || "AI analysis for information only."}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-700 rounded-full text-[10px] font-bold text-indigo-500 uppercase tracking-widest shadow-sm">
                <Sparkles size={12} /> Powered by Groq Llama 3
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ReportAnalysis;