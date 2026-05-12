import React, { useState } from 'react';
import BottomSheetLayout from './BottomSheetLayout';
import AttendeeManager, { Attendee } from './AttendeeManager';
import ConfirmDialog from './ConfirmDialog';

interface EditEventSheetProps {
  isOpen: boolean;
  onClose: () => void;
  // eventData: any // Pass real event data here later
}

export default function EditEventSheet({ isOpen, onClose }: EditEventSheetProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // MOCK DATA: Replace with state driven by your API
  const [mainList, setMainList] = useState<Attendee[]>([
    { id: '1', name: 'John Doe', tgTag: '@johndoe', isHost: true },
    { id: '2', name: 'Alice Smith', tgTag: '@alice_s' },
  ]);
  const [waitList, setWaitList] = useState<Attendee[]>([
    { id: '3', name: 'Bob Jones', tgTag: '@bobby_j' },
  ]);

  const handlePromote = (id: string) => {
    const player = waitList.find(p => p.id === id);
    if (player) {
      setWaitList(waitList.filter(p => p.id !== id));
      setMainList([...mainList, player]);
    }
  };

  const handleRemove = (id: string, listType: 'main' | 'waitlist') => {
    if (listType === 'main') {
      setMainList(mainList.filter(p => p.id !== id));
    } else {
      setWaitList(waitList.filter(p => p.id !== id));
    }
  };

  const handleDeleteEvent = () => {
    console.log("Event Deleted via API");
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <BottomSheetLayout isOpen={isOpen} onClose={onClose} title="Manage Event">
        
        {/* Placeholder for your actual FormField components that you already have */}
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm font-medium">
            Form Fields (Title, Date, Time, Location) go here...
          </div>
        </div>

        <hr className="my-6 border-gray-100" />

        {/* The New Attendee Manager */}
        <AttendeeManager 
          maxPlayers={12} 
          mainList={mainList} 
          waitList={waitList} 
          onPromote={handlePromote} 
          onRemove={handleRemove} 
        />

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <button className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-500/30 transition-all">
            Save Changes
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-4 bg-white text-red-500 font-bold rounded-xl border border-red-100 hover:bg-red-50 transition-colors"
          >
            Cancel & Delete Event
          </button>
        </div>
      </BottomSheetLayout>

      {/* Delete Confirmation Overlay */}
      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        title="Delete this event?"
        message="This action cannot be undone. All players will be removed and notified."
        onConfirm={handleDeleteEvent}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}