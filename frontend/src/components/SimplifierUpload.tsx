import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../api/client';
import './SimplifierUpload.css';

interface SimplifierUploadProps {
  onBack: () => void;
  onComplete: () => void;
}

export function SimplifierUpload({ onBack, onComplete }: SimplifierUploadProps) {
  const { generatedProfile } = useStore();
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectScope, setNewProjectScope] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');

  useEffect(() => {
    checkSimplifierStatus();
  }, []);

  const checkSimplifierStatus = async () => {
    try {
      const status = await api.getSimplifierStatus();
      setConfigured(status.configured);

      if (status.configured) {
        loadProjects();
      }
    } catch (err) {
      console.error('Error checking Simplifier status:', err);
    }
  };

  const loadProjects = async () => {
    try {
      const projectList = await api.getSimplifierProjects();
      setProjects(projectList);
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName || !newProjectScope) {
      setError('Project name and scope are required');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const project = await api.createSimplifierProject(
        newProjectName,
        newProjectScope,
        newProjectDescription
      );

      setProjects([...projects, project]);
      setSelectedProject(project.scope);
      setShowNewProjectForm(false);
      setNewProjectName('');
      setNewProjectScope('');
      setNewProjectDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!generatedProfile || !selectedProject) {
      setError('Please select a project');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const filename = `${generatedProfile.id}.json`;
      const result = await api.uploadToSimplifier(selectedProject, generatedProfile, filename);

      if (result.success) {
        setUploadSuccess(true);
        setUploadUrl(result.url || '');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!generatedProfile) {
    return <div className="error">No profile to upload</div>;
  }

  return (
    <div className="simplifier-upload-container">
      <h2 className="form-title">Upload to Simplifier.net</h2>

      {!configured ? (
        <div className="not-configured">
          <div className="info-box">
            <h3>Simplifier.net Integration Not Configured</h3>
            <p>
              To upload profiles to Simplifier.net, you need to configure your API key.
            </p>
            <ol>
              <li>Create an account at <a href="https://simplifier.net" target="_blank" rel="noopener noreferrer">simplifier.net</a></li>
              <li>Generate an API key from your account settings</li>
              <li>Add the API key to your backend <code>.env</code> file as <code>SIMPLIFIER_API_KEY</code></li>
              <li>Restart the backend server</li>
            </ol>
            <p style={{ marginTop: '1rem' }}>
              You can skip this step and download the profile locally instead.
            </p>
          </div>

          <div className="form-actions">
            <button onClick={onBack} className="btn btn-secondary">
              Back
            </button>
            <button onClick={handleSkip} className="btn btn-primary">
              Skip & Complete
            </button>
          </div>
        </div>
      ) : uploadSuccess ? (
        <div className="upload-success">
          <div className="success-box">
            <div className="success-icon">✓</div>
            <h3>Profile Uploaded Successfully!</h3>
            <p>
              Your FHIR profile has been uploaded to Simplifier.net.
            </p>
            {uploadUrl && (
              <p>
                <a href={uploadUrl} target="_blank" rel="noopener noreferrer" className="profile-link">
                  View Profile on Simplifier.net →
                </a>
              </p>
            )}

            <div className="next-steps">
              <h4>Next Steps:</h4>
              <ul>
                <li>Review and refine your profile on Simplifier.net</li>
                <li>Add examples and additional documentation</li>
                <li>Create an Implementation Guide for your organization</li>
                <li>Share with your development team</li>
              </ul>
            </div>
          </div>

          <div className="form-actions">
            <button onClick={onComplete} className="btn btn-primary">
              Complete & Start New
            </button>
          </div>
        </div>
      ) : (
        <div className="upload-form">
          <div className="profile-info">
            <h3>Profile to Upload</h3>
            <div className="info-grid">
              <div><strong>Name:</strong> {generatedProfile.name}</div>
              <div><strong>ID:</strong> {generatedProfile.id}</div>
              <div><strong>Version:</strong> {generatedProfile.version}</div>
              <div><strong>Status:</strong> {generatedProfile.status}</div>
            </div>
          </div>

          <div className="project-selection">
            <h3>Select Simplifier Project</h3>

            {!showNewProjectForm ? (
              <>
                <div className="form-group">
                  <label className="form-label">Project</label>
                  <select
                    className="form-select"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                  >
                    <option value="">-- Select a project --</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.scope}>
                        {project.name} ({project.scope})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowNewProjectForm(true)}
                  className="btn btn-secondary"
                  style={{ marginTop: '1rem' }}
                >
                  + Create New Project
                </button>
              </>
            ) : (
              <div className="new-project-form">
                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="My FHIR Implementation Guide"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Project Scope * (URL-friendly)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newProjectScope}
                    onChange={(e) => setNewProjectScope(e.target.value)}
                    placeholder="my-org.fhir-ig"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Description of your Implementation Guide..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleCreateProject}
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Project'}
                  </button>
                  <button
                    onClick={() => setShowNewProjectForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          <div className="form-actions">
            <button onClick={onBack} className="btn btn-secondary">
              Back
            </button>
            <button onClick={handleSkip} className="btn btn-secondary">
              Skip
            </button>
            <button
              onClick={handleUpload}
              className="btn btn-primary"
              disabled={!selectedProject || loading}
            >
              {loading ? 'Uploading...' : 'Upload to Simplifier'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
