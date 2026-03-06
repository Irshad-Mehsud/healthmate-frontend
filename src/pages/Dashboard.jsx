import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Timeline from "../components/Timeline";
import { useAuth } from "../context/AuthContext";
import { uploadReport, getUserReports } from "../api/auth";

import {
  Activity,
  Droplet,
  Weight,
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Upload,
  X,
  Calendar,
  File,
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
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    reportType: '',
    reportDate: new Date().toISOString().split('T')[0], // Default to today
    file: null
  });

  // Fetch user reports on component mount
  useEffect(() => {
    if (user?.id) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      const userReports = await getUserReports(user.id);
      console.log('Fetched reports:', userReports);
      setReports(Array.isArray(userReports) ? userReports : []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setReports([]); // Set to empty array on error
    }
  };

  const handleReportUpload = async (reportData) => {
    const { file, reportType, reportDate } = reportData;
    
    // Get userId from localStorage (more reliable than context)
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData.id || user?.id;
    
    if (!file || !reportType || !reportDate) {
      setUploadError('Please fill in all required fields');
      return;
    }

    if (!userId) {
      setUploadError('User not found. Please log in again.');
      return;
    }

    console.log('Starting report upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      reportType: reportType,
      reportDate: reportDate,
      userId: userId
    });

    setUploading(true);
    setUploadMessage("");
    setUploadError("");

    try {
      const uploadFormData = new FormData();
      
      // Backend multer expects field name 'report' (upload.single("report"))
      uploadFormData.append('report', file);
      
      uploadFormData.append('userId', userId); // Backend controller reads req.body.userId
      uploadFormData.append('reportType', reportType);
      uploadFormData.append('reportDate', reportDate);
      
      // Determine file type
      const fileType = file.type.includes('pdf') ? 'pdf' : 'image';
      uploadFormData.append('fileType', fileType);
      
      // Also try adding authentication in case it's required
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Adding token to FormData:', token.substring(0, 20) + '...');
        uploadFormData.append('token', token);
      }
      
      // Log FormData contents before sending
      console.log('=== SENDING TO BACKEND ===');
      console.log('FormData entries:');
      for (let pair of uploadFormData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
        // Safe file detection - check if it has file properties
        if (pair[1] && typeof pair[1] === 'object' && pair[1].name && pair[1].size !== undefined) {
          console.log(`  File details - Name: ${pair[1].name}, Size: ${pair[1].size}, Type: ${pair[1].type}`);
        }
      }
      console.log('Backend URL: http://localhost:5000/api/reports/upload');
      console.log('User ID:', userId);
      console.log('Report Type:', reportType);
      console.log('Report Date:', reportDate);
      console.log('File Type:', fileType);
      console.log('========================');

      console.log('Making API call to uploadReport...');
      
      // Test backend connectivity first with more detailed error handling
      try {
        console.log('Testing backend connectivity...');
        const testResponse = await fetch('http://localhost:5000/api/reports/' + userId, { 
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          timeout: 5000 // 5 second timeout
        });
        console.log('Backend connectivity test status:', testResponse.status);
        
        if (!testResponse.ok && testResponse.status === 404) {
          console.warn('Backend reports endpoint not found, but server is running');
        }
      } catch (connectError) {
        console.error('Backend connection failed:', connectError);
        
        if (connectError.name === 'TypeError' && connectError.message.includes('fetch')) {
          throw new Error('Cannot connect to backend server. Please make sure the backend server is running on http://localhost:5000');
        } else if (connectError.name === 'AbortError') {
          throw new Error('Backend server is not responding (timeout). Please check if the server is running.');
        } else {
          throw new Error(`Backend connection error: ${connectError.message}`);
        }
      }
      
      const response = await uploadReport(uploadFormData);
      console.log('✅ Upload response:', response);
      
      setUploadMessage('Report uploaded successfully!');
      setShowUploadForm(false);
      resetForm();
      // Refresh reports list
      await fetchReports();
    } catch (error) {
      console.error('=== UPLOAD FAILED ===');
      console.error('Full error object:', error);
      console.error('Error message:', error.message);
      console.error('Response status:', error.response?.status || error.status);
      console.error('Response data:', error.response?.data);
      console.error('Response headers:', error.response?.headers);
      console.error('Request config:', error.config);
      console.error('========================');
      
      console.error('Upload error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status || error.status,
        headers: error.response?.headers
      });
      
      // Provide specific error messages based on the error
      let errorMessage = 'Failed to upload report';
      const statusCode = error.response?.status || error.status;
      
      if (statusCode === 400) {
        const backendMessage = error.response?.data?.message || error.response?.data?.error || 'Bad request - invalid data format';
        errorMessage = `Validation Error: ${backendMessage}`;
      } else if (statusCode === 500) {
        const backendMessage = error.response?.data?.message || 'Internal server error';
        errorMessage = `Server Error: ${backendMessage}. The upload service is currently unavailable.`;
      } else if (error.message.includes('Cannot connect to backend')) {
        errorMessage = error.message;
      } else if (error.message === 'Report Upload Failed') {
        errorMessage = 'Backend service error: The report upload endpoint may not be properly configured.';
      } else {
        errorMessage = error.message || 'Failed to upload report';
      }
      
      setUploadError(errorMessage);
      
      // For development: Add mock report to show UI functionality
      if (process.env.NODE_ENV === 'development') {
        console.log('Adding mock report for development...');
        const mockReport = {
          id: Date.now(),
          name: reportType,
          date: new Date(reportDate).toLocaleDateString(),
          status: 'Uploaded (Mock)',
          statusColor: 'text-blue-600',
          type: file.type.includes('image') ? 'Image' : file.type.includes('pdf') ? 'PDF' : 'Document',
          fileName: file.name,
          reportType: reportType
        };
        setReports(prev => [mockReport, ...(Array.isArray(prev) ? prev : [])]);
        setUploadMessage('Report uploaded successfully (Development Mode)!');
        setUploadError('');
        setShowUploadForm(false);
        resetForm();
      }
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      reportType: '',
      reportDate: new Date().toISOString().split('T')[0],
      file: null
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleReportUpload(formData);
  };

  const vitals = [
    {
      title: "Blood Pressure",
      value: "120/80",
      unit: "mmHg",
      trend: "Stable",
      trendType: "stable",
      bgColor: "bg-emerald-500",
      textColor: "text-emerald-500",
      icon: Activity,
    },
    {
      title: "Blood Sugar",
      value: "95",
      unit: "mg/dL",
      trend: "Normal",
      trendType: "down",
      bgColor: "bg-blue-500",
      textColor: "text-blue-500",
      icon: Droplet,
    },
    {
      title: "Weight",
      value: "72.4",
      unit: "kg",
      trend: "-2.1kg",
      trendType: "down",
      bgColor: "bg-indigo-500",
      textColor: "text-indigo-500",
      icon: Weight,
    },
  ];

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

        {/* Upload Report */}
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition active:scale-95"
          disabled={uploading}
        >
          <Plus className="w-5 h-5" />
          {uploading ? "Uploading..." : "Upload Report"}
        </button>

      </header>

      {/* Upload Messages */}
      {(uploadMessage || uploadError) && (
        <div className="px-6 mb-4">
          {uploadMessage && (
            <div className="p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg mb-2">
              <p className="text-sm text-green-700 dark:text-green-300">{uploadMessage}</p>
            </div>
          )}
          {uploadError && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{uploadError}</p>
            </div>
          )}
        </div>
      )}

      {/* Vitals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 px-6">
        {vitals.map((vital, index) => (
          <StatCard key={index} {...vital} />
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
                  state: { fileName: report.name || report.fileName }
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
                    {report.name}
                  </h4>

                  <p className="text-sm text-slate-500">
                    {report.type} • {report.date}
                  </p>
                </div>

              </div>

              <span className={`text-sm font-semibold px-4 py-1 rounded-full bg-white dark:bg-slate-700 shadow-sm ${report.statusColor}`}>
                {report.status}
              </span>

            </div>
          ))}

        </div>
      </section>
      {/* Upload Report Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upload Medical Report</h3>
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  resetForm();
                  setUploadError('');
                  setUploadMessage('');
                }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              
              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <File className="w-4 h-4 inline mr-1" />
                  Medical Report File *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    required
                    onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/20 dark:file:text-indigo-300"
                  />
                </div>
                {formData.file && (
                  <p className="text-sm text-slate-500 mt-1">
                    Selected: {formData.file.name}
                  </p>
                )}
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Report Type *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Blood Test, X-Ray, MRI, etc."
                  value={formData.reportType}
                  onChange={(e) => setFormData(prev => ({ ...prev, reportType: e.target.value }))}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">{uploadError}</p>
                </div>
              )}

              {/* Success Message */}
              {uploadMessage && (
                <div className="p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">{uploadMessage}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    resetForm();
                    setUploadError('');
                    setUploadMessage('');
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Report
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;