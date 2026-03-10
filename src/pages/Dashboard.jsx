import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Timeline from "../components/Timeline";
import { useAuth } from "../context/AuthContext";
import { getUserReports } from "../api/auth";

import {
  Activity,
  Droplet,
  Weight,
  FileText,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
} from "lucide-react";

/* ------------------ Reusable Stat Card ------------------ */

const StatCard = ({
  title,
  value,
  unit,
  trend,
  trendType,
  bgColor,
  textColor,
  icon: Icon,
}) => {
  const trendIcon =
    trendType === "up" ? (
      <TrendingUp className="w-3 h-3" />
    ) : trendType === "down" ? (
      <TrendingDown className="w-3 h-3" />
    ) : (
      <Minus className="w-3 h-3" />
    );

  return (
    <div className="group relative bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">

      <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10 ${bgColor}`} />

      <div className="flex justify-between items-start mb-5">
        <div className={`p-3 rounded-2xl ${bgColor} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>

        <div className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 ${textColor}`}>
          {trendIcon}
          {trend}
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {title}
      </p>

      <div className="flex items-baseline gap-1 mt-1">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white">
          {value}
        </h3>
        <span className="text-sm text-slate-400">{unit}</span>
      </div>

    </div>
  );
};

/* ------------------ Dashboard ------------------ */

const Dashboard = () => {

  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [abnormalCards, setAbnormalCards] = useState([]);

  // Fetch user reports on component mount
  useEffect(() => {
    if (user?.id) {
      fetchReports();
    }
  }, [user]);

  // Parse abnormal values from latest analyzed report
  const parseAbnormalString = (str) => {
    if (typeof str !== 'string') return str;
    const match = str.match(/^([^:]+):\s*([^(]+)(?:\(([^)]+)\))?/);
    if (match) {
      return {
        name: match[1].trim(),
        value: match[2].trim(),
        status: match[3]?.trim() || '',
      };
    }
    return { name: str, value: '', status: '' };
  };

  const extractAbnormalCards = (reportsArray) => {
    // Find latest analyzed report
    const latest = reportsArray.slice().reverse().find(r => r.analysis && r.analysis.abnormalValues);
    if (latest && latest.analysis) {
      const abnormalValues = (latest.analysis.abnormalValues || []).map(parseAbnormalString);
      setAbnormalCards(abnormalValues);
    } else {
      // Fallback to mock vitals
      setAbnormalCards([
        { name: "Blood Pressure", value: "120/80", status: "Stable", unit: "mmHg" },
        { name: "Blood Sugar", value: "95", status: "Normal", unit: "mg/dL" },
        { name: "Weight", value: "72.4", status: "Normal", unit: "kg" },
      ]);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await getUserReports(user.id);
      const reportsArray = response?.userReports || response || [];
      const validReports = Array.isArray(reportsArray) ? reportsArray : [];
      setReports(validReports);
      extractAbnormalCards(validReports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setReports([]);
      setAbnormalCards([]);
    }
  };

  // Dynamically render abnormal cards
  const getIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes("pressure") || n.includes("bp")) return Activity;
    if (n.includes("sugar") || n.includes("glucose")) return Droplet;
    if (n.includes("weight") || n.includes("bmi")) return Weight;
    return FileText;
  };

  const getUnit = (name, value) => {
    if (/mmhg/i.test(value) || /mmhg/i.test(name)) return "mmHg";
    if (/mg\/dL/i.test(value) || /sugar|glucose/i.test(name)) return "mg/dL";
    if (/kg/i.test(value) || /weight|bmi/i.test(name)) return "kg";
    if (/g\/dL/i.test(value)) return "g/dL";
    if (/cells/i.test(value)) return "cells/μL";
    return "";
  };

  const getTrendType = (status) => {
    if (!status) return "stable";
    const s = status.toLowerCase();
    if (s.includes("high") || s.includes("over")) return "up";
    if (s.includes("low") || s.includes("under")) return "down";
    return "stable";
  };

  const getBgColor = (trendType) => {
    if (trendType === "up") return "bg-red-500";
    if (trendType === "down") return "bg-amber-500";
    return "bg-emerald-500";
  };
  const getTextColor = (trendType) => {
    if (trendType === "up") return "text-red-500";
    if (trendType === "down") return "text-amber-500";
    return "text-emerald-500";
  };

  const sampleReports = [
    {
      id: 1,
      name: "CBC Lab Test",
      date: "10 Oct 2023",
      status: "Analyzed",
      statusColor: "text-emerald-600",
      type: "Blood",
    },
    {
      id: 2,
      name: "Chest X-Ray",
      date: "05 Oct 2023",
      status: "Pending",
      statusColor: "text-amber-500",
      type: "Imaging",
    },
  ];

  return (
    <main className="w-full py-10 bg-slate-50 dark:bg-slate-900 min-h-screen">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-14 px-6">

        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome Back, {user?.name || "User"}!
          </h2>

          <p className="text-slate-500 mt-1 font-medium italic">
            Upload medical reports and let AI analyze your health data.
          </p>
        </div>

      </header>

      {/* Vitals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 px-6">
        {abnormalCards.map((item, index) => (
          <StatCard
            key={index}
            title={item.name}
            value={item.value}
            unit={item.unit || getUnit(item.name, item.value)}
            trend={item.status || "Normal"}
            trendType={getTrendType(item.status)}
            bgColor={getBgColor(getTrendType(item.status))}
            textColor={getTextColor(getTrendType(item.status))}
            icon={getIcon(item.name)}
          />
        ))}
      </div>

      {/* Reports Section */}
      <section className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 p-8 mx-6">

        <div className="flex justify-between items-center mb-8">

          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Recent Reports
          </h3>

          <button
            className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
            onClick={() => navigate("/timeline")}
          >
            See Timeline <ArrowRight className="w-4 h-4" />
          </button>

        </div>

        <div className="space-y-4">
          {(reports.length > 0 ? reports : sampleReports).map(report => (
            <div
              key={report.id || report._id}
              onClick={() =>
                navigate("/analysis", {
                  state: { 
                    fileName: report.name || report.reportType || report.fileName,
                    reportId: report.id || report._id,
                    savedAnalysis: report.analysis || null,
                    reportStatus: report.status
                  }
                })
              }
              className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer  hover:border-indigo-200"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                  <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {report.name || report.reportType}
                  </h4>
                  <p className="text-sm text-slate-500">
                    {report.type || report.fileType} • {report.date || (report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A')}
                  </p>
                </div>
              </div>
              <span
                className={`text-sm sm:text-sm font-semibold px-4 py-1 sm:px-4 sm:py-1 rounded-full bg-white dark:bg-slate-700 shadow-sm ${report.statusColor || 'text-emerald-600'}
                  text-xs px-2 py-0.5 sm:text-sm sm:px-4 sm:py-1
                `}
                style={{ minWidth: '70px', textAlign: 'center' }}>
                {report.status === 'Analyzed' ? (
                  <Check className="inline w-5 h-5 text-emerald-600 align-middle" />
                ) : (
                  report.status || 'Uploaded'
                )}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;