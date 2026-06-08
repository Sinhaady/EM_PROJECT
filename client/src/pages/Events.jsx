import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import EventCard from '../components/EventCard';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/events/categories/unique');
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Unable to load categories', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await api.get('/events', {
          params: {
            status: 'PUBLISHED',
            ...(selectedCategory ? { category: selectedCategory } : {}),
          },
        });
        setEvents(response.data.events || []);
      } catch (error) {
        console.error('Unable to load events', error);
        setError(error.response?.data?.message || 'Unable to load events.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCategory]);

  const filteredEvents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return events;
    }

    return events.filter((event) =>
      [event.title, event.location, event.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [events, searchTerm]);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Explore Events</h1>
          <p className="text-slate-400 mt-2">Find conferences, concerts, workshops, and meetups.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <label className="relative grow lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search events"
              className="w-full rounded-lg border border-white/10 bg-slate-900 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
            />
          </label>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="rounded-lg border border-white/10 py-2 px-3 text-sm bg-slate-900 text-white focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-white/10 bg-slate-900 p-8 text-center text-slate-300">
          Loading events...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-950/40 p-8 text-center text-red-200">
          {error}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-slate-900 p-8 text-center text-slate-300">
          No events match your search.
        </div>
      )}
    </div>
  );
};

export default Events;
