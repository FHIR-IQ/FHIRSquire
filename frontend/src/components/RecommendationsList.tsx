import { useState } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../api/client';
import ReactMarkdown from 'react-markdown';
import './RecommendationsList.css';

interface RecommendationsListProps {
  onBack: () => void;
  onNext: () => void;
}

export function RecommendationsList({ onBack, onNext }: RecommendationsListProps) {
  const { analysis, useCaseData, setSelectedRecommendation, setProfileSpecification, selectedRecommendation } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customRequirements, setCustomRequirements] = useState('');

  if (!analysis || !useCaseData) {
    return <div className="error">No analysis data available</div>;
  }

  const handleSelectRecommendation = (index: number) => {
    setSelectedRecommendation(analysis.recommendations[index]);
  };

  const handleProceed = async () => {
    if (!selectedRecommendation) {
      setError('Please select a recommendation');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Generate detailed specification
      const specification = await api.generateSpecification(
        useCaseData,
        selectedRecommendation,
        customRequirements || undefined
      );
      setProfileSpecification(specification);
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate specification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendations-container">
      <h2 className="form-title">AI-Powered Recommendations</h2>

      {/* Analysis Summary */}
      <div className="analysis-summary">
        <h3>Analysis Summary</h3>
        <div className="analysis-content">
          <ReactMarkdown>{analysis.analysis}</ReactMarkdown>
        </div>

        <div className="suggested-approach">
          <strong>Suggested Approach:</strong>{' '}
          <span className={`approach-badge approach-${analysis.suggestedApproach}`}>
            {analysis.suggestedApproach.replace('-', ' ').toUpperCase()}
          </span>
        </div>

        <div className="rationale">
          <strong>Rationale:</strong>
          <p>{analysis.rationale}</p>
        </div>

        {analysis.additionalConsiderations.length > 0 && (
          <div className="considerations">
            <strong>Additional Considerations:</strong>
            <ul>
              {analysis.additionalConsiderations.map((consideration, idx) => (
                <key={idx}>
                  {consideration}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommendations List */}
      <div className="recommendations-list">
        <h3>Profile Recommendations ({analysis.recommendations.length})</h3>
        <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
          Select the profile that best matches your use case:
        </p>

        {analysis.recommendations.map((rec, index) => (
          <div
            key={index}
            className={`recommendation-card ${selectedRecommendation === rec ? 'selected' : ''}`}
            onClick={() => handleSelectRecommendation(index)}
          >
            <div className="recommendation-header">
              <div>
                <h4>{rec.profileName}</h4>
                <p className="ig-name">{rec.implementationGuide}</p>
              </div>
              <div className="relevance-score">
                {rec.relevanceScore}%
              </div>
            </div>

            <div className="recommendation-body">
              <p className="reasoning">{rec.reasoning}</p>

              <div className="recommendation-details">
                <div className="detail-item">
                  <strong>Base Resource:</strong> {rec.baseResource}
                </div>
                <div className="detail-item">
                  <strong>Profile URL:</strong>{' '}
                  <a href={rec.profileUrl} target="_blank" rel="noopener noreferrer">
                    {rec.profileUrl}
                  </a>
                </div>
                <div className="detail-item">
                  <strong>IG URL:</strong>{' '}
                  <a href={rec.igUrl} target="_blank" rel="noopener noreferrer">
                    {rec.igUrl}
                  </a>
                </div>

                {rec.mustSupportElements.length > 0 && (
                  <div className="detail-item">
                    <strong>Must Support Elements:</strong>
                    <ul className="element-list">
                      {rec.mustSupportElements.slice(0, 5).map((element, idx) => (
                        <li key={idx}>{element}</li>
                      ))}
                      {rec.mustSupportElements.length > 5 && (
                        <li>... and {rec.mustSupportElements.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {rec.extensions.length > 0 && (
                  <div className="detail-item">
                    <strong>Extensions:</strong>
                    <ul className="element-list">
                      {rec.extensions.map((ext, idx) => (
                        <li key={idx}>{ext}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Requirements */}
      {selectedRecommendation && (
        <div className="custom-requirements">
          <h3>Custom Requirements (Optional)</h3>
          <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
            Add any additional requirements or constraints for your profile:
          </p>
          <textarea
            className="form-textarea"
            value={customRequirements}
            onChange={(e) => setCustomRequirements(e.target.value)}
            placeholder="Example: Must include extension for patient preferred language, require specific terminology binding for allergy codes..."
          />
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <div className="form-actions">
        <button onClick={onBack} className="btn btn-secondary">
          Back
        </button>
        <button
          onClick={handleProceed}
          className="btn btn-primary"
          disabled={!selectedRecommendation || loading}
        >
          {loading ? 'Generating Specification...' : 'Proceed to Profile Generation'}
        </button>
      </div>
    </div>
  );
}
