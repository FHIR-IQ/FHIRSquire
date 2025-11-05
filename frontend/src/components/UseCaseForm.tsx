import { useState } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../api/client';
import type { UseCaseData } from '../store/useStore';

interface UseCaseFormProps {
  onNext: () => void;
}

export function UseCaseForm({ onNext }: UseCaseFormProps) {
  const { setUseCaseData, setAnalysis } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UseCaseData>({
    businessUseCase: '',
    reasonForProfile: '',
    specificUseCase: '',
    dataRole: 'consumer',
    fhirVersion: 'R4',
    organizationContext: '',
  });

  const handleLoadDemo = () => {
    setFormData({
      businessUseCase: 'We are building a platform to unify and provide a single source of truth for transition of care and encounters that occurred for a single episode to our partners that are healthcare providers and vendors using our data for insights and better outcomes.',
      reasonForProfile: 'We looked at US Core profiles and don\'t see something we can use to show this information in a unified way that captures the complete episode of care with all transitions and encounters.',
      specificUseCase: 'Healthcare providers, vendors, and other healthcare entities will review the effectiveness of care and details about encounters that resulted in transitions (ADT events, transfers, discharges, etc.). They need to see the complete picture of a patient\'s journey through different care settings within a single episode.',
      dataRole: 'intermediary',
      fhirVersion: 'R4',
      organizationContext: 'We are in the United States and are a data aggregator pulling from Care Quality Network and other sources. We aggregate data from multiple EHRs, HIEs, and care coordination systems to provide a comprehensive view of patient episodes.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Save use case data
      setUseCaseData(formData);

      // Get recommendations from Claude
      const analysis = await api.analyzeUseCase(formData);
      setAnalysis(analysis);

      // Move to next step
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze use case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Define Your Use Case</h2>
      <p className="form-description">
        Help us understand your healthcare interoperability needs. Provide detailed information
        about your use case to receive AI-powered recommendations for FHIR profiles.
      </p>

      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <button
          type="button"
          onClick={handleLoadDemo}
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem' }}
        >
          📋 Try Sample Demo - Episode of Care Transitions
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Business Use Case *
            <span style={{ fontSize: '0.875rem', fontWeight: 'normal', marginLeft: '0.5rem' }}>
              (What business problem are you solving?)
            </span>
          </label>
          <textarea
            className="form-textarea"
            value={formData.businessUseCase}
            onChange={(e) => setFormData({ ...formData, businessUseCase: e.target.value })}
            placeholder="Example: We need to exchange patient allergy information between our EHR system and a pharmacy management system to reduce medication errors..."
            required
            minLength={10}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Why Do You Need a FHIR Profile? *
          </label>
          <textarea
            className="form-textarea"
            value={formData.reasonForProfile}
            onChange={(e) => setFormData({ ...formData, reasonForProfile: e.target.value })}
            placeholder="Example: Existing profiles don't capture the specific allergy severity classifications used in our healthcare network..."
            required
            minLength={10}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Specific Use Case Details *
            <span style={{ fontSize: '0.875rem', fontWeight: 'normal', marginLeft: '0.5rem' }}>
              (Who will use this? How will it be used?)
            </span>
          </label>
          <textarea
            className="form-textarea"
            value={formData.specificUseCase}
            onChange={(e) => setFormData({ ...formData, specificUseCase: e.target.value })}
            placeholder="Example: Clinicians will query allergy data when prescribing medications. Pharmacists will review allergies before dispensing. The system must support real-time queries..."
            required
            minLength={10}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Data Role *</label>
          <select
            className="form-select"
            value={formData.dataRole}
            onChange={(e) => setFormData({ ...formData, dataRole: e.target.value as UseCaseData['dataRole'] })}
            required
          >
            <option value="consumer">Consumer (Reading/Querying Data)</option>
            <option value="producer">Producer (Creating/Sharing Data)</option>
            <option value="intermediary">Intermediary (Both Reading and Writing)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">FHIR Version *</label>
          <select
            className="form-select"
            value={formData.fhirVersion}
            onChange={(e) => setFormData({ ...formData, fhirVersion: e.target.value as UseCaseData['fhirVersion'] })}
            required
          >
            <option value="R4">R4 (4.0.1)</option>
            <option value="R5">R5 (5.0.0)</option>
            <option value="R6">R6 (Latest Draft)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Organization Context
            <span style={{ fontSize: '0.875rem', fontWeight: 'normal', marginLeft: '0.5rem' }}>
              (Optional: Country, healthcare setting, regulatory requirements)
            </span>
          </label>
          <textarea
            className="form-textarea"
            value={formData.organizationContext}
            onChange={(e) => setFormData({ ...formData, organizationContext: e.target.value })}
            placeholder="Example: US-based hospital network, must comply with ONC 2015 Edition requirements..."
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Analyzing with AI...' : 'Get Recommendations'}
          </button>
        </div>
      </form>
    </div>
  );
}
