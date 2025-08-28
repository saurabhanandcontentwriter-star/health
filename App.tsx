import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import DoctorCard from './components/DoctorCard';
import BookingModal from './components/BookingModal';
import AiRecommender from './components/AiRecommender';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import PharmacyView from './components/PharmacyView';
import LabTestsView from './components/LabTestsView';
import WelcomeModal from './components/WelcomeModal';
import PermissionGate from './components/PermissionGate';
import Chatbot from './components/Chatbot';
import VideoCallView from './components/VideoCallView';
import ReminderToast from './components/ReminderToast';
import AppointmentHistoryView from './components/AppointmentHistoryView';
import UserProfile from './components/UserProfile';
import OrderHistoryView from './components/OrderHistoryView';
import { useAuth } from './contexts/AuthContext';
import * as db from './services/dbService';
import { User, Doctor, Appointment, AppointmentIn, PharmaCompany, UserSession, Medicine, MedicineOrder, Address, LabTest, LabTestBooking, LabTestBookingIn, Message } from './types';
import { SearchIcon, StethoscopeIcon } from './components/IconComponents';
import LabTestBookingModal from './components/LabTestBookingModal';

const App: React.FC = () => {
  const [permissionsGranted, setPermissionsGranted] = useState(localStorage.getItem('permissions-granted') === 'true');
  const { isAuthenticated, user, authLogs } = useAuth();
  const [currentView, setCurrentView] = useState<'search' | 'dashboard' | 'ownerDashboard' | 'pharmacy' | 'labTests' | 'appointmentHistory' | 'profile' | 'orderHistory'>('search');
  
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
  const [pharmaCompanies, setPharmaCompanies] = useState<PharmaCompany[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicineOrders, setMedicineOrders] = useState<MedicineOrder[]>([]);
  const [allMedicineOrders, setAllMedicineOrders] = useState<MedicineOrder[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [labTestBookings, setLabTestBookings] = useState<LabTestBooking[]>([]);
  const [allLabTestBookings, setAllLabTestBookings] = useState<LabTestBooking[]>([]);
  
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingLabTest, setBookingLabTest] = useState<LabTest | null>(null);
  const [videoCallDoctor, setVideoCallDoctor] = useState<Doctor | null>(null);
  const [reminders, setReminders] = useState<Appointment[]>([]);
  
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [botMessage, setBotMessage] = useState<Message | null>(null);


  const refreshData = useCallback(() => {
    const allUsers = db.getUsers();
    const allDoctors = db.getDoctors();
    const allAppointments = db.getAllAppointments();
    const allPharmaCompanies = db.getPharmaCompanies();
    const allSessions = db.getAllSessions();
    const allMedicines = db.getMedicines();
    const allOrders = db.getAllMedicineOrders();
    const allLabTests = db.getLabTests();
    const allBookings = db.getAllLabTestBookings();
    
    setUsers(allUsers);
    setDoctors(allDoctors);
    setFilteredDoctors(allDoctors); // Initially show all doctors
    setAppointments(allAppointments);
    setPharmaCompanies(allPharmaCompanies);
    setSessions(allSessions);
    setMedicines(allMedicines);
    setAllMedicineOrders(allOrders);
    setLabTests(allLabTests);
    setAllLabTestBookings(allBookings);
    
    if (user) {
        setMedicineOrders(db.getMedicineOrdersForUser(user.id));
        setAddresses(db.getAddressesForUser(user.id));
        setLabTestBookings(db.getLabTestBookingsForUser(user.id));
        setUserAppointments(allAppointments.filter(a => a.userId === user.id));
    }

  }, [user]);
  
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshData();
      
      const validViewsForRole: Record<User['role'], string[]> = {
          patient: ['search', 'pharmacy', 'labTests', 'appointmentHistory', 'profile', 'orderHistory'],
          admin: ['search', 'dashboard', 'pharmacy', 'labTests', 'appointmentHistory', 'profile', 'orderHistory'],
          owner: ['search', 'ownerDashboard', 'pharmacy', 'labTests', 'appointmentHistory', 'profile', 'orderHistory']
      };
      
      const defaultViewForRole: Record<User['role'], 'search' | 'dashboard' | 'ownerDashboard'> = {
          patient: 'search',
          admin: 'dashboard',
          owner: 'ownerDashboard'
      };
      
      if(!validViewsForRole[user.role].includes(currentView)){
          setCurrentView(defaultViewForRole[user.role]);
      }
      
      const storageKey = `welcomeModalShown_for_user_${user.id}`;
      const hasSeenModal = localStorage.getItem(storageKey);
      if (!hasSeenModal) {
        setShowWelcomeModal(true);
        localStorage.setItem(storageKey, 'true');
      }

      // Check for appointment reminders
      const checkReminders = () => {
          const userAppointments = db.getAllAppointments().filter(a => a.userId === user.id);
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const tomorrow = new Date();
          tomorrow.setDate(now.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];

          const upcomingAppointments = userAppointments.filter(appt => {
              if (!appt.appointment_date) return false;

              if (appt.appointment_date === todayStr || appt.appointment_date === tomorrowStr) {
                  if (appt.appointment_date === todayStr) {
                      const parseTime = (timeStr: string): { hours: number, minutes: number } => {
                          const [time, modifier] = timeStr.split(' ');
                          let [h, m] = time.split(':').map(Number);
                          if (modifier === 'PM' && h < 12) h += 12;
                          if (modifier === 'AM' && h === 12) h = 0;
                          return { hours: h, minutes: m };
                      };
                      const { hours, minutes } = parseTime(appt.appointment_time);
                      const apptDateTime = new Date(appt.appointment_date + 'T00:00:00');
                      apptDateTime.setHours(hours, minutes);
                      return apptDateTime > now;
                  }
                  return true;
              }
              return false;
          });
          
          const shownReminders = JSON.parse(sessionStorage.getItem('shownReminders') || '[]');
          const newReminders = upcomingAppointments.filter(a => !shownReminders.includes(a.id));

          if (newReminders.length > 0) {
              setReminders(prev => [...prev, ...newReminders]);
              sessionStorage.setItem('shownReminders', JSON.stringify([...shownReminders, ...newReminders.map(r => r.id)]));
          }
      };
      checkReminders();

    }
  }, [isAuthenticated, user, currentView, refreshData]);

  const handleSearch = () => {
    const results = db.getDoctors(location, specialty);
    setFilteredDoctors(results);
  };

  const handleAiRecommendation = (recommendedSpecialty: string) => {
    setSpecialty(recommendedSpecialty);
    const results = db.getDoctors(location, recommendedSpecialty);
    setFilteredDoctors(results);
  };

  const handleBookAppointment = useCallback(async (data: AppointmentIn) => {
    await db.bookAppointment(data);
    refreshData();
    const doctor = doctors.find(d => d.id === data.doctor_id);
    if (doctor) {
        setBotMessage({
            role: 'model',
            text: `Great news! Your appointment with Dr. ${doctor.name} for ${data.appointment_time} on ${new Date(data.appointment_date + 'T00:00:00').toLocaleDateString()} is confirmed.`
        });
    }
  }, [refreshData, doctors]);

  const handleSelectSlot = (doctor: Doctor, slot: string) => {
    setBookingDoctor(doctor);
    setSelectedSlot(slot);
  };

  const handleSelectLabTest = (test: LabTest) => {
    setBookingLabTest(test);
  };
  
  const handleStartVideoCall = (doctor: Doctor) => {
    setVideoCallDoctor(doctor);
  };

  const handleEndVideoCall = () => {
    setVideoCallDoctor(null);
     setBotMessage({
        role: 'model',
        text: `Your video call has ended. Is there anything else I can help you with?`
    });
  };
  
  const handleDismissReminder = (id: number) => {
      setReminders(prev => prev.filter(r => r.id !== id));
  };


  const clearFilters = () => {
      setLocation('');
      setSpecialty('');
      setFilteredDoctors(doctors);
  };

  const handlePlaceOrder = useCallback((userId: number, cart: { [medicineId: number]: number }, address: Address, deliveryFee: number, promiseFee: number): MedicineOrder => {
    const newOrder = db.placeMedicineOrder(userId, cart, address, deliveryFee, promiseFee);
    refreshData();
    return newOrder;
  }, [refreshData]);

  const handleBookLabTest = useCallback((data: LabTestBookingIn): { message: string } => {
    const result = db.bookLabTest(data);
    refreshData();
     const test = labTests.find(t => t.id === data.testId);
    if (test) {
        setBotMessage({
            role: 'model',
            text: `Excellent! Your booking for the "${test.name}" test is confirmed. Our phlebotomist will visit for sample collection during your selected slot: ${data.slot}.`
        });
    }
    return result;
  }, [refreshData, labTests]);
  
  const renderView = () => {
    if (videoCallDoctor) {
        return <VideoCallView doctor={videoCallDoctor} onEndCall={handleEndVideoCall} />;
    }
    if (currentView === 'profile' && user) {
        return <UserProfile user={user} addresses={addresses} onDataRefresh={refreshData} />;
    }
    if (currentView === 'orderHistory' && user) {
        return <OrderHistoryView medicineOrders={medicineOrders} labTestBookings={labTestBookings} />;
    }
    if (currentView === 'appointmentHistory') {
        return <AppointmentHistoryView appointments={userAppointments} />;
    }
    if (currentView === 'labTests' && user) {
        return <LabTestsView tests={labTests} bookings={labTestBookings} user={user} addresses={addresses} onBookTest={handleBookLabTest} onDataRefresh={refreshData} />;
    }
    if (currentView === 'pharmacy' && user) {
        return <PharmacyView medicines={medicines} orders={medicineOrders} addresses={addresses} onPlaceOrder={handlePlaceOrder} user={user} onDataRefresh={refreshData} />;
    }
    
    if (user?.role === 'owner') {
      switch(currentView) {
        case 'ownerDashboard':
            return <OwnerDashboard users={users} doctors={doctors} appointments={appointments} authLogs={authLogs} pharmaCompanies={pharmaCompanies} sessions={sessions} medicineOrders={allMedicineOrders} labTestBookings={allLabTestBookings} />;
        case 'search':
        default:
          // Owners can also search, so fall through to the search view
          break;
      }
    }

    if (user?.role === 'admin') {
      switch(currentView) {
        case 'dashboard':
          return <AdminDashboard 
                    doctors={doctors} 
                    appointments={appointments} 
                    authLogs={authLogs} 
                    pharmaCompanies={pharmaCompanies} 
                    sessions={sessions}
                    allMedicineOrders={allMedicineOrders}
                    medicines={medicines}
                    allLabTestBookings={allLabTestBookings}
                    refreshData={refreshData}
                 />;
        case 'search':
        default:
          // Admins can also search, so fall through to the search view
          break;
      }
    }
    
    return (
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Find Your Doctor</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                        <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Patna" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                    </div>
                    <div>
                        <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specialty</label>
                        <input type="text" id="specialty" value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="e.g., Dentist" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={handleSearch} className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                       <SearchIcon className="w-5 h-5 mr-2" /> Search
                    </button>
                     <button onClick={clearFilters} className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                        Clear Filters
                    </button>
                </div>
            </div>
            <div className="lg:col-span-1">
                <AiRecommender onRecommendation={handleAiRecommendation} />
            </div>
        </div>

        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doctor => (
              <DoctorCard 
                key={doctor.id} 
                doctor={doctor} 
                onBook={handleSelectSlot}
                onVideoCall={handleStartVideoCall} 
              />
            ))}
          </div>
        ) : (
            <div className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <StethoscopeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Doctors Found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search filters or use the AI recommender to find a specialty.
                </p>
            </div>
        )}
      </div>
    );
  };

  if (!permissionsGranted) {
    return <PermissionGate onAllow={() => setPermissionsGranted(true)} />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header currentView={currentView} setCurrentView={setCurrentView} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>

      {bookingDoctor && selectedSlot && (
        <BookingModal
          doctor={bookingDoctor}
          selectedSlot={selectedSlot}
          onClose={() => {
            setBookingDoctor(null);
            setSelectedSlot(null);
          }}
          onBook={handleBookAppointment}
        />
      )}

      {bookingLabTest && user && (
        <LabTestBookingModal
            test={bookingLabTest}
            addresses={addresses}
            user={user}
            onClose={() => setBookingLabTest(null)}
            onBook={handleBookLabTest}
            onDataRefresh={refreshData}
        />
      )}

      {showWelcomeModal && user && <WelcomeModal onClose={() => setShowWelcomeModal(false)} userName={user.firstName} />}

      <div className="fixed top-24 right-4 z-[100] space-y-4">
          {reminders.map(appt => (
              <ReminderToast 
                  key={appt.id} 
                  appointment={appt} 
                  onDismiss={handleDismissReminder} 
              />
          ))}
      </div>

      <Chatbot 
        doctors={doctors} 
        labTests={labTests}
        onBookAppointment={handleSelectSlot}
        onBookLabTest={handleSelectLabTest}
        setCurrentView={setCurrentView}
        onStartVideoCall={handleStartVideoCall}
        newMessage={botMessage}
        onNewMessageConsumed={() => setBotMessage(null)}
      />
    </div>
  );
};

export default App;