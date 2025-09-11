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
    { id: 1, name: 'Dr. Ramesh Kumar', specialty: 'General Physician', location: 'Patna', available_time: '10:00 AM - 1:00 PM', imageUrl: 'https://placehold.co/100x100/e0f2fe/0891b2?text=RK' },
    { id: 2, name: 'Dr. Sunita Sharma', specialty: 'Dentist', location: 'Nalanda', available_time: '2:00 PM - 5:00 PM', imageUrl: 'https://placehold.co/100x100/fecaca/991b1b?text=SS' },
    { id: 3, name: 'Dr. Vijay Singh', specialty: 'Cardiologist', location: 'Patna', available_time: '9:00 AM - 12:00 PM', imageUrl: 'https://placehold.co/100x100/d1fae5/065f46?text=VS' },
    { id: 4, name: 'Dr. Priya Das', specialty: 'Dermatologist', location: 'Gaya', available_time: '11:00 AM - 2:00 PM', imageUrl: 'https://placehold.co/100x100/e0e7ff/3730a3?text=PD' },
    { id: 5, name: 'Dr. Anil Mehta', specialty: 'Orthopedic', location: 'Patna', available_time: '4:00 PM - 7:00 PM', imageUrl: 'https://placehold.co/100x100/fef3c7/92400e?text=AM' },
];

const initialUsers: User[] = [
    { id: 1, firstName: 'Amit', lastName: 'Kumar', phone: '1234567890', email: 'amit.k@example.com', role: 'patient', profileImageUrl: 'https://placehold.co/100x100/e0e7ff/3730a3?text=AK' },
    { id: 2, firstName: 'Rina', lastName: 'Devi', phone: '0987654321', email: 'rina.d@example.com', role: 'patient' },
    { id: 3, firstName: 'Admin', lastName: 'User', phone: '1111111111', role: 'admin' },
    { id: 4, firstName: 'Owner', lastName: 'User', phone: '2222222222', role: 'owner' },
];

const initialPharmaCompanies: PharmaCompany[] = [
    { id: 1, name: 'Cipla', location: 'Mumbai' },
    { id: 2, name: 'Sun Pharma', location: 'Gujarat' },
];

const initialMedicines: Medicine[] = [
    { id: 1, name: 'Paracetamol 500mg', mrp: 30.00, price: 25.50, description: 'For fever and pain relief. 10 tablets.', imageUrl: 'https://placehold.co/300x200/e0f2fe/0891b2?text=Paracetamol' },
    { id: 2, name: 'Cetirizine 10mg', mrp: 50.00, price: 42.00, description: 'Anti-allergic medication. 10 tablets.', imageUrl: 'https://placehold.co/300x200/fecaca/991b1b?text=Cetirizine' },
    { id: 3, name: 'Aspirin 75mg', mrp: 15.00, price: 12.50, description: 'Blood thinner. 14 tablets.', imageUrl: 'https://placehold.co/300x200/d1fae5/065f46?text=Aspirin' },
    { id: 4, name: 'Multivitamin Capsules', mrp: 250.00, price: 210.00, description: 'General health supplement. 30 capsules.', imageUrl: 'https://placehold.co/300x200/e0e7ff/3730a3?text=Vitamins' },
];

const initialLabTests: LabTest[] = [
    { id: 1, name: 'Complete Blood Count (CBC)', description: 'A comprehensive test to evaluate your overall health.', price: 300, mrp: 500, preparations: 'No fasting required.', includes: ['Hemoglobin', 'RBC Count', 'WBC Count', 'Platelet Count'], imageUrl: 'https://placehold.co/300x200/e0f2fe/0891b2?text=CBC' },
    { id: 2, name: 'Thyroid Profile', description: 'Measures thyroid hormone levels to check for thyroid disorders.', price: 600, mrp: 1000, preparations: '8-10 hours fasting recommended.', includes: ['T3', 'T4', 'TSH'], imageUrl: 'https://placehold.co/300x200/fef3c7/92400e?text=Thyroid' },
];

