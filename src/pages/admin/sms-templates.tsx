'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllTemplates, getTemplateDetails } from '@/lib/templates';
import TemplateEditor from '@/components/sms/TemplateEditor';
import TemplatePreview from '@/components/sms/TemplatePreview';
import TestMessageForm from '@/components/sms/TestMessageForm';

export default function SMSTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('editor');
  
  useEffect(() => {
    loadTemplates();
  }, []);
  
  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const templatesData = await getAllTemplates();
      setTemplates(templatesData);
      
      // Select the first template by default if available
      if (templatesData.length > 0 && !activeTemplate) {
        loadTemplateDetails(templatesData[0].id);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadTemplateDetails = async (templateId: string) => {
    try {
      const templateData = await getTemplateDetails(templateId);
      setActiveTemplate(templateData);
    } catch (error) {
      console.error('Error loading template details:', error);
    }
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">SMS Templates</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Template List (Sidebar) */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Templates</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {templates.map((template) => (
                      <li key={template.id}>
                        <button
                          className={`w-full text-left px-3 py-2 rounded text-sm ${
                            activeTemplate?.id === template.id 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => loadTemplateDetails(template.id)}
                        >
                          {template.name.replace(/_/g, ' ')}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Template Editor/Preview */}
          <div className="md:col-span-3">
            {activeTemplate ? (
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {activeTemplate.name.replace(/_/g, ' ')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="editor">Edit Template</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="test">Test Send</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="editor">
                      <TemplateEditor
                        templateId={activeTemplate.id}
                        initialContent={activeTemplate.content}
                        initialDescription={activeTemplate.description}
                        onUpdate={loadTemplates}
                      />
                    </TabsContent>
                    
                    <TabsContent value="preview">
                      <TemplatePreview templateContent={activeTemplate.content} />
                    </TabsContent>
                    
                    <TabsContent value="test">
                      <TestMessageForm
                        templateId={activeTemplate.id}
                        templateName={activeTemplate.name}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  {isLoading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                  ) : (
                    <p>Select a template to edit</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 