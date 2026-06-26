import { Calendar, Clock, MapPin, Share2, Ticket, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const loadRazorpayScript = () => {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data.event);
      } catch (error) {
        console.error('Unable to load event', error);
        setError(error.response?.data?.message || 'Unable to load this event.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const refreshEvent = async () => {
    const response = await api.get(`/events/${id}`);
    setEvent(response.data.event);
  };

  const handleBooking = async () => {
    if (!user) {
      toast.info('Please log in to book tickets.');
      navigate('/login');
      return;
    }

    if (!event || ticketCount < 1) {
      return;
    }

    setIsBooking(true);

    try {
      const response = await api.post('/bookings', {
        eventId: event._id,
        tickets: ticketCount,
      });

      if (response.data.booking) {
        toast.success('Booking confirmed!');
        await refreshEvent();
        return;
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        toast.error('Payment key is missing. Add VITE_RAZORPAY_KEY_ID in client/.env.');
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Unable to load payment checkout. Please try again.');
        return;
      }

      const { order, bookingId } = response.data;

      const checkout = new window.Razorpay({
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: 'EventM',
        description: event.title,
        order_id: order.id,
        prefill: {
          name: user.name,
          email: user.email,
        },
        handler: async (paymentResponse) => {
          try {
            await api.post('/bookings/verify', {
              ...paymentResponse,
              bookingId,
            });
            toast.success('Payment successful. Booking confirmed!');
            await refreshEvent();
          } catch (error) {
            toast.error(error.response?.data?.message || 'Payment verification failed.');
          }
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment was cancelled.');
          },
        },
        theme: {
          color: '#2563eb',
        },
      });

      checkout.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to book tickets.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleShare = async () => {
    if (!event) {
      return;
    }

    const shareUrl = `${window.location.origin}/events/${event._id || id}`;
    const shareData = {
      title: event.title,
      text: `Check out ${event.title} on Ventro`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Event link copied to clipboard.');
        return;
      }

      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.setAttribute('readonly', '');
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Event link copied to clipboard.');
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Unable to share this event. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-300">
        Loading event...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-red-300 font-medium mb-4">{error || 'Event not found.'}</p>
        <Link to="/events" className="text-violet-300 font-semibold hover:text-violet-200">
          Back to events
        </Link>
      </div>
    );
  }

  const availableSeats = Math.max((event.capacity || 0) - (event.registeredCount || 0), 0);
  const organizerName = event.createdBy?.name || event.organizer || 'Event organizer';
  const eventDate = new Date(event.date);
  const isPastEvent = !Number.isNaN(eventDate.getTime()) && eventDate < new Date();
  const isCancelledEvent = event.status === 'CANCELLED';
  const canBook = !isCancelledEvent && !isPastEvent && availableSeats > 0 && ticketCount <= availableSeats && !isBooking;

  return (
    <div className="bg-[#090b12] min-h-screen pb-12">
      <div className="w-full h-64 md:h-96 relative bg-gray-900">
        <img
          src={event.image?.url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80'}
          alt={event.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-linear-to-t from-gray-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <span className="bg-violet-600 text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide mb-4 inline-block">
              {event.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2">
              {event.title}
            </h1>
            <p className="text-gray-300 flex items-center mt-2">
              By <span className="font-semibold text-white ml-1">{organizerName}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-8">
          <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-white/10 flex flex-wrap gap-6">
            <div className="flex items-center text-slate-200">
              <Calendar className="w-5 h-5 text-violet-400 mr-3" />
              <div>
                <p className="text-sm text-slate-500">Date</p>
                <p className="font-semibold">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center text-slate-200">
              <Clock className="w-5 h-5 text-violet-400 mr-3" />
              <div>
                <p className="text-sm text-slate-500">Time</p>
                <p className="font-semibold">
                  {new Date(event.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center text-slate-200">
              <MapPin className="w-5 h-5 text-violet-400 mr-3" />
              <div>
                <p className="text-sm text-slate-500">Location</p>
                <p className="font-semibold">{event.location}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">About this Event</h2>
            <div className="prose max-w-none text-slate-300 whitespace-pre-line">
              {event.description}
            </div>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-slate-900 p-6 rounded-xl shadow-lg shadow-black/30 border border-white/10 sticky top-24">
            <h3 className="text-2xl font-bold text-white mb-4">
              {event.price === 0 ? 'Free' : `Rs. ${event.price}`}
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-slate-300 border-b border-white/10 pb-4">
                <span className="flex items-center"><Ticket className="w-4 h-4 mr-2" /> Ticket Type</span>
                <span className="font-semibold">General Admission</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center"><Users className="w-4 h-4 mr-2" /> Availability</span>
                {isCancelledEvent ? (
                  <span className="font-semibold text-red-300">Event cancelled</span>
                ) : isPastEvent ? (
                  <span className="font-semibold text-amber-300">Event ended</span>
                ) : availableSeats > 0 ? (
                  <span className="font-semibold text-green-400">{availableSeats} seats left</span>
                ) : (
                  <span className="font-semibold text-red-300">Sold Out</span>
                )}
              </div>
              <div>
                <label htmlFor="tickets" className="block text-sm font-medium text-slate-300 mb-1">
                  Tickets
                </label>
                <input
                  id="tickets"
                  type="number"
                  min="1"
                  max={availableSeats || 1}
                  value={ticketCount}
                  onChange={(event) => setTicketCount(Number(event.target.value))}
                  disabled={isCancelledEvent || isPastEvent || availableSeats <= 0}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 disabled:bg-slate-800 disabled:text-slate-500"
                />
              </div>
            </div>

            <button
              onClick={handleBooking}
              className={`w-full py-3 rounded-lg font-bold text-white transition-colors flex justify-center items-center ${
                canBook
                  ? 'bg-violet-600 hover:bg-violet-500 shadow-md'
                  : 'bg-slate-600 cursor-not-allowed'
              }`}
              disabled={!canBook}
            >
              {isCancelledEvent
                ? 'Event Cancelled'
                : isPastEvent
                  ? 'Event Ended'
                  : availableSeats <= 0
                  ? 'Event Sold Out'
                  : isBooking
                    ? 'Booking...'
                    : 'Book Tickets Now'}
            </button>

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center text-slate-400 hover:text-violet-300 transition-colors text-sm font-medium"
              >
                <Share2 className="w-4 h-4 mr-2" /> Share this event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
