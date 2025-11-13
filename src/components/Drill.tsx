import { useState, useEffect } from 'react';

export const BoxBreathing = () => {
  const [step, setStep] = useState(0);
  const steps = ['Inhale 4', 'Hold 7', 'Exhale 8', 'Hold 4'];
  
  useEffect(() => {
    const timer = setInterval(() => setStep(s => (s + 1) % 4), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6 bg-blue-50 rounded-xl text-center">
      <p className="text-3xl font-bold text-blue-700">{steps[step]}</p>
      <p className="text-sm text-blue-600 mt-2">Follow the rhythm</p>
    </div>
  );
};