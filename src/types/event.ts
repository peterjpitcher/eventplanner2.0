import { EventCategory } from '@/services/event-category-service';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  date: string;
  start_time: string;
  capacity: number | null;
  notes: string | null;
  is_published: boolean;
  is_canceled: boolean;
  created_at: string;
  updated_at: string;
  // Join data
  category?: EventCategory | null;
} 