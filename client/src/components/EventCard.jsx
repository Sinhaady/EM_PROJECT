import { Calendar, MapPin, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  return (
    <div className="bg-slate-900 rounded-xl shadow-sm border border-white/10 overflow-hidden hover:shadow-lg hover:shadow-black/30 transition-shadow duration-300 flex flex-col h-full">
      <div className="relative h-48 w-full overflow-hidden bg-slate-800">
        <img
          src={event.image?.url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-violet-200 uppercase tracking-wide border border-white/10">
          {event.category}
        </div>
      </div>

      <div className="p-5 flex flex-col grow">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4 text-slate-300 text-sm grow">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-slate-500 shrink-0" />
            <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-slate-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
          <div className="flex items-center text-white font-bold">
            <Ticket className="w-4 h-4 mr-2 text-violet-400" />
            {event.price === 0 ? 'Free' : `Rs. ${event.price}`}
          </div>
          <Link
            to={`/events/${event._id}`}
            className="text-sm font-semibold text-violet-300 hover:text-violet-200 transition-colors"
          >
            View Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

// import { Link } from 'react-router-dom'
// import { motion } from 'framer-motion'
// import {
//   Calendar,
//   MapPin,
//   Clock,
// } from 'lucide-react'

// export default function EventCard({
//   event,
//   index = 0,
// }) {
//   if (!event) return null

//   const seatsLeft =
//     event?.availableSeats || 0

//   const totalSeats =
//     event?.totalSeats || 1

//   const percentage = Math.min(
//     100,
//     Math.round(
//       (seatsLeft / totalSeats) * 100
//     )
//   )

//   const statusColors = {
//     upcoming:
//       'bg-cyan-400 text-[#050816]',
//     ongoing:
//       'bg-blue-500 text-white',
//     cancelled:
//       'bg-red-500 text-white',
//   }

//   return (
//     <motion.div
//       initial={{
//         opacity: 0,
//         y: 30,
//       }}
//       animate={{
//         opacity: 1,
//         y: 0,
//       }}
//       transition={{
//         delay: index * 0.08,
//         duration: 0.5,
//       }}
//       whileHover={{
//         y: -10,
//         scale: 1.02,
//       }}
//       className="group overflow-hidden rounded-[32px] border border-cyan-400/20 bg-[#0F172A]/95 shadow-[0_0_35px_rgba(34,211,238,0.06)] backdrop-blur-xl transition-all duration-500 hover:border-cyan-400/40 hover:shadow-[0_0_70px_rgba(34,211,238,0.20)]"
//     >
//       <Link to={`/events/${event._id}`}>
        
//         {/* Image */}
//         <div className="relative aspect-video overflow-hidden">
          
//           <img
//             src={event.eventImage}
//             alt={event.title || 'Event'}
//             loading="lazy"
//             className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
//           />

//           {/* Overlay */}
//           <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/40 to-transparent" />

//           {/* Glow */}
//           <div className="absolute inset-0 bg-cyan-400/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

//           {/* Status */}
//           <span
//             className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg backdrop-blur-md ${
//               statusColors[event.status] ||
//               'bg-zinc-700 text-white'
//             }`}
//           >
//             {event.status || 'N/A'}
//           </span>

//           {/* Duration */}
//           <span className="absolute right-4 top-4 rounded-full border border-cyan-400/20 bg-[#050816]/80 px-3 py-1 text-[10px] font-medium tracking-wide text-cyan-200 backdrop-blur-md">
//             {event.duration || 'N/A'}
//           </span>
//         </div>

//         {/* Content */}
//         <div className="p-6">

//           {/* Artist */}
//           <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-300">
//             {event.eventArtistName ||
//               'Unknown Artist'}
//           </p>

//           {/* Title */}
//           <h3 className="mb-5 line-clamp-2 text-2xl font-bold leading-snug text-white transition-colors duration-300 group-hover:text-cyan-300">
//             {event.title ||
//               'Untitled Event'}
//           </h3>

//           {/* Details */}
//           <div className="mb-6 space-y-3">

//             <div className="flex items-center gap-3 text-sm text-zinc-400">
//               <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/10">
//                 <Calendar className="h-4 w-4 text-cyan-300" />
//               </div>

//               <span>
//                 {event.eventDate
//                   ? new Date(
//                       event.eventDate
//                     ).toLocaleDateString(
//                       'en-IN',
//                       {
//                         day: 'numeric',
//                         month: 'short',
//                         year: 'numeric',
//                       }
//                     )
//                   : 'TBA'}
//               </span>
//             </div>

//             <div className="flex items-center gap-3 text-sm text-zinc-400">
//               <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/10">
//                 <MapPin className="h-4 w-4 text-cyan-300" />
//               </div>

//               <span className="truncate">
//                 {event.eventLocation ||
//                   'Location TBA'}
//               </span>
//             </div>

//             <div className="flex items-center gap-3 text-sm text-zinc-400">
//               <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/10">
//                 <Clock className="h-4 w-4 text-cyan-300" />
//               </div>

//               <span>
//                 {event.duration || 'N/A'}
//               </span>
//             </div>

//           </div>

//           {/* Price */}
//           <div className="mb-6 flex items-end justify-between">

//             <div>
//               <p className="mb-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
//                 Starting From
//               </p>

//               <h2 className="text-4xl font-black text-white">
//                 ₹
//                 {event.ticketPrice?.toLocaleString(
//                   'en-IN'
//                 ) || '0'}
//               </h2>
//             </div>

//             <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-right">
//               <p className="text-[10px] uppercase tracking-wider text-zinc-500">
//                 Seats Left
//               </p>

//               <h4 className="text-lg font-bold text-cyan-300">
//                 {seatsLeft}
//               </h4>
//             </div>

//           </div>

//           {/* Seats Progress */}
//           <div className="mb-6">

//             <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
//               <span>
//                 {seatsLeft} seats left
//               </span>

//               <span>
//                 {event.totalSeats || 0} total
//               </span>
//             </div>

//             <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">

//               <motion.div
//                 initial={{ width: 0 }}
//                 animate={{
//                   width: `${percentage}%`,
//                 }}
//                 transition={{
//                   duration: 1,
//                   ease: 'easeOut',
//                 }}
//                 className="h-full rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]"
//               />

//             </div>

//           </div>

//           {/* Button */}
//           <motion.div
//             whileHover={{
//               scale: 1.03,
//             }}
//             whileTap={{
//               scale: 0.97,
//             }}
//             className="flex items-center justify-center rounded-2xl bg-cyan-400 py-3.5 text-sm font-bold tracking-wide text-[#050816] shadow-lg shadow-cyan-400/20 transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
//           >
//             Book Now
//           </motion.div>

//         </div>
//       </Link>
//     </motion.div>
//   )
// }