import React from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
}) => {
  const variantClasses = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200',
  };

  return (
    <div
      className={`${variantClasses[variant]} border p-4 rounded-md`}
      role="alert"
    >
      {children}
    </div>
  );
};

export default Alert; 