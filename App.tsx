

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
import { useMockDb } from './hooks/useMockDb';
import { User, Doctor, Appointment, AppointmentIn, PharmaCompany, UserSession, Medicine, MedicineOrder, Address, LabTest, LabTestBooking, LabTestBookingIn, Message, MedicineReminder, LabTestReminder } from './types';
import { SearchIcon, StethoscopeIcon, ClockIcon, PillIcon, TestTubeIcon } from './components/IconComponents';
import LabTestBookingModal from './components/LabTestBookingModal';
import AvailabilityModal from './components/AvailabilityModal';
import DoctorDetailModal from './components/DoctorDetailModal';
import Sidebar from './components/Sidebar';
import PatientSidebar from './components/PatientSidebar';
import MedicineReminderModal from './components/MedicineReminderModal';
import LabTestReminderModal from './components/LabTestReminderModal';
import { parseTime } from './utils/timeUtils';


interface GenericReminder {
  id: string;
  title: string;
  message: string;
  icon: React.ReactNode;
}

const App: React.FC = () => {
  const [permissionsGranted, setPermissionsGranted] = useState(localStorage.getItem('permissions-granted') === 'true');
  const { isAuthenticated, user, authLogs, logout } = useAuth();
  
  const {
      users,
      doctors,
      appointments,
      pharmaCompanies,
      sessions,
      medicines,
      allMedicineOrders,
      addresses,
      labTests,
      allLabTestBookings,
      userAppointments,
      medicineOrders,
      labTestBookings,
      medicineReminders,
      labTestReminders,
      refreshData
  } = useMockDb(user);

  const [currentView, setCurrentView] = useState<'search' | 'dashboard' | 'ownerDashboard' | 'pharmacy' | 'labTests' | 'appointmentHistory' | 'profile' | 'orderHistory'>('search');
  const [activeDashboardTab, setActiveDashboardTab] = useState<string>('overview');
  const [activeOrderHistoryTab, setActiveOrderHistoryTab] = useState<'medicines' | 'labTests'>('medicines');
  
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [selectedBookingInfo, setSelectedBookingInfo] = useState<{ date: string; slot: string } | null>(null);
  const [viewingAvailabilityForDoctor, setViewingAvailabilityForDoctor] = useState<Doctor | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);
  
  const [bookingLabTest, setBookingLabTest] = useState<LabTest | null>(null);
  const [videoCallDoctor, setVideoCallDoctor] = useState<Doctor | null>(null);
  
  const [appointmentReminders, setAppointmentReminders] = useState<Appointment[]>([]);
  const [notificationReminders, setNotificationReminders] = useState<Appointment[]>([]);
  const [genericReminders, setGenericReminders] = useState<GenericReminder[]>([]);
  const [reminderModalData, setReminderModalData] = useState<{type: 'medicine' | 'lab_test', data: any} | null>(null);

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [botMessage, setBotMessage] = useState<Message | null>(null);

  useEffect(() => {
    setFilteredDoctors(doctors);
  }, [doctors]);
  
  useEffect(() => {
    if (isAuthenticated && user) {
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
          setActiveDashboardTab('overview');
      }
      
      const storageKey = `welcomeModalShown_for_user_${user.id}`;
      const hasSeenModal = localStorage.getItem(storageKey);
      if (!hasSeenModal) {
        setShowWelcomeModal(true);
        localStorage.setItem(storageKey, 'true');
      }

      // Check for appointment reminders
      const checkAppointmentReminders = () => {
          const now = new Date();

          const upcomingAppointments = userAppointments.filter(appt => {
              if (appt.status !== 'Scheduled') return false;
              if (!appt.appointment_date || !appt.appointment_time) return false;

              // Construct the full appointment Date object for accurate comparison
              const [time, modifier] = appt.appointment_time.split(' ');
              let [hours, minutes] = time.split(':').map(Number);
              if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
              if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
              
              const [year, month, day] = appt.appointment_date.split('-').map(Number);
              const apptDateTime = new Date(year, month - 1, day, hours, minutes);

              // Check if the appointment is in the future
              if (apptDateTime < now) {
                  return false;
              }

              // Check if the appointment date is today or tomorrow
              const apptDateOnly = new Date(year, month - 1, day);
              const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const tomorrowDateOnly = new Date(todayDateOnly);
              tomorrowDateOnly.setDate(todayDateOnly.getDate() + 1);

              return apptDateOnly.getTime() === todayDateOnly.getTime() || apptDateOnly.getTime() === tomorrowDateOnly.getTime();
          });
          
          // For ephemeral toast notifications (shown once per session)
          const shownToastReminders = JSON.parse(sessionStorage.getItem('shownReminders') || '[]');
          const newRemindersForToast = upcomingAppointments.filter(a => !shownToastReminders.includes(a.id));

          if (newRemindersForToast.length > 0) {
              setAppointmentReminders(prev => [...prev, ...newRemindersForToast]);
              sessionStorage.setItem('shownReminders', JSON.stringify([...shownToastReminders, ...newRemindersForToast.map(r => r.id)]));
          }
          
          // For persistent notification center (respects dismissals within the session)
          const dismissedNotifications = JSON.parse(sessionStorage.getItem('dismissedNotifications') || '[]');
          const activeNotifications = upcomingAppointments.filter(a => !dismissedNotifications.includes(a.id));
          setNotificationReminders(activeNotifications);
      };
      checkAppointmentReminders();

    }
  }, [isAuthenticated, user, currentView, userAppointments]);
  
   // Centralized reminder checker
    useEffect(() => {
        const checkReminders = () => {
            if (!user) return;
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            
            const shownTodayKey = `shown-reminders-${todayStr}`;
            const shownToday = JSON.parse(localStorage.getItem(shownTodayKey) || '[]');

            const newReminders: GenericReminder[] = [];

            // 1. Medicine Reminders
            medicineReminders.forEach(mr => {
                const startDate = new Date(mr.startDate);
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + mr.durationDays);

                if (now >= startDate && now < endDate && mr.times.includes(currentTime)) {
                    const reminderId = `med-${mr.id}-${todayStr}-${currentTime}`;
                    if (!shownToday.includes(reminderId)) {
                        newReminders.push({
                            id: reminderId,
                            title: 'Medicine Reminder',
                            message: `Time to take your <strong>${mr.medicineName}</strong>.`,
                            icon: <PillIcon className="h-6 w-6 text-teal-500" />
                        });
                        shownToday.push(reminderId);
                    }
                }
            });

            // 2. Lab Test Reminders
            labTestReminders.forEach(lr => {
                const booking = labTestBookings.find(b => b.id === lr.labTestBookingId);
                if (booking && booking.status === 'Booked') {
                    // Assuming sample collection is the day after booking for this mock. A real app would store the collection date.
                    const collectionDate = new Date(booking.bookingDate);
                    collectionDate.setDate(collectionDate.getDate() + 1);

                    const slotTimeMatch = booking.slot.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))|(\d{1,2}\s*(?:AM|PM))/);
                    if (slotTimeMatch) {
                        const slotStartTimeStr = slotTimeMatch[0].includes(':') ? slotTimeMatch[0] : `${slotTimeMatch[0].split(' ')[0]}:00 ${slotTimeMatch[0].split(' ')[1]}`;
                        const slotStartTime = parseTime(slotStartTimeStr);
                        
                        collectionDate.setHours(slotStartTime.getHours(), slotStartTime.getMinutes());
                        
                        const reminderTime = new Date(collectionDate.getTime() - lr.remindBeforeMinutes * 60000);

                        if (now.getFullYear() === reminderTime.getFullYear() &&
                            now.getMonth() === reminderTime.getMonth() &&
                            now.getDate() === reminderTime.getDate() &&
                            now.getHours() === reminderTime.getHours() &&
                            now.getMinutes() === reminderTime.getMinutes()
                        ) {
                             const reminderId = `lab-${lr.id}`;
                             if (!shownToday.includes(reminderId)) {
                                newReminders.push({
                                    id: reminderId,
                                    title: 'Lab Test Reminder',
                                    message: `Your sample collection for <strong>${lr.testName}</strong> is in ${lr.remindBeforeMinutes} minutes.`,
                                    icon: <TestTubeIcon className="h-6 w-6 text-teal-500" />
                                });
                                shownToday.push(reminderId);
                            }
                        }
                    }
                }
            });

            if (newReminders.length > 0) {
                setGenericReminders(prev => [...prev, ...newReminders]);
                localStorage.setItem(shownTodayKey, JSON.stringify(shownToday));
            }
        };

        const intervalId = setInterval(checkReminders, 60000); // Check every minute
        checkReminders(); // Initial check

        return () => clearInterval(intervalId);
    }, [user, medicineReminders, labTestReminders, labTestBookings]);


  const handleSearch = () => {
    const results = db.getDoctors(location, specialty);
    setFilteredDoctors(results);
  };

  const handleAiRecommendation = (recommendedSpecialty: string) => {
    setSpecialty(recommendedSpecialty);
    const results = db.getDoctors(location, recommendedSpecialty);
    setFilteredDoctors(results);
  };

  const handleBookAppointment = useCallback(async (data: AppointmentIn): Promise<Appointment> => {
    const newAppointment = await db.bookAppointment(data);
    refreshData();
    const doctor = doctors.find(d => d.id === data.doctor_id);
    if (doctor) {
        setBotMessage({
            role: 'model',
            text: `Great news! Your appointment with Dr. ${doctor.name} for ${data.appointment_time} on ${new Date(data.appointment_date + 'T00:00:00').toLocaleDateString()} is confirmed.`
        });
    }
    return newAppointment;
  }, [refreshData, doctors]);

  const handleCancelAppointment = useCallback((appointmentId: number, reason: string) => {
    db.updateAppointmentStatus(appointmentId, 'Cancelled', reason);
    refreshData();
  }, [refreshData]);

  const handleSelectSlot = (doctor: Doctor, date: string, slot: string) => {
    setBookingDoctor(doctor);
    setSelectedBookingInfo({ date, slot });
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
  
  const handleDismissAppointmentReminder = (id: number) => {
      setAppointmentReminders(prev => prev.filter(r => r.id !== id));
  };
  
  const handleDismissGenericReminder = (id: string) => {
      setGenericReminders(prev => prev.filter(r => r.id !== id));
  };
  
  const handleDismissNotification = (id: number) => {
      const dismissed = JSON.parse(sessionStorage.getItem('dismissedNotifications') || '[]');
      sessionStorage.setItem('dismissedNotifications', JSON.stringify([...dismissed, id]));
      setNotificationReminders(prev => prev.filter(r => r.id !== id));
  };

  const handleDismissAllNotifications = () => {
    const dismissed = JSON.parse(sessionStorage.getItem('dismissedNotifications') || '[]');
    const allCurrentNotificationIds = notificationReminders.map(n => n.id);
    const newDismissed = [...new Set([...dismissed, ...allCurrentNotificationIds])];
    sessionStorage.setItem('dismissedNotifications', JSON.stringify(newDismissed));
    setNotificationReminders([]);
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
        return <UserProfile user={user} addresses={addresses} appointments={userAppointments} onDataRefresh={refreshData} />;
    }
    if (currentView === 'orderHistory' && user) {
        return <OrderHistoryView 
            medicineOrders={medicineOrders} 
            labTestBookings={labTestBookings} 
            activeTab={activeOrderHistoryTab} 
            setActiveTab={setActiveOrderHistoryTab}
            medicineReminders={medicineReminders}
            labTestReminders={labTestReminders}
            onSetMedicineReminder={(order, item) => setReminderModalData({ type: 'medicine', data: { order, item } })}
            onSetLabTestReminder={(booking) => setReminderModalData({ type: 'lab_test', data: booking })}
        />;
    }
    if (currentView === 'appointmentHistory') {
        return <AppointmentHistoryView appointments={userAppointments} onCancelAppointment={handleCancelAppointment} />;
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
            return <OwnerDashboard 
                        activeTab={activeDashboardTab} 
                        users={users} 
                        doctors={doctors} 
                        appointments={appointments} 
                        authLogs={authLogs} 
                        pharmaCompanies={pharmaCompanies} 
                        sessions={sessions} 
                        allMedicineOrders={allMedicineOrders}
                        allLabTestBookings={allLabTestBookings}
                        medicines={medicines}
                        labTests={labTests}
                        refreshData={refreshData}
                    />;
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
                    activeTab={activeDashboardTab}
                    users={users}
                    doctors={doctors} 
                    appointments={appointments} 
                    authLogs={authLogs} 
                    pharmaCompanies={pharmaCompanies} 
                    sessions={sessions}
                    allMedicineOrders={allMedicineOrders}
                    medicines={medicines}
                    allLabTestBookings={allLabTestBookings}
                    labTests={labTests}
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
                onClick={setViewingDoctor}
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

  const isAdminOrOwner = user && (user.role === 'admin' || user.role === 'owner');
  const isDashboardView = currentView === 'dashboard' || currentView === 'ownerDashboard';
  const isPatientDashboardView = user?.role === 'patient' && ['profile', 'appointmentHistory', 'orderHistory'].includes(currentView);

  if (!permissionsGranted) {
    return <PermissionGate onAllow={() => setPermissionsGranted(true)} />;
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        activeDashboardTab={activeDashboardTab}
        setActiveDashboardTab={setActiveDashboardTab}
        notifications={notificationReminders}
        onDismissNotification={handleDismissNotification}
        onDismissAllNotifications={handleDismissAllNotifications}
        activeOrderHistoryTab={activeOrderHistoryTab}
        setActiveOrderHistoryTab={setActiveOrderHistoryTab}
      />
      <div className="relative flex">
         {isAdminOrOwner && isDashboardView && (
            <Sidebar
                user={user}
                logout={logout}
                activeTab={activeDashboardTab}
                setActiveTab={setActiveDashboardTab}
                setCurrentView={setCurrentView}
            />
        )}
        {isPatientDashboardView && (
             <PatientSidebar 
                activeView={currentView}
                setCurrentView={setCurrentView as any}
                activeOrderHistoryTab={activeOrderHistoryTab}
                setActiveOrderHistoryTab={setActiveOrderHistoryTab}
             />
        )}
        <main className={`w-full transition-all duration-300 ${(isAdminOrOwner && isDashboardView) || isPatientDashboardView ? 'lg:pl-64' : ''}`}>
          <div className={`${(isAdminOrOwner && isDashboardView) || isPatientDashboardView ? 'p-4 sm:p-6 lg:p-8' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
            {renderView()}
          </div>
        </main>
      </div>

      {viewingDoctor && (
        <DoctorDetailModal
          doctor={viewingDoctor}
          onClose={() => setViewingDoctor(null)}
          onSelectSlot={(date, slot) => {
              handleSelectSlot(viewingDoctor, date, slot);
              setViewingDoctor(null);
          }}
          onVideoCall={(doctor) => {
            setViewingDoctor(null);
            handleStartVideoCall(doctor);
          }}
        />
      )}

      {viewingAvailabilityForDoctor && (
        <AvailabilityModal
            doctor={viewingAvailabilityForDoctor}
            onClose={() => setViewingAvailabilityForDoctor(null)}
            onSelectSlot={(date, slot) => {
                handleSelectSlot(viewingAvailabilityForDoctor, date, slot);
                setViewingAvailabilityForDoctor(null);
            }}
        />
      )}

      {bookingDoctor && selectedBookingInfo && (
        <BookingModal
          doctor={bookingDoctor}
          selectedDate={selectedBookingInfo.date}
          selectedSlot={selectedBookingInfo.slot}
          onClose={() => {
            setBookingDoctor(null);
            setSelectedBookingInfo(null);
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

       {reminderModalData?.type === 'medicine' && user &&
            <MedicineReminderModal
                isOpen={true}
                onClose={() => setReminderModalData(null)}
                onSave={() => {
                    refreshData();
                    setReminderModalData(null);
                }}
                userId={user.id}
                order={reminderModalData.data.order}
                item={reminderModalData.data.item}
                existingReminder={medicineReminders.find(r => r.orderId === reminderModalData.data.order.id && r.medicineId === reminderModalData.data.item.medicineId)}
            />
        }
        {reminderModalData?.type === 'lab_test' && user &&
            <LabTestReminderModal
                isOpen={true}
                onClose={() => setReminderModalData(null)}
                onSave={() => {
                    refreshData();
                    setReminderModalData(null);
                }}
                userId={user.id}
                booking={reminderModalData.data}
                existingReminder={labTestReminders.find(r => r.labTestBookingId === reminderModalData.data.id)}
            />
        }


      {showWelcomeModal && user && <WelcomeModal onClose={() => setShowWelcomeModal(false)} userName={user.firstName} />}

      <div className="fixed top-24 right-4 z-[100] space-y-4">
          {appointmentReminders.map(appt => {
            const isToday = new Date().toISOString().split('T')[0] === appt.appointment_date;
            const message = `You have an upcoming appointment with <strong>${appt.doctor_name}</strong> ${isToday ? `at ${appt.appointment_time} today.` : `at ${appt.appointment_time} tomorrow.`}`;
            return (
              <ReminderToast 
                  key={`appt-${appt.id}`} 
                  reminder={{
                    id: `appt-${appt.id}`,
                    title: 'Appointment Reminder',
                    message: message,
                    icon: <ClockIcon className="h-6 w-6 text-teal-500" />
                  }} 
                  onDismiss={() => handleDismissAppointmentReminder(appt.id)} 
              />
            )
          })}
          {genericReminders.map(reminder => (
              <ReminderToast 
                  key={reminder.id} 
                  reminder={reminder} 
                  onDismiss={handleDismissGenericReminder} 
              />
          ))}
      </div>

      <Chatbot 
        doctors={doctors} 
        labTests={labTests}
        appointments={userAppointments}
        labTestBookings={labTestBookings}
        onBookLabTest={handleSelectLabTest}
        onShowAvailability={setViewingAvailabilityForDoctor}
        onViewDoctorDetails={setViewingDoctor}
        setCurrentView={setCurrentView}
        onStartVideoCall={handleStartVideoCall}
        newMessage={botMessage}
        onNewMessageConsumed={() => setBotMessage(null)}
        user={user}
        addresses={addresses}
        onBookAppointment={handleBookAppointment}
        onConfirmBookLabTest={handleBookLabTest}
      />
    </div>
  );
};

export default App;