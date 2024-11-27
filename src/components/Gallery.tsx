import { useState } from 'react';
import { useImages } from '../hooks/useImages';
import ImageCard from './ImageCard';
import SearchBar from './SearchBar';
import { Loader } from 'lucide-react';

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState('');
  const { images, loading, error, hasMore, ref } = useImages(searchQuery);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Unsplash Clone</h1>
        <SearchBar onSearch={setSearchQuery} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>

        {loading && (
          <div className="flex justify-center mt-8">
            <Loader className="animate-spin" size={32} />
          </div>
        )}

        {!loading && !hasMore && images.length > 0 && (
          <p className="text-center mt-8 text-gray-500">No more images to load</p>
        )}

        {!loading && images.length === 0 && (
          <p className="text-center mt-8 text-gray-500">No images found</p>
        )}

        {hasMore && <div ref={ref} className="h-10" />}
      </div>
    </div>
  );
}