const initializeData = () => {
    if (!localStorage.getItem(DOCTORS_KEY)) saveToStorage(DOCTORS_KEY, initialDoctors);
    if (!localStorage.getItem(USERS_KEY)) saveToStorage(USERS_KEY, initialUsers);
    if (!localStorage.getItem(PHARMA_COMPANIES_KEY)) saveToStorage(PHARMA_COMPANIES_KEY, initialPharmaCompanies);
    if (!localStorage.getItem(MEDICINES_KEY)) saveToStorage(MEDICINES_KEY, initialMedicines);
    if (!localStorage.getItem(LAB_TESTS_KEY)) saveToStorage(LAB_TESTS_KEY, initialLabTests);
    if (!localStorage.getItem(APPOINTMENTS_KEY)) saveToStorage(APPOINTMENTS_KEY, []);
    if (!localStorage.getItem(AUTH_LOGS_KEY)) saveToStorage(AUTH_LOGS_KEY, []);
    if (!localStorage.getItem(SESSIONS_KEY)) saveToStorage(SESSIONS_KEY, []);
    if (!localStorage.getItem(MEDICINE_ORDERS_KEY)) saveToStorage(MEDICINE_ORDERS_KEY, []);
    if (!localStorage.getItem(ADDRESSES_KEY)) saveToStorage(ADDRESSES_KEY, []);
    if (!localStorage.getItem(LAB_TEST_BOOKINGS_KEY)) saveToStorage(LAB_TEST_BOOKINGS_KEY, []);
};

initializeData();

// --- Wishlist Management ---
export const getWishlist = (userId: number): number[] => {
    const key = `${WISHLIST_KEY_PREFIX}${userId}`;
    const wishlistJson = localStorage.getItem(key);
    return wishlistJson ? JSON.parse(wishlistJson) : [];
};

export const addToWishlist = (userId: number, medicineId: number): void => {
    const wishlist = getWishlist(userId);
    if (!wishlist.includes(medicineId)) {
        wishlist.push(medicineId);
        localStorage.setItem(`${WISHLIST_KEY_PREFIX}${userId}`, JSON.stringify(wishlist));
    }
};

export const removeFromWishlist = (userId: number, medicineId: number): void => {
    let wishlist = getWishlist(userId);
    wishlist = wishlist.filter(id => id !== medicineId);
    localStorage.setItem(`${WISHLIST_KEY_PREFIX}${userId}`, JSON.stringify(wishlist));
};

export const isMedicineInWishlist = (userId: number, medicineId: number): boolean => {
    const wishlist = getWishlist(userId);
    return wishlist.includes(medicineId);
};

// --- Users ---
export const getUsers = (): User[] => getFromStorage(USERS_KEY, []);
export const getUserByPhone = (phone: string): User | undefined => getUsers().find(u => u.phone === phone);
export const checkUserExists = (phone: string): boolean => !!getUserByPhone(phone);
export const addUser = (userData: Omit<User, 'id' | 'role'>): User => {
    const users = getUsers();
    const newUser: User = { ...userData, id: Date.now(), role: 'patient' };
    saveToStorage(USERS_KEY, [...users, newUser]);
    return newUser;
};
export const updateUser = (updatedUser: User): void => {
    const users = getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
        users[index] = updatedUser;
        saveToStorage(USERS_KEY, users);
    }
};

// --- Doctors ---
export const getDoctors = (location?: string, specialty?: string): Doctor[] => {
    let doctors = getFromStorage<Doctor[]>(DOCTORS_KEY, []);
    if (location) doctors = doctors.filter(d => d.location.toLowerCase().includes(location.toLowerCase()));
    if (specialty) doctors = doctors.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
    return doctors;
};
export const addDoctor = (doctorData: DoctorIn): void => {
    const doctors = getDoctors();
    const newDoctor = { ...doctorData, id: Date.now() };
    saveToStorage(DOCTORS_KEY, [...doctors, newDoctor]);
};
export const updateDoctor = (updatedDoctor: Doctor): void => {
    const doctors = getDoctors();
    const index = doctors.findIndex(d => d.id === updatedDoctor.id);
    if (index !== -1) {
        doctors[index] = updatedDoctor;
        saveToStorage(DOCTORS_KEY, doctors);
    }
};
export const deleteDoctor = (id: number): void => {
    const doctors = getDoctors();
    saveToStorage(DOCTORS_KEY, doctors.filter(d => d.id !== id));
};

