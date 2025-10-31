import React from 'react';

const TutorialIframe = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        How to register and apply to a police training institution
      </h3>
      <div className="relative overflow-hidden rounded-lg shadow-lg bg-gray-50">
        <iframe
          src="https://www.youtube.com/embed/K14n4wPr5Gs"
          width="100%"
          height="100%"
          allow="fullscreen"
          className="w-full aspect-video min-h-[480px] border-0"
          title="Registration Tutorial Guide"
          loading="lazy"
        />
      </div>
      <p className="mt-2 text-sm text-gray-500 text-center">
        Interactive guide for registration process
      </p>
    </div>
  );
};

export default TutorialIframe;