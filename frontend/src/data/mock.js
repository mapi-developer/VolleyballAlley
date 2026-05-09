export const MOCK_EVENTS = [
  {
    id: 1,
    title: "Saturday Morning Smash",
    type: "Indoor",
    level: "Intermediate",
    date: "Sat, Oct 24",
    time: "10:00 AM - 12:00 PM",
    location: "Central Sports Arena, Court 2",
    address: "123 Main St, City Center",
    description: "Join us for a competitive 6v6 indoor match! We have the court booked for 2 hours. Warm-up is for the first 15 mins. Please bring exact cash or pay via Revolut in advance.",
    price: "€8.00",
    host: "Alex (Organizer)",
    attendees: 10,
    maxAttendees: 12,
    status: "open",
    isJoined: false
  },
  {
    id: 2,
    title: "Sunset Beach Volley",
    type: "Outdoor",
    level: "All Levels",
    date: "Sun, Oct 25",
    time: "4:00 PM - 7:00 PM",
    location: "Riverside Beach Courts",
    address: "Riverside Park, Sand Court A",
    description: "Casual beach volleyball by the river. We will have 2 nets set up. Bring your sunglasses and plenty of water! We might grab drinks afterwards.",
    price: "Free",
    host: "Matvei (Organizer)",
    attendees: 12,
    maxAttendees: 12,
    status: "full",
    isJoined: true
  },
  {
    id: 3,
    title: "Advanced Training Session",
    type: "Indoor",
    level: "Advanced",
    date: "Wed, Oct 28",
    time: "7:00 PM - 9:00 PM",
    location: "Northside High School Gym",
    address: "Northside High Gym, Entrance B",
    description: "Structured training session focusing on spikes and blocks. Led by coach Elena. Limited spots available to ensure quality reps.",
    price: "€10.00",
    host: "Elena (Admin)",
    attendees: 6,
    maxAttendees: 14,
    status: "open",
    isJoined: false
  }
];

export const MOCK_USER = {
  name: "Matvei",
  telegramId: "@mapi_dev",
  role: "organizer", // 'member', 'organizer', 'admin'
  level: "Intermediate/Advanced",
  rating: 4.8,
  stats: {
    gamesPlayed: 42,
    hoursPlayed: 84,
    favoriteType: "Indoor"
  }
};