// --- Appointments ---
export const getAllAppointments = (): Appointment[] => getFromStorage(APPOINTMENTS_KEY, []);
export const bookAppointment = async (data: AppointmentIn): Promise<Appointment> => {
    const appointments = getAllAppointments();
    const doctor = getDoctors().find(d => d.id === data.doctor_id);

    let pdfBase64: string | undefined = undefined;
    if (data.report_pdf_file) {
        pdfBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(data.report_pdf_file!);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }

    const newAppointment: Appointment = {
        id: Date.now(),
        userId: data.userId,
        patient_name: data.patient_name,
        doctor_id: data.doctor_id,
        doctor_name: doctor?.name || 'Unknown Doctor',
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        created_at: new Date().toISOString(),
        is_repeat_visit: data.is_repeat_visit,
        heart_beat_rate: data.heart_beat_rate ? Number(data.heart_beat_rate) : null,
        symptoms: data.symptoms,
        blood_test_notes: data.blood_test_notes,
        nutrition_notes: data.nutrition_notes,
        report_pdf_base64: pdfBase64,
        status: 'Scheduled',
    };
    saveToStorage(APPOINTMENTS_KEY, [...appointments, newAppointment]);
    return newAppointment;
};
export const updateAppointmentStatus = (id: number, status: Appointment['status']): void => {
    const appointments = getAllAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
        appointments[index].status = status;
        saveToStorage(APPOINTMENTS_KEY, appointments);
    }
};

// --- Auth Logs & Sessions ---
export const getAuthLogs = (): AuthLog[] => getFromStorage(AUTH_LOGS_KEY, []);
export const addAuthLog = (logData: Omit<AuthLog, 'timestamp'>): void => {
    const logs = getAuthLogs();
    const newLog = { ...logData, timestamp: new Date().toISOString() };
    saveToStorage(AUTH_LOGS_KEY, [newLog, ...logs]);
};
export const getAllSessions = (): UserSession[] => getFromStorage(SESSIONS_KEY, []);
export const addSession = (sessionData: Omit<UserSession, 'id'>): void => {
    const sessions = getAllSessions();
    const newSession = { ...sessionData, id: Date.now() };
    saveToStorage(SESSIONS_KEY, [newSession, ...sessions]);
};

// --- Pharma Companies ---
export const getPharmaCompanies = (): PharmaCompany[] => getFromStorage(PHARMA_COMPANIES_KEY, []);

// --- Medicines ---
export const getMedicines = (): Medicine[] => getFromStorage(MEDICINES_KEY, []);
export const addMedicine = (medData: MedicineIn): void => {
    const medicines = getMedicines();
    const newMedicine = { ...medData, id: Date.now() };
    saveToStorage(MEDICINES_KEY, [...medicines, newMedicine]);
};
export const updateMedicine = (updatedMedicine: Medicine): void => {
    const medicines = getMedicines();
    const index = medicines.findIndex(m => m.id === updatedMedicine.id);
    if (index !== -1) {
        medicines[index] = updatedMedicine;
        saveToStorage(MEDICINES_KEY, medicines);
    }
};
export const deleteMedicine = (id: number): void => {
    const medicines = getMedicines();
    saveToStorage(MEDICINES_KEY, medicines.filter(m => m.id !== id));
};

// --- Medicine Orders ---
export const getAllMedicineOrders = (): MedicineOrder[] => getFromStorage(MEDICINE_ORDERS_KEY, []);
export const getMedicineOrdersForUser = (userId: number): MedicineOrder[] => getAllMedicineOrders().filter(o => o.userId === userId);
export const placeMedicineOrder = (userId: number, cart: { [medicineId: number]: number }, address: Address, deliveryFee: number, promiseFee: number): MedicineOrder => {
    const allMedicines = getMedicines();
    const allOrders = getAllMedicineOrders();
    
    const items = Object.entries(cart).map(([medicineId, quantity]) => {
        const medicine = allMedicines.find(m => m.id === Number(medicineId));
        if (!medicine) throw new Error(`Medicine with ID ${medicineId} not found`);
        return {
            medicineId: medicine.id,
            medicineName: medicine.name,
            quantity,
            price: medicine.price,
            mrp: medicine.mrp,
        };
    });

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalMrp = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
    const savings = totalMrp - subtotal;
    const gst = subtotal * GST_RATE;
    const totalAmount = subtotal + gst + deliveryFee + promiseFee;

    const newOrder: MedicineOrder = {
        id: Date.now(),
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

    saveToStorage(MEDICINE_ORDERS_KEY, [...allOrders, newOrder]);
    return newOrder;
};
export const updateMedicineOrderStatus = (orderId: number, status: MedicineOrder['status']): void => {
    const orders = getAllMedicineOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
        orders[index].status = status;
        orders[index].trackingHistory.push({ status, timestamp: new Date().toISOString() });
        saveToStorage(MEDICINE_ORDERS_KEY, orders);
    }
};

