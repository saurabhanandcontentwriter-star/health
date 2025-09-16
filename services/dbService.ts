import { Doctor, Appointment, DoctorIn, AppointmentIn, AuthLog, User, PharmaCompany, UserSession, Medicine, MedicineOrder, Address, MedicineIn, LabTest, LabTestBooking, LabTestBookingIn, DeliveryBoy, LabTestIn } from '../types';
import { GST_RATE } from '../utils/constants';

// Keys for localStorage
const DOCTORS_KEY = 'bhc-doctors';
const APPOINTMENTS_KEY = 'bhc-appointments';
const AUTH_LOGS_KEY = 'bhc-auth-logs';
const USERS_KEY = 'bhc-users';
const PHARMA_COMPANIES_KEY = 'bhc-pharma-companies';
const SESSIONS_KEY = 'bhc-sessions';
const MEDICINES_KEY = 'bhc-medicines';
const MEDICINE_ORDERS_KEY = 'bhc-medicine-orders';
const ADDRESSES_KEY = 'bhc-addresses';
const LAB_TESTS_KEY = 'bhc-lab-tests';
const LAB_TEST_BOOKINGS_KEY = 'bhc-lab-test-bookings';
const WISHLIST_KEY_PREFIX = 'bhc-wishlist-';

// --- Helper Functions ---
const getFromStorage = <T>(key: string, defaultValue: T): T => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
};

const saveToStorage = <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
};

// --- Initial Data ---
const initialDoctors: Doctor[] = [
    { id: 1, name: 'Ramesh Kumar', specialty: 'General Physician', location: 'Patna', available_time: '10:00 AM - 1:00 PM', imageUrl: 'https://placehold.co/100x100/e0f2fe/0891b2?text=RK' },
    { id: 2, name: 'Sunita Sharma', specialty: 'Dentist', location: 'Nalanda', available_time: '2:00 PM - 5:00 PM', imageUrl: 'https://placehold.co/100x100/fecaca/991b1b?text=SS' },
    { id: 3, name: 'Vijay Singh', specialty: 'Cardiologist', location: 'Patna', available_time: '9:00 AM - 12:00 PM', imageUrl: 'https://placehold.co/100x100/d1fae5/065f46?text=VS' },
    { id: 4, name: 'Anjali Verma', specialty: 'Dermatologist', location: 'Gaya', available_time: '11:00 AM - 3:00 PM', imageUrl: 'https://placehold.co/100x100/ede9fe/5b21b6?text=AV' },
    { id: 5, name: 'Deepak Gupta', specialty: 'Pediatrician', location: 'Muzaffarpur', available_time: '10:00 AM - 4:00 PM', imageUrl: 'https://placehold.co/100x100/fee2e2/991b1b?text=DG' },
    { id: 6, name: 'Priya Mehta', specialty: 'Gynecologist', location: 'Patna', available_time: '1:00 PM - 6:00 PM', imageUrl: 'https://placehold.co/100x100/fce7f3/831843?text=PM' }
];

const initialUsers: User[] = [
    { id: 1, firstName: 'Amit', lastName: 'Kumar', phone: '1234567890', role: 'patient', profileImageUrl: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 2, firstName: 'Admin', lastName: 'User', phone: '1111111111', role: 'admin' },
    { id: 3, firstName: 'Sunita', lastName: 'Devi', phone: '0987654321', role: 'patient', profileImageUrl: 'https://randomuser.me/api/portraits/women/1.jpg' },
    { id: 4, firstName: 'Owner', lastName: 'User', phone: '2222222222', role: 'owner' },
];

