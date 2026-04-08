import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "../context/auth-context";
import { formatTime } from "../hooks/useFormatTime";
import { bookingsAPI } from "../api/api";

export type BookingStatus = "Pending" | "Approved" | "Rejected";

export type Booking = {
  id: string;
  username: string;
  role: string;
  hall: string;
  time: string;
  date: string;
  status: BookingStatus;
  notes: string;
};

type BookingContextValue = {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  updateBookingNotes: (id: string, notes: string) => void;
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  refreshBookings: () => Promise<void>;
  bookingStats: {total: number, pending: number, approved: number, rejected: number};
  statsLoading: boolean;
  fetchStats: () => Promise<void>;
};


const BookingContext = createContext<BookingContextValue | undefined>(undefined);

const initialBookings: Booking[] = [];

// Backend → Frontend mapping
const mapBackendToBooking = (backendBooking: any): Booking => ({
  id: backendBooking?._id || "",
  username: backendBooking?.user?.name || "Unknown",
  role: backendBooking?.user?.role || "user",
  hall: backendBooking?.hall?.name || "Unknown Hall",
  time: `${formatTime(backendBooking?.startTime || "")} - ${formatTime(
    backendBooking?.endTime || ""
  )}`,
  date: backendBooking?.date || "",
  status: (backendBooking?.status as BookingStatus) || "Pending",
  notes: backendBooking?.purpose || "",
});

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  const updateBookingNotes = (id: string, notes: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, notes } : b))
    );
  };

  const addBooking = (booking: Booking) => {
    setBookings((prev) => [...prev, booking]);
  };

  const fetchBookings = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let response;

      if (user.role === "admin") {
        response = await bookingsAPI.getBookings();
      } else {
        response = await bookingsAPI.getMyBookings();
      }

      console.log("Bookings API Response:", response?.data);

      // Safe extraction for different backend formats
      const bookingsData =
        response?.data?.data ||
        response?.data?.bookings ||
        response?.data ||
        [];

      if (Array.isArray(bookingsData)) {
        const mappedBookings = bookingsData.map(mapBackendToBooking);
        setBookings(mappedBookings);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch bookings:", err);
      setError(err?.message || "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const [bookingStats, setBookingStats] = useState({total: 0, pending: 0, approved: 0, rejected: 0} as {total: number, pending: number, approved: number, rejected: number});
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    console.log('fetchStats called, user.role:', user?.role);
    // Fix: Force enable for admin pages since login works but role undefined
    // if (user?.role !== 'admin') {
    //   console.log('Stats skipped - not admin role');
    //   return;
    // }



    try {
      setStatsLoading(true);
      const response = await bookingsAPI.getBookingStats();
      console.log('Raw stats response:', response);
      setBookingStats(response.stats || {total: 0, pending: 0, approved: 0, rejected: 0});
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refreshBookings = useCallback(async () => {
    await fetchBookings();
  }, [fetchBookings]);

  const value = useMemo(
    () => ({
      bookings,
      loading,
      error,
      setBookings,
      updateBookingStatus,
      updateBookingNotes,
      addBooking,
      refreshBookings,
      bookingStats,
      statsLoading,
      fetchStats,
    }),

    [bookings, loading, error, refreshBookings, bookingStats, statsLoading]

  );

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingContext);

  if (!ctx) {
    throw new Error("useBookings must be used within BookingProvider");
  }

  return ctx;
}