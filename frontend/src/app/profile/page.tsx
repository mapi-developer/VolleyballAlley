"use client";

import { useUser } from "@/context/UserContext";
import { Star, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const { user, rating, level } = useUser();
  
  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'V';

  return (
    <div className="py-6 space-y-6">
      {/* User Info Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          {/* Large Avatar */}
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-4 border-zinc-50 shrink-0">
            {user?.photo_url ? (
              <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-blue-600 font-bold text-3xl">{initial}</span>
            )}
          </div>

          {/* Name and ID */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {user?.first_name || "Guest"} {user?.last_name || ""}
            </h2>
            <p className="text-gray-400 font-mono text-sm mt-1">
              ID: {user?.id || "-----------"}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-50">
          {/* Level Badge */}
          <div className="bg-zinc-50 rounded-2xl p-4 text-center border border-gray-100">
            <div className="flex items-center justify-center text-blue-600 mb-1">
              <ShieldCheck size={18} className="mr-1.5" />
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Verified Level</span>
            </div>
            <p className="text-gray-900 font-bold">{level}</p>
          </div>

          {/* Rating Badge */}
          <div className="bg-zinc-50 rounded-2xl p-4 text-center border border-gray-100">
            <div className="flex items-center justify-center text-amber-500 mb-1">
              <Star size={18} className="mr-1.5 fill-amber-500" />
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Behavior</span>
            </div>
            <p className="text-gray-900 font-bold">{rating} / 5.0</p>
          </div>
        </div>
      </div>

      {/* Placeholder for future settings list */}
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-50 text-sm font-semibold text-gray-400 uppercase tracking-widest">
          Preferences
        </div>
        <div className="p-6 text-gray-400 italic text-sm">
          More settings coming soon...
        </div>
      </div>
    </div>
  );
}