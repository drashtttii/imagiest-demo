import { Download } from 'lucide-react';
import { Image } from '../types';

interface Props {
  image: Image;
}

export default function ImageCard({ image }: Props) {
  const handleDownload = async () => {
    const response = await fetch(image.url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${image.title}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="relative group overflow-hidden rounded-lg">
      <img
        src={image.url}
        alt={image.alt_text}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300">
        <div className="absolute inset-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-lg font-semibold mb-2">{image.title}</h3>
          <p className="text-sm mb-2">{image.description}</p>
          <div className="flex flex-wrap gap-2">
            {image.tags.map((tag, index) => (
              <span key={index} className="text-xs bg-white/20 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={handleDownload}
            className="absolute bottom-4 right-4 p-2 bg-white rounded-full text-black hover:bg-gray-200 transition-colors"
          >
            <Download size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}