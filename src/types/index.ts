export interface Image {
  id: string;
  title: string;
  description: string;
  alt_text: string;
  url: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}