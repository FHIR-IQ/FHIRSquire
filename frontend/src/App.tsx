import { useState } from 'react'
import { UseCaseForm } from './components/UseCaseForm'
import { RecommendationsList } from './components/RecommendationsList'
import { ProfileGenerator } from './components/ProfileGenerator'
import { SimplifierUpload } from './components/SimplifierUpload'
import { useStore } from './store/useStore'
import './App.css'

type Step = 'use-case' | 'recommendations' | 'profile-generation' | 'upload';

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('use-case');
  const { useCaseData, analysis, generatedProfile } = useStore();

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏥 FHIRSquire</h1>
        <p>FHIR Profile Builder & Research Tool</p>
      </header>

      <div className="app-container">
        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${currentStep === 'use-case' ? 'active' : ''} ${useCaseData ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Use Case</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep === 'recommendations' ? 'active' : ''} ${analysis ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Recommendations</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep === 'profile-generation' ? 'active' : ''} ${generatedProfile ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Profile</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep === 'upload' ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Upload</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {currentStep === 'use-case' && (
            <UseCaseForm onNext={() => setCurrentStep('recommendations')} />
          )}

          {currentStep === 'recommendations' && (
            <RecommendationsList
              onBack={() => setCurrentStep('use-case')}
              onNext={() => setCurrentStep('profile-generation')}
            />
          )}

          {currentStep === 'profile-generation' && (
            <ProfileGenerator
              onBack={() => setCurrentStep('recommendations')}
              onNext={() => setCurrentStep('upload')}
            />
          )}

          {currentStep === 'upload' && (
            <SimplifierUpload
              onBack={() => setCurrentStep('profile-generation')}
              onComplete={() => {
                alert('Process complete! You can start a new use case.');
                setCurrentStep('use-case');
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
