'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateTemplatePreview, getAvailablePlaceholders } from '@/lib/templates';

interface TemplatePreviewProps {
  templateContent: string;
}

export default function TemplatePreview({ templateContent }: TemplatePreviewProps) {
  const previewText = generateTemplatePreview(templateContent);
  const placeholders = getAvailablePlaceholders();
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Message Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-md border border-gray-300 max-w-sm">
            <div className="bg-blue-100 p-3 rounded-lg inline-block relative">
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {previewText}
              </div>
              <div className="absolute h-3 w-3 bg-blue-100 rotate-45 -bottom-1 left-5"></div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Placeholders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {placeholders.map((placeholder) => (
              <div key={placeholder.name} className="flex items-start">
                <div className="bg-gray-200 px-2 py-1 rounded text-sm font-mono">
                  {`{{${placeholder.name}}}`}
                </div>
                <div className="ml-3 text-sm text-gray-600">
                  {placeholder.description}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 