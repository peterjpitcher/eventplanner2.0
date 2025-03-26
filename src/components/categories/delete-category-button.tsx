'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteCategoryButtonProps {
  categoryId: string;
  onDelete: (id: string) => Promise<void>;
}

export function DeleteCategoryButton({ categoryId, onDelete }: DeleteCategoryButtonProps) {
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await onDelete(categoryId);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
} 