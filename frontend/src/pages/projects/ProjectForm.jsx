import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    visibility: 'private'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadProject();
    }
  }, [id, isEditing]);

  const loadProject = async () => {
    try {
      setInitialLoading(true);
      const response = await api.get(`/projects/${id}`);
      const project = response.data;
      
      // Check if user owns this project
      if (project.userId !== user?.id) {
        setError('You do not have permission to edit this project');
        return;
      }
      
      setFormData({
        title: project.title || '',
        description: project.description || '',
        status: project.status || 'draft',
        visibility: project.visibility || 'private'
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Project not found');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to edit this project');
      } else {
        setError('Failed to load project');
      }
      console.error('Load project error:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const projectData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim()
      };
      
      let response;
      if (isEditing) {
        response = await api.put(`/projects/${id}`, projectData);
      } else {
        response = await api.post('/projects', projectData);
      }
      
      const project = response.data;
      navigate(`/projects/${project.id}`, {
        state: { 
          message: isEditing ? 'Project updated successfully' : 'Project created successfully'
        }
      });
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(isEditing ? 'Failed to update project' : 'Failed to create project');
      }
      console.error('Project form error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error && isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Alert type="error">
            {error}
          </Alert>
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/projects')}
            >
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Project' : 'Create New Project'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {isEditing 
                ? 'Update your project details below'
                : 'Fill in the details to create your new project'
              }
            </p>
          </div>

          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {error && (
                <Alert type="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              
              <div>
                <Input
                  label="Project Title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  error={errors.title}
                  placeholder="Enter your project title"
                  helperText="Choose a descriptive title for your project"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your project..."
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.description ? 'border-red-300' : ''
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {formData.description.length}/1000 characters
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.status === 'draft' && 'Project is not visible to others'}
                    {formData.status === 'published' && 'Project is live and visible'}
                    {formData.status === 'archived' && 'Project is archived and read-only'}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.visibility === 'private' && 'Only you can see this project'}
                    {formData.visibility === 'public' && 'Anyone can view this project'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(isEditing ? `/projects/${id}` : '/projects')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  {isEditing ? 'Update Project' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectForm;