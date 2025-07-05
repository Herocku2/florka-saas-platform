import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">Florka</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/projects"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Projects
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user?.firstName || user?.email}
                </span>
                <Link to="/profile">
                  <Button variant="outline" size="small">
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="small"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline" size="small">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="small">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 p-2 rounded-md"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
            <Link
              to="/"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/projects"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Projects
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium w-full text-left"
                >
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;