const initialMedicines: Medicine[] = [
    { id: 1, name: 'Paracetamol 500mg', mrp: 30.00, price: 25.50, description: 'For fever and pain relief. 10 tablets.', imageUrl: 'https://placehold.co/300x200/e0f2fe/0891b2?text=Paracetamol' },
    { id: 2, name: 'Aspirin 75mg', mrp: 25.00, price: 22.00, description: 'Blood thinner. 14 tablets.', imageUrl: 'https://placehold.co/300x200/d1fae5/065f46?text=Aspirin' },
    { id: 3, name: 'Cetirizine 10mg', mrp: 55.00, price: 48.75, description: 'Anti-allergic medication. 10 tablets.', imageUrl: 'https://placehold.co/300x200/fef3c7/92400e?text=Cetirizine' },
    { id: 4, name: 'Vicks Action 500', mrp: 45.00, price: 42.10, description: 'Relief from cold and flu symptoms. 8 tablets.', imageUrl: 'https://placehold.co/300x200/fce7f3/9d2664?text=Vicks' },
    { id: 5, name: 'Band-Aid (Assorted)', mrp: 120.00, price: 110.00, description: 'Waterproof adhesive bandages. 20 strips.', imageUrl: 'https://placehold.co/300x200/e5e7eb/4b5563?text=Band-Aid' },
    { id: 6, name: 'Dettol Antiseptic', mrp: 80.00, price: 75.00, description: 'Antiseptic liquid for first aid. 125ml bottle.', imageUrl: 'https://placehold.co/300x200/cffafe/0e7490?text=Dettol' },
    { id: 7, name: 'ORS Powder', mrp: 20.00, price: 18.50, description: 'Oral rehydration salts. 21.8g sachet.', imageUrl: 'https://placehold.co/300x200/ffedd5/9a3412?text=ORS' },
    { id: 8, name: 'Digene Gel', mrp: 130.00, price: 121.00, description: 'For acidity and gas relief. 200ml bottle.', imageUrl: 'https://placehold.co/300x200/f3e8ff/6b21a8?text=Digene' }
];

const initialLabTests: LabTest[] = [
    { id: 1, name: 'Complete Blood Count (CBC)', description: 'Measures different components of your blood.', price: 350, mrp: 500, preparations: 'No special preparation needed.', includes: ['Hemoglobin', 'RBC Count', 'WBC Count', 'Platelet Count'], imageUrl: 'https://placehold.co/300x200/e0f2fe/0891b2?text=CBC' },
    { id: 2, name: 'Thyroid Profile (T3, T4, TSH)', description: 'Checks for thyroid gland problems.', price: 800, mrp: 1200, preparations: 'Fasting for 8-10 hours recommended.', includes: ['Total T3', 'Total T4', 'TSH'], imageUrl: 'https://placehold.co/300x200/fef3c7/92400e?text=Thyroid' },
    { id: 3, name: 'Lipid Profile', description: 'Measures cholesterol and triglycerides.', price: 900, mrp: 1500, preparations: 'Fasting for 10-12 hours is required.', includes: ['Total Cholesterol', 'Triglycerides', 'HDL', 'LDL'], imageUrl: 'https://placehold.co/300x200/d1fae5/065f46?text=Lipid' },
    { id: 4, name: 'HbA1c (Glycosylated Hemoglobin)', description: 'Monitors long-term blood sugar control.', price: 500, mrp: 750, preparations: 'No fasting required.', includes: ['HbA1c Level', 'Estimated Average Glucose'], imageUrl: 'https://placehold.co/300x200/fecaca/991b1b?text=HbA1c' }
];


// --- Initialization ---
const initializeData = () => {
    if (!localStorage.getItem(DOCTORS_KEY)) saveToStorage(DOCTORS_KEY, initialDoctors);
    if (!localStorage.getItem(USERS_KEY)) saveToStorage(USERS_KEY, initialUsers);
    if (!localStorage.getItem(MEDICINES_KEY)) saveToStorage(MEDICINES_KEY, initialMedicines);
    if (!localStorage.getItem(LAB_TESTS_KEY)) saveToStorage(LAB_TESTS_KEY, initialLabTests);
};
initializeData();

