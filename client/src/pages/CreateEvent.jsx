import { CalendarPlus, ImageUp } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const initialFormData = {
  title: '',
  category: '',
  description: '',
  date: '',
  location: '',
  price: '',
  capacity: '',
  image: null,
};

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'organizer' && user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-slate-900 border border-white/10 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white">Organizer access required</h1>
          <p className="text-slate-400 mt-3">
            Your account is currently an attendee account. Register or update your account as an organizer to create events.
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.image) {
      toast.error('Please upload an event image.');
      return;
    }

    setIsSubmitting(true);

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('category', formData.category);
    payload.append('description', formData.description);
    payload.append('date', formData.date);
    payload.append('location', formData.location);
    payload.append('price', formData.price);
    payload.append('capacity', formData.capacity);
    payload.append('image', formData.image);

    try {
      const response = await api.post('/events', payload);
      toast.success('Event created successfully!');
      navigate(`/events/${response.data.event._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create Event</h1>
        <p className="text-slate-400 mt-2">Add the details attendees need before booking.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-white/10 rounded-lg p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">
              Event Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-1">
              Category
            </label>
            <input
              id="category"
              name="category"
              type="text"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
              placeholder="Technology"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-1">
              Date and Time
            </label>
            <input
              id="date"
              name="date"
              type="datetime-local"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-slate-300 mb-1">
              Ticket Price
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              required
              value={formData.price}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
              placeholder="0"
            />
          </div>

          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-slate-300 mb-1">
              Capacity
            </label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              required
              value={formData.capacity}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
              placeholder="100"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-1">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              value={formData.location}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows="6"
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="image" className="block text-sm font-medium text-slate-300 mb-1">
              Event Image
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-slate-950 px-4 py-6 text-center hover:bg-slate-800">
              <ImageUp className="h-6 w-6 text-slate-500" />
              <span className="mt-2 text-sm font-medium text-slate-300">
                {formData.image ? formData.image.name : 'Upload JPG, PNG, or WebP'}
              </span>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                onChange={handleChange}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white ${
            isSubmitting ? 'bg-violet-400 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-500'
          }`}
        >
          <CalendarPlus className="h-4 w-4" />
          {isSubmitting ? 'Creating event...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
