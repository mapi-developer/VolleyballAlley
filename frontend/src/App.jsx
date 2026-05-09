import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { MOCK_EVENTS, MOCK_USER } from './data/mock';
import BottomNav from './components/BottomNav';
import { HomeView, BrowseView, MyGamesView, ProfileView, NotificationSettingsView, OrganizerView, EventFormView, EventDetailView } from './views';

export default function App() {
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(MOCK_USER);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const hostedEvents = events.filter(e => e.host.includes(user.name));

  const handleSaveEvent = (eventData) => {
    if (editingEvent === 'new') {
      const newEvent = {
        ...eventData,
        id: Date.now(),
        host: `${user.name} (Organizer)`,
        attendees: 1,
        maxAttendees: parseInt(eventData.maxAttendees, 10),
        status: 'open',
        isJoined: true
      };
      setEvents([newEvent, ...events]);
    } else {
      setEvents(events.map(event => event.id === editingEvent.id ? { ...event, ...eventData, maxAttendees: parseInt(eventData.maxAttendees, 10) } : event));
    }
    setEditingEvent(null);
  };

  const handleRSVP = (eventId) => {
    setEvents(prevEvents => prevEvents.map(event => {
      if (event.id === eventId) {
        const joining = !event.isJoined;
        let newAttendees = event.attendees;
        if (joining) { if (newAttendees < event.maxAttendees) newAttendees++; } 
        else { newAttendees = Math.max(0, newAttendees - 1); }
        return { ...event, isJoined: joining, attendees: newAttendees, status: newAttendees >= event.maxAttendees ? 'full' : 'open' };
      }
      return event;
    }));
  };

  const renderView = () => {
    switch(activeTab) {
      case 'home': return <HomeView events={events} onEventClick={setSelectedEventId} onRSVP={handleRSVP} />;
      case 'browse': return <BrowseView events={events} onEventClick={setSelectedEventId} onRSVP={handleRSVP} />;
      case 'mygames': return <MyGamesView events={events} onEventClick={setSelectedEventId} onRSVP={handleRSVP} />;
      case 'profile': return <ProfileView user={user} setUserRole={(r) => setUser({...user, role: r})} onNavigate={setActiveTab} />;
      case 'notifications': return <NotificationSettingsView goBack={() => setActiveTab('profile')} />;
      case 'organizer': return <OrganizerView hostedEvents={hostedEvents} onCreate={() => setEditingEvent('new')} onEdit={setEditingEvent} />;
      default: return <HomeView events={events} onEventClick={setSelectedEventId} onRSVP={handleRSVP} />;
    }
  };

  const getHeaderTitle = () => {
    switch(activeTab) {
      case 'browse': return 'Browse Games';
      case 'mygames': return 'Your Journey';
      case 'profile': return 'My Profile';
      case 'notifications': return 'Settings';
      case 'organizer': return 'Organizer Hub';
      default: return 'VolleyballAlley';
    }
  };

  return (
    <div className="h-[100dvh] bg-gray-50 font-sans flex justify-center overflow-hidden">
      <div className="w-full bg-gray-50 h-full flex flex-col relative">
        
        <header className="bg-white px-5 py-4 shrink-0 z-20 shadow-sm flex items-center justify-between border-b border-gray-100">
          {editingEvent ? (
            <button onClick={() => setEditingEvent(null)} className="flex items-center gap-1 text-gray-900 font-bold active:opacity-70 transition-opacity">
              <ArrowLeft size={20} /> {editingEvent === 'new' ? 'New Event' : 'Edit Event'}
            </button>
          ) : selectedEvent ? (
            <button onClick={() => setSelectedEventId(null)} className="flex items-center gap-1 text-gray-900 font-bold active:opacity-70 transition-opacity">
              <ArrowLeft size={20} /> Event Details
            </button>
          ) : (
            <h1 className="text-lg font-bold text-gray-900">{getHeaderTitle()}</h1>
          )}
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
            {user.name.charAt(0)}
          </div>
        </header>

        <main className="flex-1 p-4 overflow-y-auto">
          {editingEvent ? <EventFormView initialData={editingEvent === 'new' ? null : editingEvent} onSave={handleSaveEvent} /> : selectedEvent ? <EventDetailView event={selectedEvent} /> : renderView()}
        </main>

        {editingEvent ? null : selectedEvent ? (
          <div className="shrink-0 w-full bg-white border-t border-gray-200 p-4 z-20 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
            <button 
              onClick={() => handleRSVP(selectedEvent.id)}
              className={`w-full py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.98] ${selectedEvent.isJoined ? 'bg-red-50 text-red-600 hover:bg-red-100' : selectedEvent.status === 'full' ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'}`}
            >
              {selectedEvent.isJoined ? 'Cancel RSVP' : selectedEvent.status === 'full' ? 'Join Waitlist' : 'RSVP Now'}
            </button>
          </div>
        ) : (
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={user.role} />
        )}

      </div>
    </div>
  );
}