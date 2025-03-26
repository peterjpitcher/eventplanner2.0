'use client';

import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { csvImportService, CustomerImportValidation, ImportResult } from '@/services/csv-import-service';

interface CustomerImportProps {
  onImportComplete: () => void;
}

export function CustomerImport({ onImportComplete }: CustomerImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<CustomerImportValidation[] | null>(null);
  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check if it's a CSV file
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      
      setFile(selectedFile);
      setPreviewData(null);
      setImportResult(null);
    }
  };

  // Process the selected file for preview
  const handlePreview = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }
    
    setIsLoading(true);
    setPreviewData(null);
    setImportResult(null);
    
    try {
      // Process the CSV file
      const result = await csvImportService.processCSVFile(file);
      
      setPreviewData(result.validatedData);
      setValidCount(result.validCount);
      setInvalidCount(result.invalidCount);
      
      if (result.invalidCount > 0) {
        toast.warning(`Found ${result.invalidCount} invalid entries. Please review before importing.`);
      } else if (result.validCount === 0) {
        toast.error('No valid entries found to import');
      } else {
        toast.success(`Found ${result.validCount} valid entries ready to import`);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Import validated data
  const handleImport = async () => {
    if (!previewData || validCount === 0) {
      toast.error('No valid data to import');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Perform the batch import
      const result = await csvImportService.batchInsertCustomers(previewData);
      setImportResult(result);
      
      if (result.successfulImports > 0) {
        toast.success(`Successfully imported ${result.successfulImports} customers`);
        onImportComplete();
      }
      
      if (result.failedImports > 0) {
        toast.error(`Failed to import ${result.failedImports} customers`);
      }
    } catch (error) {
      console.error('Error importing customers:', error);
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setFile(null);
    setPreviewData(null);
    setImportResult(null);
    setValidCount(0);
    setInvalidCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render preview table
  const renderPreviewTable = () => {
    if (!previewData || previewData.length === 0) return null;
    
    // Show just the first 10 rows for preview
    const previewRows = previewData.slice(0, 10);
    
    return (
      <div className="mt-4 overflow-x-auto">
        <h3 className="text-lg font-medium mb-2">Preview (first 10 entries)</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {previewRows.map((item, index) => (
              <tr key={index} className={item.isValid ? '' : 'bg-red-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.rowNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.customer.first_name}
                  {item.errors.first_name && <p className="text-red-500 text-xs">{item.errors.first_name}</p>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.customer.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.customer.mobile_number}
                  {item.errors.mobile_number && <p className="text-red-500 text-xs">{item.errors.mobile_number}</p>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.customer.notes}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {item.isValid ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Valid
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Invalid
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {previewData.length > 10 && (
          <p className="mt-2 text-sm text-gray-500">
            ... and {previewData.length - 10} more entries
          </p>
        )}
      </div>
    );
  };

  // Render error details
  const renderErrorDetails = () => {
    if (!previewData || invalidCount === 0) return null;
    
    const invalidEntries = previewData.filter(item => !item.isValid);
    
    return (
      <div className="mt-6">
        <div className="flex items-center mb-2">
          <h3 className="text-lg font-medium">Error Details</h3>
          <button
            type="button"
            onClick={() => setShowErrorDetails(!showErrorDetails)}
            className="ml-2 text-sm text-blue-600 hover:text-blue-800"
          >
            {showErrorDetails ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {showErrorDetails && (
          <div className="bg-red-50 p-4 rounded-md">
            <h4 className="text-md font-medium mb-2">The following {invalidEntries.length} entries have errors:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {invalidEntries.map((item, index) => (
                <li key={index} className="text-sm">
                  Row {item.rowNumber}: {Object.values(item.errors).join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Render import results
  const renderImportResults = () => {
    if (!importResult) return null;
    
    return (
      <div className="mt-6 bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium mb-2">Import Results</h3>
        <ul className="space-y-1">
          <li className="text-sm">Total rows processed: {importResult.totalRows}</li>
          <li className="text-sm text-green-600">Successfully imported: {importResult.successfulImports}</li>
          {importResult.failedImports > 0 && (
            <li className="text-sm text-red-600">Failed to import: {importResult.failedImports}</li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 hidden md:block">
      <h2 className="text-xl font-semibold mb-4">Import Customers</h2>
      
      <div className="space-y-4">
        {/* File selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-900 
              file:mr-4 file:py-2 file:px-4 file:rounded-md
              file:border-0 file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            CSV file should have the following columns: first_name, last_name, mobile_number, notes
          </p>
        </div>
        
        {/* Selected file info */}
        {file && (
          <div className="text-sm">
            <span className="font-medium">Selected file:</span> {file.name} ({Math.round(file.size / 1024)} KB)
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handlePreview}
            disabled={!file || isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent 
              text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 
              hover:bg-blue-700 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isLoading ? 'Processing...' : 'Preview Data'}
          </button>
          
          <button
            type="button"
            onClick={handleImport}
            disabled={!previewData || validCount === 0 || isLoading || !!importResult}
            className="inline-flex items-center px-4 py-2 border border-transparent 
              text-sm font-medium rounded-md shadow-sm text-white bg-green-600 
              hover:bg-green-700 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
          >
            {isLoading ? 'Importing...' : 'Import Customers'}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 border border-gray-300 
              text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white 
              hover:bg-gray-50 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-blue-500"
          >
            Reset
          </button>
        </div>
        
        {/* Summary */}
        {previewData && (
          <div className="flex space-x-4">
            <div className="bg-gray-50 px-4 py-2 rounded-md">
              <span className="text-sm text-gray-500">Total:</span>
              <span className="ml-2 font-medium">{previewData.length}</span>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-md">
              <span className="text-sm text-green-600">Valid:</span>
              <span className="ml-2 font-medium">{validCount}</span>
            </div>
            <div className="bg-red-50 px-4 py-2 rounded-md">
              <span className="text-sm text-red-600">Invalid:</span>
              <span className="ml-2 font-medium">{invalidCount}</span>
            </div>
          </div>
        )}
        
        {/* Render preview table */}
        {renderPreviewTable()}
        
        {/* Render error details */}
        {renderErrorDetails()}
        
        {/* Render import results */}
        {renderImportResults()}
      </div>
    </div>
  );
} 