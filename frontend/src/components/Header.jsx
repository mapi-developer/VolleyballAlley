export default function Header({ user }) {
  return (
    <header className="bg-white p-4 sticky top-0 z-10 shadow-sm border-b border-gray-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-blue-600 uppercase tracking-tighter">
            VolleyAlley
          </h1>
          <p className="text-gray-500 text-xs font-medium">
            {user ? `Hey, ${user.first_name}!` : 'Find your next game'}
          </p>
        </div>
        {user?.photo_url && (
          <img 
            src={user.photo_url} 
            className="w-10 h-10 rounded-full border-2 border-blue-100" 
            alt="profile" 
          />
        )}
      </div>
    </header>
  );
}