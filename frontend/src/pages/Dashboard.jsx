import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';

function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user projects
      const projectsResponse = await api.get('/projects/my');
      setProjects(projectsResponse.data.projects || []);
      
      // Load admin stats if user is admin
      if (isAdmin()) {
        try {
          const statsResponse = await api.get('/admin/dashboard/stats');
          setStats(statsResponse.data);
        } catch (statsError) {
          console.error('Failed to load admin stats:', statsError);
        }
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold leading-tight text-gray-900">
                  Welcome back, {user?.firstName || user?.email}!
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Manage your projects and track your progress
                </p>
              </div>
              <div className="flex space-x-3">
                <Link to="/projects/new">
                  <Button>
                    Create Project
                  </Button>
                </Link>
                {isAdmin() && (
                  <Link to="/admin">
                    <Button variant="outline">
                      Admin Panel
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-4 sm:px-0 mb-6">
            <Alert type="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </div>
        )}

        {/* Admin Stats */}
        {isAdmin() && stats && (
          <div className="px-4 sm:px-0 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Platform Statistics</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Users
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalUsers}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Projects
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalProjects}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Users
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.activeUsers}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Published Projects
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.publishedProjects}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Projects */}
        <div className="px-4 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Your Projects</h2>
            <Link to="/projects" className="text-sm text-blue-600 hover:text-blue-500">
              View all projects →
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first project.
              </p>
              <div className="mt-6">
                <Link to="/projects/new">
                  <Button>
                    Create Project
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 6).map((project) => (
                <div key={project.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {project.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {project.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {project.status}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.visibility === 'public' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.visibility}
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {project.description || 'No description available'}
                      </p>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </div>
                      <Link to={`/projects/${project.id}`}>
                        <Button size="small" variant="outline">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;