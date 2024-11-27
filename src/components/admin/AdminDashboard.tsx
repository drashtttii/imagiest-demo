import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { Image } from '../../types';
import { toast } from 'sonner';
import ImageUploadForm from './ImageUploadForm';
import { LogOut, Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      toast.error('Error fetching images');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        const { error } = await supabase
          .from('images')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Image deleted successfully');
        fetchImages();
      } catch (error) {
        toast.error('Error deleting image');
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/upload')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Image
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route
            path="/"
            element={
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-12">Loading...</div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {images.map((image) => (
                      <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
                        <img src={image.url} alt={image.alt_text} className="w-full h-48 object-cover" />
                        <div className="p-4">
                          <h3 className="text-lg font-medium">{image.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{image.description}</p>
                          <div className="flex items-center justify-between mt-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              image.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {image.status}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => navigate(`/admin/edit/${image.id}`)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                              >
                                <Pencil className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(image.id)}
                                className="p-1 text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            }
          />
          <Route
            path="/upload"
            element={
              <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6">Upload New Image</h2>
                <ImageUploadForm onSuccess={() => navigate('/admin')} />
              </div>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6">Edit Image</h2>
                <ImageUploadForm
                  image={images.find((img) => img.id === window.location.pathname.split('/').pop())}
                  onSuccess={() => navigate('/admin')}
                />
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}