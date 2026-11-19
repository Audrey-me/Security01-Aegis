
import React, { useState } from 'react';
import {
  FormStep,
  BaseFormValues,
  PersonalInfoValues
} from './SignUpSchemas';
import StepIndicator from './StepIndicator';
import SignUpStep1 from './SignUpStep1';
import SignUpStep2 from './SignUpStep2';
import { api, ApiError } from '@/lib/api';

interface SignUpFormProps {
  onSignedIn: () => void;
}

// Define a more explicit type for the form data to match all possible values
interface FormData {
  email: string;
  password: string;
  dob: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
}

const SignUpForm = ({ onSignedIn }: SignUpFormProps) => {
  const [step, setStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    dob: '',
    gender: 'prefer-not-to-say',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStep1Submit = (data: BaseFormValues) => {
    setFormData({ ...formData, ...data });
    setStep(2);
  };

  const handleStep2Submit = async (data: PersonalInfoValues) => {
    const completeFormData = {
      ...formData,
      ...data
    };
    
    setIsSubmitting(true);
    setError(null);

    console.log('Sign Up Complete:', completeFormData);

    try {
      await api.register(completeFormData);
      onSignedIn();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign up failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <StepIndicator currentStep={step} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {step === 1 && (
        <SignUpStep1 
          initialData={{ email: formData.email, password: formData.password }}
          onNext={handleStep1Submit}
        />
      )}
      
      {step === 2 && (
        <SignUpStep2 
          initialData={{
            dob: formData.dob,
            gender: formData.gender
          }}
          onSubmit={handleStep2Submit}
          onBack={() => setStep(1)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default SignUpForm;
