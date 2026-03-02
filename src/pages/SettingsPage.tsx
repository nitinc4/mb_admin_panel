import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { API_URL } from '../config';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
}

interface Service {
  id: string;
  category: ServiceCategory; 
  name: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
}

export default function SettingsPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'services'>('categories');
  const [loading, setLoading] = useState(true);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', color: '#3B82F6' });
  const [serviceForm, setServiceForm] = useState({
    category: '', 
    name: '',
    description: '',
    price: 0,
    duration: 60,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, servicesRes] = await Promise.all([
        fetch(`${API_URL}/api/service-categories`),
        fetch(`${API_URL}/api/services`),
      ]);

      const categoriesData = await categoriesRes.json();
      const servicesData = await servicesRes.json();

      if (categoriesData.success) setCategories(categoriesData.data || []);
      if (servicesData.success) setServices(servicesData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name) return;
    try {
      const res = await fetch(`${API_URL}/api/service-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });
      const result = await res.json();
      if (result.success) {
        setCategories([result.data, ...categories]);
        setCategoryForm({ name: '', description: '', color: '#3B82F6' });
        setShowCategoryModal(false);
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryForm.name) return;
    try {
      const res = await fetch(`${API_URL}/api/service-categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });
      const result = await res.json();
      if (result.success) {
        setCategories(categories.map((c) => (c.id === editingCategory.id ? result.data : c)));
        setCategoryForm({ name: '', description: '', color: '#3B82F6' });
        setEditingCategory(null);
        setShowCategoryModal(false);
        fetchData(); 
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await fetch(`${API_URL}/api/service-categories/${id}`, { method: 'DELETE' });
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleAddService = async () => {
    if (!serviceForm.name || !serviceForm.category) return;
    try {
      // FIX 1: Used backticks instead of single quotes here
      const res = await fetch(`${API_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm),
      });
      const result = await res.json();
      if (result.success) {
        setServices([result.data, ...services]);
        setServiceForm({ category: '', name: '', description: '', price: 0, duration: 60 });
        setShowServiceModal(false);
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleUpdateService = async () => {
    if (!editingService || !serviceForm.name) return;
    try {
      const res = await fetch(`${API_URL}/api/services/${editingService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm),
      });
      const result = await res.json();
      if (result.success) {
        setServices(services.map((s) => (s.id === editingService.id ? result.data : s)));
        setServiceForm({ category: '', name: '', description: '', price: 0, duration: 60 });
        setEditingService(null);
        setShowServiceModal(false);
      }
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await fetch(`${API_URL}/api/services/${id}`, { method: 'DELETE' });
      setServices(services.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const openCategoryModal = (category?: ServiceCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, description: category.description, color: category.color });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', color: '#3B82F6' });
    }
    setShowCategoryModal(true);
  };

  const openServiceModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        category: service.category?.id || '',
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
      });
    } else {
      setEditingService(null);
      setServiceForm({ category: '', name: '', description: '', price: 0, duration: 60 });
    }
    setShowServiceModal(true);
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading services...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        {/* CHANGED NAME TO SERVICES */}
        <h1 className="text-3xl font-bold text-gray-800">Services</h1>
        <p className="text-gray-600 mt-1">Manage services and categories</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'categories' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Service Categories
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'services' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Services
        </button>
      </div>

      {activeTab === 'categories' && (
        <div>
          <div className="mb-6">
            <button onClick={() => openCategoryModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={18} /> Add Category
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                    <h3 className="font-semibold text-gray-800">{category.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openCategoryModal(category)} className="p-1 text-gray-500 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteCategory(category.id)} className="p-1 text-gray-500 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                {category.description && <p className="text-sm text-gray-600">{category.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div>
          <div className="mb-6">
            <button onClick={() => openServiceModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={18} /> Add Service
            </button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Service Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{service.name}</p>
                        {service.description && <p className="text-sm text-gray-600">{service.description}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: service.category?.color || '#3B82F6' }}></div>
                        <span className="text-sm text-gray-700">{service.category?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-800">₹{service.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-800">{service.duration} min</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openServiceModal(service)} className="p-1 text-gray-500 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteService(service.id)} className="p-1 text-gray-500 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowCategoryModal(false)} className="p-1 text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={categoryForm.color} onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                  <input type="text" value={categoryForm.color} onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCategoryModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={editingCategory ? handleUpdateCategory : handleAddCategory} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {editingCategory ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{editingService ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={() => setShowServiceModal(false)} className="p-1 text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                <input type="text" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  {/* FIX 2: Added e.target.value check to prevent passing NaN to the state */}
                  <input type="number" value={serviceForm.price || ''} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value ? parseFloat(e.target.value) : 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  {/* FIX 2: Added e.target.value check to prevent passing NaN to the state */}
                  <input type="number" value={serviceForm.duration || ''} onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value ? parseInt(e.target.value) : 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowServiceModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={editingService ? handleUpdateService : handleAddService} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {editingService ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}