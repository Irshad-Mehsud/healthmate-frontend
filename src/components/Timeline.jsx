import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Activity, CircleDot, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getUserReports } from "../api/auth";

const Timeline = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample vitals data (can be fetched from API later)
  const sampleVitals = [
    // {
    //   type: "vital",
    //   title: "Manual Entry: BP",
    //   date: "Oct 10, 2023",
    //   detail: "130/85",
    // },
  ];

  useEffect(() => {
    if (user?.id) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getUserReports(user.id);
      const reportsArray = response?.userReports || response || [];
      setReports(Array.isArray(reportsArray) ? reportsArray : []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Convert reports to timeline events
  const reportEvents = reports.map(report => ({
    type: "report",
    title: report.name || report.reportType || report.fileName,
    date: report.createdAt ? new Date(report.createdAt).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }) : 'N/A',
    detail: report.status || (report.analysis ? 'Analyzed' : 'Pending'),
    reportId: report.id || report._id,
    savedAnalysis: report.analysis || null,
    reportStatus: report.status,
  }));

  // Combine reports and vitals, sort by date (newest first)
  const events = [...reportEvents, ...sampleVitals];

  const handleEventClick = (event) => {
    if (event.type === "report" && event.reportId) {
      navigate("/analysis", {
        state: {
          fileName: event.title,
          reportId: event.reportId,
          savedAnalysis: event.savedAnalysis,
          reportStatus: event.reportStatus,
        }
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 px-3 sm:px-4">
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Dashboard</span>
      </button>

      <h3 className="text-xl sm:text-2xl font-extrabold mb-8 text-slate-900 dark:text-white">
        Your Medical Journey
      </h3>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No reports or vitals recorded yet.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-indigo-200 dark:border-slate-700 ml-4 sm:ml-6">
          {events.map((event, index) => {
            const isReport = event.type === "report";
            const isAnalyzed = event.detail === 'Analyzed' || event.savedAnalysis;

            return (
              <div 
                key={index} 
                className="mb-10 ml-6 sm:ml-10 relative group"
                onClick={() => handleEventClick(event)}
              >
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-10 sm:-left-14 top-1 
                  w-8 sm:w-10 h-8 sm:h-10 rounded-xl flex items-center justify-center 
                  border-4 border-white dark:border-slate-900 shadow-md 
                  transition-transform group-hover:scale-110
                  ${isReport ? (isAnalyzed ? "bg-emerald-500" : "bg-indigo-600") : "bg-amber-500"}`}
                >
                  {isReport ? (
                    <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  ) : (
                    <Activity className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  )}
                </div>

                {/* Card */}
                <div
                  className={`p-4 sm:p-6 rounded-2xl 
                    ${isReport 
                      ? (isAnalyzed 
                          ? "bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-emerald-400" 
                          : "bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-indigo-400")
                      : "bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400"
                    }
                    shadow-sm 
                    transition-all duration-300 
                    hover:shadow-lg hover:-translate-y-1
                    ${isReport ? "cursor-pointer" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CircleDot className={`w-3 sm:w-4 h-3 sm:h-4 ${
                        isReport 
                          ? (isAnalyzed ? "text-emerald-500" : "text-indigo-500")
                          : "text-amber-500"
                      }`} />

                      <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${
                        isReport 
                          ? (isAnalyzed ? "text-emerald-700 dark:text-emerald-300" : "text-indigo-700 dark:text-indigo-300")
                          : "text-amber-700 dark:text-amber-300"
                      }`}>
                        {event.date}
                      </span>
                    </div>

                    {isReport && (
                      <span className={`text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full ${
                        isAnalyzed 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" 
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}>
                        {isAnalyzed ? "Analyzed" : "Pending"}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {event.title}
                  </h4>

                  {!isReport && (
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400">
                      {event.detail}
                    </p>
                  )}

                  {isReport && (
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {isAnalyzed ? "Click to view AI analysis" : "Click to analyze this report"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Timeline;
