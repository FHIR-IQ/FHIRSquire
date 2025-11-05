import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../api/client';
import ReactMarkdown from 'react-markdown';
import './ProfileGenerator.css';

interface ProfileGeneratorProps {
  onBack: () => void;
  onNext: () => void;
}

export function ProfileGenerator({ onBack, onNext }: ProfileGeneratorProps) {
  const { profileSpecification, selectedRecommendation, useCaseData, setGeneratedProfile, generatedProfile } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileJson, setProfileJson] = useState('');
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    if (generatedProfile) {
      setProfileJson(JSON.stringify(generatedProfile, null, 2));
    }
  }, [generatedProfile]);

  if (!profileSpecification || !selectedRecommendation || !useCaseData) {
    return <div className="error">Missing required data</div>;
  }

  const handleGenerateProfile = async () => {
    setError(null);
    setLoading(true);

    try {
      // Parse the specification to extract profile generation parameters
      const profileName = selectedRecommendation.profileName + ' (Custom)';
      const baseResource = selectedRecommendation.baseResource;

      const profileRequest = {
        profileName,
        baseResourceType: baseResource,
        baseProfile: selectedRecommendation.profileUrl,
        description: `Custom profile for: ${useCaseData.businessUseCase}`,
        fhirVersion: useCaseData.fhirVersion,
        publisher: useCaseData.organizationContext || 'Unknown Organization',
        mustSupportElements: selectedRecommendation.mustSupportElements,
        extensions: selectedRecommendation.extensions.map(ext => ({
          url: ext,
          description: ext
        }))
      };

      const profile = await api.generateProfile(profileRequest);
      setGeneratedProfile(profile);
      setProfileJson(JSON.stringify(profile, null, 2));
      setShowJson(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedProfile) return;

    const blob = new Blob([JSON.stringify(generatedProfile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedProfile.id || 'profile'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!generatedProfile) return;

    try {
      const filename = `${generatedProfile.id || 'profile'}.json`;
      await api.saveProfile(generatedProfile, filename);
      alert('Profile saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    }
  };

  return (
    <div className="profile-generator-container">
      <h2 className="form-title">Profile Specification & Generation</h2>

      {/* Specification */}
      <div className="specification-section">
        <h3>Profile Specification</h3>
        <div className="specification-content">
          <ReactMarkdown>{profileSpecification}</ReactMarkdown>
        </div>
      </div>

      {/* Generate Button */}
      {!generatedProfile && (
        <div className="generate-section">
          <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
            Click below to generate a FHIR StructureDefinition based on the specification above:
          </p>
          <button onClick={handleGenerateProfile} className="btn btn-primary" disabled={loading}>
            {loading ? 'Generating Profile...' : 'Generate FHIR Profile'}
          </button>
        </div>
      )}

      {/* Generated Profile */}
      {generatedProfile && (
        <div className="generated-profile-section">
          <div className="profile-header">
            <h3>Generated FHIR Profile</h3>
            <div className="profile-actions">
              <button onClick={() => setShowJson(!showJson)} className="btn btn-secondary">
                {showJson ? 'Hide JSON' : 'Show JSON'}
              </button>
              <button onClick={handleDownload} className="btn btn-secondary">
                Download JSON
              </button>
              <button onClick={handleSave} className="btn btn-secondary">
                Save Locally
              </button>
            </div>
          </div>

          <div className="profile-summary">
            <div className="summary-item">
              <strong>ID:</strong> {generatedProfile.id}
            </div>
            <div className="summary-item">
              <strong>Name:</strong> {generatedProfile.name}
            </div>
            <div className="summary-item">
              <strong>Title:</strong> {generatedProfile.title}
            </div>
            <div className="summary-item">
              <strong>Status:</strong> <span className="status-badge">{generatedProfile.status}</span>
            </div>
            <div className="summary-item">
              <strong>URL:</strong> {generatedProfile.url}
            </div>
            <div className="summary-item">
              <strong>Base:</strong> {generatedProfile.baseDefinition}
            </div>
          </div>

          {showJson && (
            <div className="json-viewer">
              <pre><code>{profileJson}</code></pre>
            </div>
          )}
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <div className="form-actions">
        <button onClick={onBack} className="btn btn-secondary">
          Back
        </button>
        <button
          onClick={onNext}
          className="btn btn-primary"
          disabled={!generatedProfile}
        >
          Continue to Upload
        </button>
      </div>
    </div>
  );
}
