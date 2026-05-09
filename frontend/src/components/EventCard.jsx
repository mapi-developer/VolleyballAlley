export default function EventCard({ event, onRSVP }) {
  const handleRSVP = () => {
    // Add physical feel to the button press for Telegram users
    window.Telegram?.WebApp?.HapticFeedback.impactOccurred('medium');
    onRSVP(event.id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 border border-gray-100 active:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <span className="bg-blue-50 text-blue-700 text-[10px] uppercase font-black px-2 py-1 rounded-md tracking-wider">
          {event.level}
        </span>
        <span className="text-gray-400 text-sm font-bold">{event.time}</span>
      </div>
      
      <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2">
        {event.location}
      </h3>
      
      <div className="flex items-center text-sm text-gray-600 space-x-4 mb-4">
        <div className="flex items-center">
          <span className="mr-1">🏐</span>
          <span className={event.spots_left < 3 ? "text-orange-600 font-bold" : ""}>
            {event.spots_left} spots left
          </span>
        </div>
        <div className="flex items-center">
          <span className="mr-1">💰</span>
          <span>{event.price}</span>
        </div>
      </div>
      
      <button 
        onClick={handleRSVP}
        className="w-full bg-blue-600 text-white font-extrabold py-3 rounded-xl shadow-md shadow-blue-200 active:scale-[0.98] transition-transform"
      >
        RSVP NOW
      </button>
    </div>
  );
}