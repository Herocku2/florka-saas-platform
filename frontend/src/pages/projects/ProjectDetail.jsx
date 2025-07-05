import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Project not found');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this project');
      } else {
        setError('Failed to load project');
      }
      console.error('Project detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await api.delete(`/projects/${id}`);
      navigate('/projects', { 
        state: { message: 'Project deleted successfully' }
      });
    } catch (err) {
      setError('Failed to delete project');
      console.error('Delete project error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const isOwner = project && user && project.userId === user.id;
  const canEdit = isOwner;
  const canDelete = isOwner;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Alert type="error">
            {error}
          </Alert>
          <div className="mt-6 text-center">
            <Link to="/projects">
              <Button variant="outline">
                Back to Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
          <p className="mt-2 text-gray-600">The project you're looking for doesn't exist.</p>
          <div className="mt-6">
            <Link to="/projects">
              <Button variant="outline">
                Back to Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <Link to="/projects" className="text-blue-600 hover:text-blue-500">
              ← Back to Projects
            </Link>
            {canEdit && (
              <div className="flex space-x-3">
                <Link to={`/projects/${id}/edit`}>
                  <Button variant="outline">
                    Edit Project
                  </Button>
                </Link>
                {canDelete && (
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    loading={deleteLoading}
                    disabled={deleteLoading}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Project Header */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="h-16 w-16 rounded-lg bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {project.title.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {project.title}
                  </h1>
                  <p className="mt-2 text-gray-600">
                    by {project.user?.firstName || project.user?.email || 'Anonymous'}
                  </p>
                  <div className="mt-3 flex items-center space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      project.status === 'published' 
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      project.visibility === 'public' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.visibility}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Content */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            {project.description ? (
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No description provided.
              </p>
            )}
          </div>

          {/* Project Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(project.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(project.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">
                  {project.status}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Visibility</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">
                  {project.visibility}
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions for non-owners */}
          {!isOwner && isAuthenticated && (
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="flex space-x-4">
                <Button variant="outline">
                  Follow Project
                </Button>
                <Button variant="outline">
                  Report Issue
                </Button>
              </div>
            </div>
          )}

          {/* Call to action for non-authenticated users */}
          {!isAuthenticated && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Want to create your own project?
              </h3>
              <p className="text-blue-700 mb-4">
                Join our community and start building amazing projects today.
              </p>
              <div className="flex space-x-4">
                <Link to="/register">
                  <Button>
                    Sign Up
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;