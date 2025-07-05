import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    visibility: ''
  });
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadProjects();
  }, [pagination.page, filters]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.visibility && { visibility: filters.visibility })
      };
      
      const response = await api.get('/admin/projects', { params });
      setProjects(response.data.projects || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0
      }));
    } catch (err) {
      setError('Failed to load projects');
      console.error('Load projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadProjects();
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [projectId]: true }));
      await api.put(`/admin/projects/${projectId}/status`, { status: newStatus });
      
      setProjects(prev => prev.map(project => 
        project.id === projectId ? { ...project, status: newStatus } : project
      ));
      setSuccess(`Project status updated to ${newStatus}`);
    } catch (err) {
      setError('Failed to update project status');
      console.error('Update project status error:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    try {
      setActionLoading(prev => ({ ...prev, [projectId]: true }));
      await api.delete(`/admin/projects/${projectId}`);
      
      setProjects(prev => prev.filter(project => project.id !== projectId));
      setSuccess('Project deleted successfully');
    } catch (err) {
      setError('Failed to delete project');
      console.error('Delete project error:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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
                  Project Management
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Manage all projects on the platform
                </p>
              </div>
              <Link to="/admin">
                <Button variant="outline">
                  ← Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="px-4 sm:px-0 mb-6">
            <Alert type="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </div>
        )}
        
        {error && (
          <div className="px-4 sm:px-0 mb-6">
            <Alert type="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </div>
        )}

        {/* Filters */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Search projects"
                    name="search"
                    type="text"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by title or description..."
                  />
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={filters.visibility}
                    onChange={handleFilterChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">All Visibility</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit">
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Projects Table */}
        <div className="px-4 sm:px-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <LoadingSpinner size="large" />
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No projects found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visibility
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {projects.map((project) => (
                        <tr key={project.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                <Link 
                                  to={`/projects/${project.id}`}
                                  className="hover:text-blue-600"
                                >
                                  {project.title}
                                </Link>
                              </div>
                              {project.description && (
                                <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                                  {project.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {project.user?.firstName} {project.user?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {project.user?.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              project.status === 'published' 
                                ? 'bg-green-100 text-green-800'
                                : project.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              project.visibility === 'public' 
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {project.visibility}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              {project.status === 'published' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(project.id, 'archived')}
                                  loading={actionLoading[project.id]}
                                  disabled={actionLoading[project.id]}
                                >
                                  Archive
                                </Button>
                              ) : project.status === 'draft' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(project.id, 'published')}
                                  loading={actionLoading[project.id]}
                                  disabled={actionLoading[project.id]}
                                >
                                  Publish
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(project.id, 'published')}
                                  loading={actionLoading[project.id]}
                                  disabled={actionLoading[project.id]}
                                >
                                  Restore
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteProject(project.id)}
                                loading={actionLoading[project.id]}
                                disabled={actionLoading[project.id]}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{' '}
                          <span className="font-medium">
                            {(pagination.page - 1) * pagination.limit + 1}
                          </span>{' '}
                          to{' '}
                          <span className="font-medium">
                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                          </span>{' '}
                          of{' '}
                          <span className="font-medium">{pagination.total}</span>{' '}
                          results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <Button
                            variant="outline"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="rounded-r-none"
                          >
                            Previous
                          </Button>
                          
                          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                            .filter(page => 
                              page === 1 || 
                              page === pagination.totalPages || 
                              Math.abs(page - pagination.page) <= 2
                            )
                            .map((page, index, array) => (
                              <React.Fragment key={page}>
                                {index > 0 && array[index - 1] !== page - 1 && (
                                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    ...
                                  </span>
                                )}
                                <Button
                                  variant={pagination.page === page ? 'primary' : 'outline'}
                                  onClick={() => handlePageChange(page)}
                                  className="rounded-none"
                                >
                                  {page}
                                </Button>
                              </React.Fragment>
                            ))
                          }
                          
                          <Button
                            variant="outline"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="rounded-l-none"
                          >
                            Next
                          </Button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectManagement;