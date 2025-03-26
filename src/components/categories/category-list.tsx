'use client';

import React from 'react';
import Link from 'next/link';
import { EventCategory } from '@/services/event-category-service';
import { Button } from '../ui/button';
import { DeleteCategoryButton } from './delete-category-button';
import { eventCategoryService } from '@/services/event-category-service';
import { toast } from 'sonner';

interface CategoryListProps {
  categories: EventCategory[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const handleDelete = async (id: string) => {
    try {
      const { error } = await eventCategoryService.deleteCategory(id);
      if (error) {
        toast.error('Failed to delete category');
      } else {
        toast.success('Category deleted successfully');
        // Refresh the page to show updated list
        window.location.reload();
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  if (!categories?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No categories found</p>
        <Link href="/categories/new">
          <Button>Create Category</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Default Capacity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Default Start Time
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {category.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {category.default_capacity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {category.default_start_time}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(category.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <Link href={`/categories/${category.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <DeleteCategoryButton
                  categoryId={category.id}
                  onDelete={handleDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 