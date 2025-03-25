import React from 'react';

interface FormGroupProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  htmlFor,
  children,
  required = false,
  error,
}) => {
  return (
    <div className="form-group">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormGroup; 