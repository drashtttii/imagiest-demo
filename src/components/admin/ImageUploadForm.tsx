import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Image as ImageType } from '../../types';
import { Upload, Loader2 } from 'lucide-react';

interface FormData {
  title: string;
  description: string;
  alt_text: string;
  category: string;
  tags: string;
  status: 'draft' | 'published';
}

interface Props {
  image?: ImageType;
  onSuccess: () => void;
}

export default function ImageUploadForm({ image, onSuccess }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(image?.url || '');
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: image ? {
      ...image,
      tags: image.tags.join(', ')
    } : undefined
  });

  const onSubmit = async (data: FormData) => {
    try {
      setUploading(true);
      const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
      const file = fileInput?.files?.[0];

      let imageUrl = image?.url;

      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error('File size must be less than 10MB');
          return;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        imageUrl = `${supabase.storage.from('images').getPublicUrl(fileName).data.publicUrl}`;
      }

      const imageData = {
        title: data.title,
        description: data.description,
        alt_text: data.alt_text,
        category: data.category,
        tags: data.tags.split(',').map(tag => tag.trim()),
        status: data.status,
        url: imageUrl,
        updated_at: new Date().toISOString()
      };

      if (image) {
        const { error } = await supabase
          .from('images')
          .update(imageData)
          .eq('id', image.id);
        if (error) throw error;
        toast.success('Image updated successfully');
      } else {
        const { error } = await supabase
          .from('images')
          .insert([{ ...imageData, created_at: new Date().toISOString() }]);
        if (error) throw error;
        toast.success('Image uploaded successfully');
        reset();
        setPreview('');
      }

      onSuccess();
    } catch (error) {
      toast.error('Error uploading image');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {preview ? (
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      ) : (
        <label className="block w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
          <div className="flex flex-col items-center justify-center h-full">
            <Upload className="w-12 h-12 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500">Click to upload image</span>
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            {...register('title')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Alt Text</label>
          <input
            type="text"
            {...register('alt_text')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            {...register('category')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
          <input
            type="text"
            {...register('tags')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            {...register('status')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            Uploading...
          </>
        ) : (
          'Upload Image'
        )}
      </button>
    </form>
  );
}