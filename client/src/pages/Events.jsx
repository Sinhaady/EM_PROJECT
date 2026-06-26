import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import { buildEventSearchIndex } from '../lib/eventSearchTrie';

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

  const searchIndex = useMemo(() => buildEventSearchIndex(events), [events]);
  const filteredEvents = useMemo(() => searchIndex.search(searchTerm), [searchIndex, searchTerm]);
  const searchSuggestions = useMemo(
    () => searchIndex.suggest(searchTerm, 5),
    [searchIndex, searchTerm],
  );

  const { exploreEvents, pastEvents } = useMemo(() => {
    const now = new Date();

    return filteredEvents.reduce(
      (sections, event) => {
        const eventDate = new Date(event.date);

        if (!Number.isNaN(eventDate.getTime()) && eventDate < now) {
          sections.pastEvents.push(event);
        } else {
          sections.exploreEvents.push(event);
        }

        return sections;
      },
      { exploreEvents: [], pastEvents: [] },
    );
  }, [filteredEvents]);

  const sortedPastEvents = useMemo(
    () =>
      [...pastEvents].sort(
        (first, second) => new Date(second.date).getTime() - new Date(first.date).getTime(),
      ),
    [pastEvents],
  );

  const renderEventGrid = (eventList) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {eventList.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );

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
              placeholder="Search title, category, location"
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

      {searchSuggestions.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Suggestions
          </span>
          {searchSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setSearchTerm(suggestion)}
              className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-violet-400/60 hover:text-violet-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-white/10 bg-slate-900 p-8 text-center text-slate-300">
          Loading events...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-950/40 p-8 text-center text-red-200">
          {error}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="space-y-12">
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Explore Events</h2>
                <p className="mt-1 text-sm text-slate-400">Upcoming and active events you can still attend.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                {exploreEvents.length} events
              </span>
            </div>

            {exploreEvents.length > 0 ? (
              renderEventGrid(exploreEvents)
            ) : (
              <div className="rounded-lg border border-white/10 bg-slate-900 p-8 text-center text-slate-300">
                No upcoming events match your search.
              </div>
            )}
          </section>

          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Past Events</h2>
                <p className="mt-1 text-sm text-slate-400">Events with dates that have already passed.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                {sortedPastEvents.length} events
              </span>
            </div>

            {sortedPastEvents.length > 0 ? (
              renderEventGrid(sortedPastEvents)
            ) : (
              <div className="rounded-lg border border-white/10 bg-slate-900 p-8 text-center text-slate-300">
                No past events match your search.
              </div>
            )}
          </section>
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
