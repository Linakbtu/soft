import { useState, useMemo } from 'react';
import { DoorOpen } from 'lucide-react';
import { parseTimeRange } from '@/domain/time';
import { checkAvailability, type Result } from '@/domain/availability';
import { ROOMS, NOW_MIN, type Room, type Equipment } from '@/data/rooms';
import { filterRooms, parseAttendees } from '@/domain/filters';
import { RequirementsForm } from '@/components/RequirementsForm';
import { RoomList } from '@/components/RoomList';
import { RoomDetails } from '@/components/RoomDetails';
import { TimeForm } from '@/components/TimeForm';
import { ResultCard } from '@/components/ResultCard';
import { RulesList } from '@/components/RulesList';

function App() {
  const [attendeesText, setAttendeesText] = useState('1');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('R204');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [checkedRange, setCheckedRange] = useState<{ start: number; end: number } | null>(null);

  const attendeesParsed = parseAttendees(attendeesText);

  const matchingRooms = useMemo(() => {
    if (!attendeesParsed.ok) return [];
    return filterRooms(ROOMS, { attendees: attendeesParsed.value, equipment: selectedEquipment });
  }, [attendeesParsed, selectedEquipment]);

  const selectedRoom: Room | null = useMemo(() => {
    if (!attendeesParsed.ok) return null;
    return matchingRooms.find((r) => r.id === selectedRoomId) ?? null;
  }, [attendeesParsed, matchingRooms, selectedRoomId]);

  // F5: compute result during render from checkedRange + selectedRoom
  const result: Result | null = useMemo(() => {
    if (!checkedRange || !selectedRoom) return null;
    return checkAvailability(checkedRange.start, checkedRange.end, NOW_MIN, selectedRoom);
  }, [checkedRange, selectedRoom]);

  function toggleEquipment(item: Equipment) {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
    setCheckedRange(null);
    setSubmitted(false);
  }

  function handleAttendeesChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAttendeesText(e.target.value);
    setCheckedRange(null);
    setSubmitted(false);
  }

  function handleRoomSelect(id: string) {
    setSelectedRoomId(id);
  }

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeError(null);
    setCheckedRange(null);

    const parsed = parseTimeRange(startTime, endTime);
    if (!parsed.ok) {
      setTimeError(parsed.error);
      return;
    }

    setCheckedRange({ start: parsed.start, end: parsed.end });
  }

  function handleReset() {
    setStartTime('');
    setEndTime('');
    setSubmitted(false);
    setTimeError(null);
    setCheckedRange(null);
  }

  const noMatchingRoom = attendeesParsed.ok && matchingRooms.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <DoorOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Smart Campus Room Availability Checker
            </h1>
            <p className="text-xs text-slate-500">Check room availability — no booking required</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <RequirementsForm
          attendeesText={attendeesText}
          onAttendeesChange={handleAttendeesChange}
          selectedEquipment={selectedEquipment}
          onToggleEquipment={toggleEquipment}
          attendeesResult={attendeesParsed}
        />

        <RoomList
          rooms={matchingRooms}
          selectedRoomId={selectedRoom?.id ?? null}
          onSelectRoom={handleRoomSelect}
          empty={noMatchingRoom}
          attendeesInvalid={!attendeesParsed.ok}
        />

        {selectedRoom ? (
          <RoomDetails room={selectedRoom} />
        ) : (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 text-center">
            <p className="text-sm text-slate-500">Select a matching room above to check a time slot.</p>
          </section>
        )}

        <TimeForm
          startTime={startTime}
          endTime={endTime}
          onStartTimeChange={(e) => {
            setStartTime(e.target.value);
            setCheckedRange(null);
            setSubmitted(false);
          }}
          onEndTimeChange={(e) => {
            setEndTime(e.target.value);
            setCheckedRange(null);
            setSubmitted(false);
          }}
          onSubmit={handleCheck}
          onReset={handleReset}
          submitted={submitted}
          timeError={timeError}
          checkDisabled={!selectedRoom}
        />

        {submitted && result && !timeError && selectedRoom && (
          <ResultCard result={result} roomName={selectedRoom.name} />
        )}

        <RulesList />
      </main>

      <footer className="text-center py-4 text-xs text-slate-500">
        Prototype — checks availability only, does not create bookings.
      </footer>
    </div>
  );
}

export default App;
