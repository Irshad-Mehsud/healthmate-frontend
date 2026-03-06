import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { HeartPulse, Bell, Menu, LogOut, User, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [openProfile, setOpenProfile] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  const dropdownRef = useRef(null);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Reports", path: "/timeline" },
    { name: "Analytics", path: "/analysis" },
    { name: "Settings", path: "/settings" },
  ];

  const handleLogout = () => {
    logout();
    setOpenProfile(false);
    navigate("/login", { replace: true });
  };

  /* Close dropdown when clicking outside */
  useEffect(() => {

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">

        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
              <HeartPulse className="w-5 h-5" />
            </div>

            <span className="text-xl font-extrabold">
              HealthMate
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            {navLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-600 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right Section */}
          <div ref={dropdownRef} className="flex items-center gap-4 relative">

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            </button>

            {/* Profile Button */}
            <button
              onClick={() => setOpenProfile(!openProfile)}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <img
                src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`}
                className="w-8 h-8 rounded-full border object-cover"
                alt="Profile"
              />
            </button>

            {/* Profile Dropdown */}
            {openProfile && (
              <div className="absolute right-0 top-14 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-3">

                <div className="flex items-center gap-3 p-3 border-b dark:border-slate-700">
                  <img
                    src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`}
                    className="w-10 h-10 rounded-full object-cover"
                    alt="Profile"
                  />

                  <div>
                    <p className="font-semibold">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-500">
                      {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Patient'} Account
                    </p>
                    {user?.email && (
                      <p className="text-xs text-slate-400">{user.email}</p>
                    )}
                  </div>
                </div>

                <div className="mt-2 space-y-1">

                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <HeartPulse className="w-4 h-4" />
                    Dashboard
                  </button>

                  <button
                    onClick={() => navigate("/settings")}
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>

                  <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                    <User className="w-4 h-4" />
                    Profile
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>

                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setOpenMobileMenu(!openMobileMenu)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Menu className="w-6 h-6" />
            </button>

          </div>

        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {openMobileMenu && (
        <div className="md:hidden px-6 pb-4 space-y-2 border-b border-slate-200 dark:border-slate-800">

          {navLinks.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setOpenMobileMenu(false)}
              className={({ isActive }) =>
                `block py-2 text-sm font-semibold ${
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-600 dark:text-slate-300"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

        </div>
      )}
    </>
  );
};

export default Navbar;