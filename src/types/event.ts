export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  price: number;
  is_canceled: boolean;
  category_id: string;
  created_at: string;
  updated_at: string;
  category: {
    id: string;
    name: string;
  };
} 