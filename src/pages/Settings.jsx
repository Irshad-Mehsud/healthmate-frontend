import React, { useState, useEffect } from "react";
import { User, Mail, Camera, Save, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateUser } from "../api/auth";

const Settings = () => {
  const { user, setUser } = useAuth();

  const [profileImage, setProfileImage] = useState(
    user?.profilePicture || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`
  );
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    contactNumber: user?.contactNumber || "",
  });

  // Update form when user data changes
  useEffect(() => {
    console.log('Settings useEffect - user data:', user);
    if (user) {
      const formData = {
        name: user.name || "",
        email: user.email || "",
        contactNumber: user.contactNumber || "",
      };
      console.log('Setting form data:', formData);
      setForm(formData);
      
      const imageUrl = user.profilePicture || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=6366f1&color=fff`;
      console.log('Setting profile image:', imageUrl);
      setProfileImage(imageUrl);
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfileImage(URL.createObjectURL(file));
      setNewProfileImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with:', form);
    
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("contactNumber", form.contactNumber);
      
      if (newProfileImage) {
        console.log('Adding new profile image to form data');
        formData.append("profilePicture", newProfileImage);
      }

      console.log('Calling updateUser API with userId:', user.id);
      const response = await updateUser(user.id, formData);
      console.log('Update response:', response);
      
      // Update user data in AuthContext with response data or form data
      const updatedUserData = {
        ...user,
        name: response.name || form.name,
        email: response.email || form.email,
        contactNumber: response.contactNumber || form.contactNumber,
        profilePicture: response.profilePicture || (newProfileImage ? profileImage : user.profilePicture),
      };
      
      console.log('Updating user context with:', updatedUserData);
      setUser(updatedUserData);
      
      // Also update localStorage with new user data
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      setMessage("Profile updated successfully!");
      setNewProfileImage(null);
      
      // Clear any temporary object URLs
      if (newProfileImage && profileImage.startsWith('blob:')) {
        URL.revokeObjectURL(profileImage);
      }
      
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">

      {/* Single Settings Card */}
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8">

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">
         Profile Settings
        </h2>

        <form onSubmit={handleSubmit}>

        {/* Profile Image */}
        <div className="flex flex-col items-center mb-8">

          <div className="relative group">

            <img
              src={profileImage}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
            />

            {/* Camera Upload Button */}
            <label className="absolute bottom-0 right-2 bg-indigo-600 p-2 rounded-full cursor-pointer hover:scale-110 transition">
              <Camera className="w-4 h-4 text-white" />

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>

          </div>

          <p className="text-sm text-slate-500 mt-3">
            Click camera icon to update profile picture
          </p>
          
          {user?.role && (
            <p className="text-xs text-indigo-600 font-semibold mt-1 capitalize">
              {user.role} Account
            </p>
          )}

        </div>

        {/* Form Fields */}
        <div className="space-y-5">

          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2">
              <User className="w-4 h-4" />
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="Enter your email address"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Phone className="w-4 h-4" />
              Contact Number
            </label>

            <input
              type="text"
              name="contactNumber"
              value={form.contactNumber}
              onChange={e => setForm({ ...form, contactNumber: e.target.value })}
              required
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="03xx-xxxxxxx"
            />
          </div>

        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">{message}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Save Button */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-lg"
        >
          <Save className="w-5 h-5" />
          {loading ? "Updating..." : "Save Profile"}
        </button>

        </form>

      </div>

    </div>
  );
};

export default Settings;