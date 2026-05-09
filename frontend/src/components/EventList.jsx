import EventCard from './EventCard';

export default function EventList({ events, onRSVP }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 font-medium">No upcoming events found.</p>
      </div>
    );
  }

  return (
    <section className="px-4 py-2">
      <h2 className="text-gray-400 text-[11px] font-black uppercase mb-4 tracking-[0.2em]">
        Upcoming Games
      </h2>
      {events.map((event) => (
        <EventCard key={event.id} event={event} onRSVP={onRSVP} />
      ))}
    </section>
  );
}