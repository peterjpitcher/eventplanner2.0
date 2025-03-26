import { supabase } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      category:categories (
        id,
        name
      )
    `)
    .eq('id', params.id)
    .single();

  if (!event) {
    return {
      title: 'Event Not Found | Event Planner',
      description: 'The event you are looking for does not exist.',
    };
  }

  return {
    title: `${event.name} | Event Planner`,
    description: event.description || 'Event details',
  };
} 