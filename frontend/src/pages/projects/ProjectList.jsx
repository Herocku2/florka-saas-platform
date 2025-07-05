import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

function ProjectList() {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);

  useEffect(() => {
    loadProjects();
  }, [currentPage, searchTerm]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await api.get('/projects', { params });
      const data = response.data;
      
      setProjects(data.projects || []);
      setTotalPages(data.totalPages || 1);
      setTotalProjects(data.total || 0);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold leading-tight text-gray-900">
                  Projects
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Discover and explore amazing projects from our community
                </p>
              </div>
              {isAuthenticated && (
                <Link to="/projects/new">
                  <Button>
                    Create Project
                  </Button>
                </Link>
              )}
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

        {/* Search and Filters */}
        <div className="px-4 sm:px-0 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full"
              />
            </div>
          </div>
          
          {totalProjects > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {projects.length} of {totalProjects} projects
            </div>
          )}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Be the first to create a project!'
              }
            </p>
            {!searchTerm && isAuthenticated && (
              <div className="mt-6">
                <Link to="/projects/new">
                  <Button>
                    Create Project
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 sm:px-0">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {project.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {project.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            by {project.user?.firstName || project.user?.email || 'Anonymous'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {project.description || 'No description available'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'published' 
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                        {project.visibility === 'public' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Public
                          </span>
                        )}
                      </div>
                      <Link to={`/projects/${project.id}`}>
                        <Button size="small" variant="outline">
                          View
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="mt-4 text-xs text-gray-500">
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectList;