'use client';

import React, { useState, useRef } from 'react';
import { parseCSV, readCSVFile, getCSVTemplate } from '@/lib/csv-utils';
import { importCustomers, CustomerImportResult } from '@/utils/customer-service';
import { CustomerFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CustomerImportProps {
  onImportComplete?: () => void;
}

export function CustomerImport({ onImportComplete }: CustomerImportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CustomerFormData[]>([]);
  const [parseErrors, setParseErrors] = useState<{ row: number; error: string }[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importResult, setImportResult] = useState<CustomerImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type (accept any text file or CSV)
    if (!selectedFile.name.endsWith('.csv') && !selectedFile.type.includes('text')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setImportResult(null);
    setShowPreview(false);

    try {
      // Read and parse the CSV file
      const csvContent = await readCSVFile(selectedFile);
      const result = parseCSV(csvContent);
      
      setPreview(result.data);
      setParseErrors(result.errors);
      
      if (result.errors.length > 0) {
        toast.error(`File has ${result.errors.length} error(s). Please fix before importing.`);
      } else if (result.data.length === 0) {
        toast.error('No valid customers found in the file');
      } else {
        setShowPreview(true);
        toast.success(`Found ${result.data.length} customer(s) to import`);
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error('Failed to parse CSV file');
    }
  };

  // Reset the import state
  const handleReset = () => {
    setFile(null);
    setPreview([]);
    setParseErrors([]);
    setShowPreview(false);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download a sample template
  const handleDownloadTemplate = () => {
    const template = getCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import the customers
  const handleImport = async () => {
    if (!preview.length) {
      toast.error('No customers to import');
      return;
    }

    setIsLoading(true);
    try {
      const result = await importCustomers(preview);
      
      if (result.error) {
        toast.error(`Import failed: ${result.error.message}`);
      } else if (result.data) {
        setImportResult(result.data);
        
        if (result.data.successful > 0) {
          toast.success(`Successfully imported ${result.data.successful} customer(s)`);
          if (onImportComplete) {
            onImportComplete();
          }
        }
        
        if (result.data.failed > 0) {
          toast.error(`Failed to import ${result.data.failed} customer(s)`);
        }
      }
    } catch (error) {
      console.error('Error importing customers:', error);
      toast.error('An unexpected error occurred during import');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Import Customers</h2>
      
      <div className="space-y-6">
        {/* File upload section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload CSV File
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".csv,text/csv"
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              ref={fileInputRef}
            />
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              type="button"
              className="text-xs h-9"
            >
              Download Template
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            File must be a CSV with headers: first_name, last_name, mobile_number, notes
          </p>
        </div>
        
        {/* File parse errors */}
        {parseErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              {parseErrors.length} error(s) found in file:
            </h3>
            <ul className="list-disc pl-5 text-xs text-red-700 space-y-1">
              {parseErrors.slice(0, 5).map((error, index) => (
                <li key={index}>
                  Row {error.row}: {error.error}
                </li>
              ))}
              {parseErrors.length > 5 && (
                <li>...and {parseErrors.length - 5} more errors</li>
              )}
            </ul>
          </div>
        )}
        
        {/* Preview section */}
        {showPreview && preview.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Preview ({preview.length} customer{preview.length !== 1 ? 's' : ''})
            </h3>
            <div className="overflow-x-auto border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      First Name
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Name
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.slice(0, 5).map((customer, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{customer.first_name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{customer.last_name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{customer.mobile_number}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 truncate max-w-xs">{customer.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 5 && (
                <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
                  ...and {preview.length - 5} more customer{preview.length - 5 !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Import result */}
        {importResult && (
          <div className={`border rounded-md p-4 ${
            importResult.successful > 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <h3 className="text-sm font-medium mb-2">Import Results</h3>
            <ul className="text-sm space-y-1">
              <li>Successfully imported: {importResult.successful}</li>
              <li>Failed to import: {importResult.failed}</li>
            </ul>
            {(importResult.errors.length > 0 || importResult.validationErrors.length > 0) && (
              <div className="mt-2 text-xs text-red-700">
                <p>Errors:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {importResult.validationErrors.slice(0, 3).map((error, index) => (
                    <li key={`val-${index}`}>
                      Row {error.row + 1}: {error.error}
                    </li>
                  ))}
                  {importResult.errors.slice(0, 3).map((error, index) => (
                    <li key={`err-${index}`}>
                      {error.row >= 0 ? `Row ${error.row + 1}: ` : ''}{error.error}
                    </li>
                  ))}
                  {(importResult.errors.length + importResult.validationErrors.length) > 6 && (
                    <li>...and more errors</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading || (!file && !preview.length && !importResult)}
          >
            Clear
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isLoading || !preview.length || parseErrors.length > 0}
          >
            {isLoading ? 'Importing...' : 'Import Customers'}
          </Button>
        </div>
      </div>
    </div>
  );
} 