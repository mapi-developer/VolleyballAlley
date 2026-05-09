import React from 'react';

interface HeaderProps {
  user?: {
    photo_url?: string;
    first_name?: string;
  };
}

const Header = ({ user }: HeaderProps) => {
  const [imageError, setImageError] = React.useState(false);
  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'X';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-50 shadow-sm">
      <h1 className="text-xl font-bold text-gray-900">VolleyballAlley</h1>

      {/* Avatar Container: Strict 36x36px circle */}
      <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
        {user?.photo_url && !imageError ? (
          <img 
            src={user.photo_url} 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={() => setImageError(true)} // Fallback if Telegram blocks the image
          />
        ) : (
          <span className="text-blue-600 font-semibold text-sm">
            {initial}
          </span>
        )}
      </div>
    </header>
  );
};

export default Header;