// --- Doctor Management ---
export const getDoctors = (location = '', specialty = ''): Doctor[] => {
    let doctors = getFromStorage<Doctor[]>(DOCTORS_KEY, []);
    if (location) {
        doctors = doctors.filter(d => d.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (specialty) {
        doctors = doctors.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
    }
    return doctors;
};

export const addDoctor = (doctorData: DoctorIn): void => {
    const doctors = getDoctors();
    const newId = doctors.length > 0 ? Math.max(...doctors.map(d => d.id)) + 1 : 1;
    const newDoctor: Doctor = { id: newId, ...doctorData };
    doctors.push(newDoctor);
    saveToStorage(DOCTORS_KEY, doctors);
};

export const updateDoctor = (updatedDoctor: Doctor): void => {
    let doctors = getDoctors();
    doctors = doctors.map(doc => doc.id === updatedDoctor.id ? updatedDoctor : doc);
    saveToStorage(DOCTORS_KEY, doctors);
};

export const deleteDoctor = (id: number): void => {
    let doctors = getDoctors();
    doctors = doctors.filter(doc => doc.id !== id);
    saveToStorage(DOCTORS_KEY, doctors);
};


// --- Appointment Management ---
export const getAllAppointments = (): Appointment[] => getFromStorage<Appointment[]>(APPOINTMENTS_KEY, []);

export const bookAppointment = async (data: AppointmentIn): Promise<Appointment> => {
    const appointments = getAllAppointments();
    const doctor = getDoctors().find(d => d.id === data.doctor_id);
    if (!doctor) throw new Error('Doctor not found for booking.');

    const newId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;

    let report_pdf_base64: string | undefined = undefined;
    if (data.report_pdf_file) {
        report_pdf_base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(data.report_pdf_file!);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }
    
    const newAppointment: Appointment = {
        id: newId,
        userId: data.userId,
        patient_name: data.patient_name,
        doctor_id: data.doctor_id,
        doctor_name: doctor.name,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        created_at: new Date().toISOString(),
        is_repeat_visit: data.is_repeat_visit,
        heart_beat_rate: data.heart_beat_rate ? Number(data.heart_beat_rate) : null,
        symptoms: data.symptoms,
        blood_test_notes: data.blood_test_notes,
        nutrition_notes: data.nutrition_notes,
        report_pdf_base64,
        status: 'Scheduled',
    };
    appointments.push(newAppointment);
    saveToStorage(APPOINTMENTS_KEY, appointments);
    return newAppointment;
};

export const updateAppointmentStatus = (id: number, status: Appointment['status']): void => {
    let appointments = getAllAppointments();
    const index = appointments.findIndex(appt => appt.id === id);
    if (index !== -1) {
        appointments[index].status = status;
        saveToStorage(APPOINTMENTS_KEY, appointments);
    } else {
        throw new Error("Appointment not found");
    }
};

// --- User Management ---
export const getUsers = (): User[] => getFromStorage<User[]>(USERS_KEY, []);
export const getUserByPhone = (phone: string): User | undefined => getUsers().find(u => u.phone === phone);
export const checkUserExists = (phone: string): boolean => !!getUserByPhone(phone);

export const addUser = (userData: Omit<User, 'id' | 'role' | 'profileImageUrl'> & { email?: string }): User => {
    const users = getUsers();
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser: User = { 
        id: newId, 
        ...userData, 
        role: 'patient',
        email: userData.email || undefined
    };
    users.push(newUser);
    saveToStorage(USERS_KEY, users);
    return newUser;
};

export const updateUser = (updatedUser: User): void => {
    let users = getUsers();
    users = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    saveToStorage(USERS_KEY, users);
};


// --- Auth Log Management ---
export const getAuthLogs = (): AuthLog[] => getFromStorage<AuthLog[]>(AUTH_LOGS_KEY, []);

export const addAuthLog = (logData: Omit<AuthLog, 'timestamp'>): void => {
    const logs = getAuthLogs();
    const newLog: AuthLog = { ...logData, timestamp: new Date().toISOString() };
    logs.unshift(newLog); // Add to the beginning
    saveToStorage(AUTH_LOGS_KEY, logs.slice(0, 50)); // Keep last 50 logs
};


// --- Pharma Company Management ---
export const getPharmaCompanies = (): PharmaCompany[] => getFromStorage<PharmaCompany[]>(PHARMA_COMPANIES_KEY, []);

// --- Session Management ---
export const getAllSessions = (): UserSession[] => getFromStorage<UserSession[]>(SESSIONS_KEY, []).sort((a,b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
export const addSession = (sessionData: Omit<UserSession, 'id'>): void => {
    const sessions = getAllSessions();
    const newId = sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 1;
    sessions.unshift({ id: newId, ...sessionData });
    saveToStorage(SESSIONS_KEY, sessions.slice(0, 100)); // Keep last 100 sessions
};

// --- Medicine Management ---
export const getMedicines = (): Medicine[] => getFromStorage<Medicine[]>(MEDICINES_KEY, []);
export const addMedicine = (medData: MedicineIn): void => {
    const medicines = getMedicines();
    const newId = medicines.length > 0 ? Math.max(...medicines.map(m => m.id)) + 1 : 1;
    medicines.push({ id: newId, ...medData });
    saveToStorage(MEDICINES_KEY, medicines);
};
export const updateMedicine = (updatedMedicine: Medicine): void => {
    let medicines = getMedicines();
    medicines = medicines.map(med => med.id === updatedMedicine.id ? updatedMedicine : med);
    saveToStorage(MEDICINES_KEY, medicines);
};
export const deleteMedicine = (id: number): void => {
    let medicines = getMedicines();
    medicines = medicines.filter(med => med.id !== id);
    saveToStorage(MEDICINES_KEY, medicines);
};

// --- Medicine Order Management ---
export const getAllMedicineOrders = (): MedicineOrder[] => getFromStorage<MedicineOrder[]>(MEDICINE_ORDERS_KEY, []).sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
export const getMedicineOrdersForUser = (userId: number): MedicineOrder[] => getAllMedicineOrders().filter(o => o.userId === userId);
export const placeMedicineOrder = (userId: number, cart: { [medicineId: number]: number }, address: Address, deliveryFee: number, promiseFee: number): MedicineOrder => {
    const allOrders = getAllMedicineOrders();
    const allMedicines = getMedicines();
    
    const items = Object.entries(cart).map(([medId, quantity]) => {
        const medicine = allMedicines.find(m => m.id === Number(medId));
        if (!medicine) throw new Error(`Medicine with ID ${medId} not found.`);
        return { medicineId: medicine.id, medicineName: medicine.name, quantity, price: medicine.price, mrp: medicine.mrp };
    });

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalMrp = items.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
    const savings = totalMrp - subtotal;
    const gst = subtotal * GST_RATE;
    const totalAmount = subtotal + gst + deliveryFee + promiseFee;
    
    const newId = allOrders.length > 0 ? Math.max(...allOrders.map(o => o.id)) + 1 : 1;
    const newOrder: MedicineOrder = {
        id: newId,
        userId,
        items,
        deliveryAddress: address,
        subtotal,
        savings,
        gst,
        deliveryFee,
        totalAmount,
        status: 'Processing',
        orderDate: new Date().toISOString(),
        deliveryBoy: null,
        trackingHistory: [{ status: 'Order Placed', timestamp: new Date().toISOString() }]
    };
    allOrders.push(newOrder);
    saveToStorage(MEDICINE_ORDERS_KEY, allOrders);
    return newOrder;
};
export const updateMedicineOrderStatus = (orderId: number, newStatus: MedicineOrder['status']): void => {
    let orders = getAllMedicineOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
        orders[index].status = newStatus;
        orders[index].trackingHistory.push({ status: newStatus, timestamp: new Date().toISOString() });
        saveToStorage(MEDICINE_ORDERS_KEY, orders);
    } else {
        throw new Error("Medicine order not found");
    }
};


// --- Address Management ---
export const getAddressesForUser = (userId: number): Address[] => getFromStorage<Address[]>(ADDRESSES_KEY, []).filter(a => a.userId === userId);
export const addAddress = (addressData: Omit<Address, 'id'>): void => {
    const addresses = getFromStorage<Address[]>(ADDRESSES_KEY, []);
    const newId = addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1;
    addresses.push({ id: newId, ...addressData });
    saveToStorage(ADDRESSES_KEY, addresses);
};
export const updateAddress = (id: number, updatedAddressData: Omit<Address, 'id'>): void => {
    let addresses = getFromStorage<Address[]>(ADDRESSES_KEY, []);
    addresses = addresses.map(addr => addr.id === id ? { id, ...updatedAddressData } : addr);
    saveToStorage(ADDRESSES_KEY, addresses);
};
export const deleteAddress = (id: number): void => {
    let addresses = getFromStorage<Address[]>(ADDRESSES_KEY, []);
    addresses = addresses.filter(addr => addr.id !== id);
    saveToStorage(ADDRESSES_KEY, addresses);
};

// --- Lab Test Management ---
export const getLabTests = (): LabTest[] => getFromStorage<LabTest[]>(LAB_TESTS_KEY, []);
export const addLabTest = (testData: LabTestIn): void => {
    const tests = getLabTests();
    const newId = tests.length > 0 ? Math.max(...tests.map(t => t.id)) + 1 : 1;
    tests.push({ id: newId, ...testData });
    saveToStorage(LAB_TESTS_KEY, tests);
};
export const updateLabTest = (updatedTest: LabTest): void => {
    let tests = getLabTests();
    tests = tests.map(t => t.id === updatedTest.id ? updatedTest : t);
    saveToStorage(LAB_TESTS_KEY, tests);
};
export const deleteLabTest = (id: number): void => {
    let tests = getLabTests();
    tests = tests.filter(t => t.id !== id);
    saveToStorage(LAB_TESTS_KEY, tests);
};

// --- Lab Test Booking Management ---
export const getAllLabTestBookings = (): LabTestBooking[] => getFromStorage<LabTestBooking[]>(LAB_TEST_BOOKINGS_KEY, []).sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
export const getLabTestBookingsForUser = (userId: number): LabTestBooking[] => getAllLabTestBookings().filter(b => b.userId === userId);
export const bookLabTest = (data: LabTestBookingIn): { message: string } => {
    const allBookings = getAllLabTestBookings();
    const test = getLabTests().find(t => t.id === data.testId);
    if (!test) throw new Error("Lab test not found.");

    const subtotal = test.price;
    const gst = subtotal * GST_RATE;
    const totalAmount = subtotal + gst;

    const newId = allBookings.length > 0 ? Math.max(...allBookings.map(b => b.id)) + 1 : 1;
    const newBooking: LabTestBooking = {
        id: newId,
        userId: data.userId,
        patientName: data.patientName,
        testId: test.id,
        testName: test.name,
        bookingDate: new Date().toISOString(),
        slot: data.slot,
        address: data.address,
        subtotal,
        gst,
        totalAmount,
        status: 'Booked',
        deliveryBoy: null,
        trackingHistory: [{ status: 'Booking Confirmed', timestamp: new Date().toISOString() }]
    };
    allBookings.push(newBooking);
    saveToStorage(LAB_TEST_BOOKINGS_KEY, allBookings);
    return { message: `${test.name} booked successfully!` };
};
export const updateLabTestBookingStatus = (bookingId: number, newStatus: LabTestBooking['status']): void => {
    let bookings = getAllLabTestBookings();
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index !== -1) {
        bookings[index].status = newStatus;
        bookings[index].trackingHistory.push({ status: newStatus, timestamp: new Date().toISOString() });
        saveToStorage(LAB_TEST_BOOKINGS_KEY, bookings);
    } else {
        throw new Error("Lab test booking not found");
    }
};

// --- Common Delivery Management ---
export const assignDeliveryInfo = (orderType: 'medicine' | 'lab', orderId: number, deliveryBoy: DeliveryBoy) => {
    if (orderType === 'medicine') {
        let orders = getAllMedicineOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            orders[index].deliveryBoy = deliveryBoy;
            orders[index].trackingHistory.push({ status: `Assigned to ${deliveryBoy.name}`, timestamp: new Date().toISOString() });
            saveToStorage(MEDICINE_ORDERS_KEY, orders);
        }
    } else {
        let bookings = getAllLabTestBookings();
        const index = bookings.findIndex(b => b.id === orderId);
        if (index !== -1) {
            bookings[index].deliveryBoy = deliveryBoy;
            bookings[index].trackingHistory.push({ status: `Phlebotomist ${deliveryBoy.name} assigned`, timestamp: new Date().toISOString() });
            saveToStorage(LAB_TEST_BOOKINGS_KEY, bookings);
        }
    }
};

// --- Wishlist Management ---
const getWishlistKey = (userId: number) => `${WISHLIST_KEY_PREFIX}${userId}`;

export const getWishlist = (userId: number): number[] => {
    return getFromStorage<number[]>(getWishlistKey(userId), []);
};

export const isMedicineInWishlist = (userId: number, medicineId: number): boolean => {
    const wishlist = getWishlist(userId);
    return wishlist.includes(medicineId);
};

export const addToWishlist = (userId: number, medicineId: number): void => {
    const wishlist = getWishlist(userId);
    if (!wishlist.includes(medicineId)) {
        wishlist.push(medicineId);
        saveToStorage(getWishlistKey(userId), wishlist);
    }
};

export const removeFromWishlist = (userId: number, medicineId: number): void => {
    let wishlist = getWishlist(userId);
    wishlist = wishlist.filter(id => id !== medicineId);
    saveToStorage(getWishlistKey(userId), wishlist);
};