// --- Addresses ---
export const getAllAddresses = (): Address[] => getFromStorage(ADDRESSES_KEY, []);
export const getAddressesForUser = (userId: number): Address[] => getAllAddresses().filter(a => a.userId === userId);
export const addAddress = (addressData: Omit<Address, 'id'>): void => {
    const addresses = getAllAddresses();
    const newAddress = { ...addressData, id: Date.now() };
    saveToStorage(ADDRESSES_KEY, [...addresses, newAddress]);
};
export const updateAddress = (id: number, updatedData: Omit<Address, 'id'>): void => {
    const addresses = getAllAddresses();
    const index = addresses.findIndex(a => a.id === id);
    if (index !== -1) {
        addresses[index] = { ...updatedData, id };
        saveToStorage(ADDRESSES_KEY, addresses);
    }
};
export const deleteAddress = (id: number): void => {
    const addresses = getAllAddresses();
    saveToStorage(ADDRESSES_KEY, addresses.filter(a => a.id !== id));
};

// --- Lab Tests ---
export const getLabTests = (): LabTest[] => getFromStorage(LAB_TESTS_KEY, []);
export const addLabTest = (testData: LabTestIn): void => {
    const tests = getLabTests();
    const newTest = { ...testData, id: Date.now() };
    saveToStorage(LAB_TESTS_KEY, [...tests, newTest]);
};
export const updateLabTest = (updatedTest: LabTest): void => {
    const tests = getLabTests();
    const index = tests.findIndex(t => t.id === updatedTest.id);
    if (index !== -1) {
        tests[index] = updatedTest;
        saveToStorage(LAB_TESTS_KEY, tests);
    }
};
export const deleteLabTest = (id: number): void => {
    const tests = getLabTests();
    saveToStorage(LAB_TESTS_KEY, tests.filter(t => t.id !== id));
};

// --- Lab Test Bookings ---
export const getAllLabTestBookings = (): LabTestBooking[] => getFromStorage(LAB_TEST_BOOKINGS_KEY, []);
export const getLabTestBookingsForUser = (userId: number): LabTestBooking[] => getAllLabTestBookings().filter(b => b.userId === userId);
export const bookLabTest = (data: LabTestBookingIn): { message: string } => {
    const bookings = getAllLabTestBookings();
    const test = getLabTests().find(t => t.id === data.testId);
    if (!test) throw new Error("Lab test not found.");

    const subtotal = test.price;
    const gst = subtotal * GST_RATE;
    const totalAmount = subtotal + gst;

    const newBooking: LabTestBooking = {
        id: Date.now(),
        userId: data.userId,
        patientName: data.patientName,
        testId: data.testId,
        testName: test.name,
        bookingDate: new Date().toISOString(),
        slot: data.slot,
        address: data.address,
        subtotal,
        gst,
        totalAmount,
        status: 'Booked',
        deliveryBoy: null,
        trackingHistory: [{ status: 'Booking Confirmed', timestamp: new Date().toISOString() }],
    };
    saveToStorage(LAB_TEST_BOOKINGS_KEY, [...bookings, newBooking]);
    return { message: "Test booked successfully!" };
};
export const updateLabTestBookingStatus = (id: number, status: LabTestBooking['status']): void => {
    const bookings = getAllLabTestBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
        bookings[index].status = status;
        bookings[index].trackingHistory.push({ status, timestamp: new Date().toISOString() });
        saveToStorage(LAB_TEST_BOOKINGS_KEY, bookings);
    }
};

// --- Generic ---
export const assignDeliveryInfo = (orderType: 'medicine' | 'lab', orderId: number, deliveryBoy: DeliveryBoy): void => {
    if (orderType === 'medicine') {
        const orders = getAllMedicineOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            orders[index].deliveryBoy = deliveryBoy;
            orders[index].status = 'Shipped';
            orders[index].trackingHistory.push({ status: 'Shipped', notes: `Out for delivery with ${deliveryBoy.name}`, timestamp: new Date().toISOString() });
            saveToStorage(MEDICINE_ORDERS_KEY, orders);
        }
    } else {
        const bookings = getAllLabTestBookings();
        const index = bookings.findIndex(b => b.id === orderId);
        if (index !== -1) {
            bookings[index].deliveryBoy = deliveryBoy;
            bookings[index].status = 'Sample Collected';
            bookings[index].trackingHistory.push({ status: 'Sample Collected', notes: `Collected by ${deliveryBoy.name}`, timestamp: new Date().toISOString() });
            saveToStorage(LAB_TEST_BOOKINGS_KEY, bookings);
        }
    }
};
