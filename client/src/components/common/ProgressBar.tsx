import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const bgColor = progress === 100 ? 'bg-emerald-500' : 'bg-[rgb(var(--accent-primary-rgb))]';

  return (
    <div className="w-full bg-[rgba(var(--bg-tertiary-rgb),0.5)] rounded-full h-2">
      <div
        className={`${bgColor} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;