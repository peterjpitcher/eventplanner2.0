'use client';

import React, { useState } from 'react';
import { updateTemplate } from '@/lib/templates';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface TemplateEditorProps {
  templateId: string;
  initialContent: string;
  initialDescription?: string;
  onUpdate?: () => void;
}

export default function TemplateEditor({
  templateId,
  initialContent,
  initialDescription = '',
  onUpdate
}: TemplateEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [description, setDescription] = useState(initialDescription);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Template content cannot be empty');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await updateTemplate(templateId, content, description);
      
      if (result.success) {
        toast.success('Template updated successfully');
        if (onUpdate) onUpdate();
      } else {
        toast.error('Failed to update template');
        console.error('Update error:', result.error);
      }
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('An error occurred while updating the template');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Template description"
          className="w-full"
        />
      </div>
      
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Template Content
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter template content with {{placeholders}}"
          className="w-full min-h-[150px] font-mono"
        />
        <p className="text-sm text-gray-500 mt-1">
          Use {'{{'}{'{'}placeholders{'}'}{'}}'} for variable content. Max length: 160 characters for standard SMS.
        </p>
        <div className="text-right text-sm text-gray-500 mt-1">
          {content.length} / 160 characters
          {content.length > 160 && (
            <span className="text-amber-600 ml-2">
              Message may be split into multiple parts
            </span>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            setContent(initialContent);
            setDescription(initialDescription);
          }}
          disabled={isLoading}
        >
          Reset
        </Button>
        <Button 
          type="button" 
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Template'}
        </Button>
      </div>
    </div>
  );
} 