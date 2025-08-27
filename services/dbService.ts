import { Doctor, Appointment, DoctorIn, AppointmentIn, AuthLog, User, PharmaCompany, UserSession, Medicine, MedicineOrder, Address, MedicineIn, LabTest, LabTestBooking, LabTestBookingIn } from '../types';

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
const GST_RATE = 0.18;


const initialDoctors: Doctor[] = [
    { id: 1, name: 'Dr. Ramesh Kumar', specialty: 'General Physician', location: 'Patna', available_time: '10:00 AM - 1:00 PM', imageUrl: 'https://placehold.co/100x100/e0f2fe/0891b2?text=RK' },
    { id: 2, name: 'Dr. Sunita Sharma', specialty: 'Dentist', location: 'Nalanda', available_time: '2:00 PM - 5:00 PM', imageUrl: 'https://placehold.co/100x100/dcfce7/166534?text=SS' },
    { id: 3, name: 'Dr. Anil Singh', specialty: 'Cardiologist', location: 'Patna', available_time: '9:00 AM - 12:00 PM', imageUrl: 'https://placehold.co/100x100/f3e8ff/6b21a8?text=AS' },
    { id: 4, name: 'Dr. Priya Gupta', specialty: 'Dermatologist', location: 'Nawada', available_time: '11:00 AM - 2:00 PM', imageUrl: 'https://placehold.co/100x100/fefce8/a16207?text=PG' },
    { id: 5, name: 'Dr. Manoj Verma', specialty: 'Orthopedic Surgeon', location: 'Shekhpura', available_time: '3:00 PM - 6:00 PM', imageUrl: 'https://placehold.co/100x100/fee2e2/991b1b?text=MV' },
    { id: 6, name: 'Dr. Alok Jha', specialty: 'General Physician', location: 'Mokama', available_time: '10:00 AM - 1:00 PM', imageUrl: 'https://placehold.co/100x100/e5e7eb/4b5563?text=AJ' },
    { id: 7, name: 'Dr. Sneha Patel', specialty: 'Pediatrician', location: 'Patna', available_time: '4:00 PM - 7:00 PM', imageUrl: 'https://placehold.co/100x100/fff7ed/c2410c?text=SP' },
    { id: 8, name: 'Dr. Vikram Rathore', specialty: 'Dentist', location: 'Patna', available_time: '9:00 AM - 12:00 PM', imageUrl: 'https://placehold.co/100x100/fce7f3/be185d?text=VR' }
];

const initialOwner: User = { id: 0, firstName: 'App', lastName: 'Owner', phone: '0000000000', email: 'owner@healthclub.com', role: 'owner' };
const initialAdmin: User = { id: 1, firstName: 'Clinic', lastName: 'Admin', phone: '1111111111', email: 'admin@healthclub.com', role: 'admin' };
const initialPatient: User = { id: 2, firstName: 'Saurabh', lastName: 'Anand', phone: '7667926418', email: 'saurabh@example.com', role: 'patient'};


const initialPharmaCompanies: PharmaCompany[] = [
    { id: 1, name: 'Sun Pharmaceutical Industries Ltd.', location: 'Mumbai' },
    { id: 2, name: 'Cipla Ltd.', location: 'Mumbai' },
    { id: 3, name: 'Dr. Reddy\'s Laboratories Ltd.', location: 'Hyderabad' },
    { id: 4, name: 'Lupin Ltd.', location: 'Mumbai' },
    { id: 5, name: 'Mankind Pharma', location: 'Delhi' },
];

const initialMedicines: Medicine[] = [
    { id: 1, name: 'Paracetamol 500mg', mrp: 30.00, price: 25.50, description: 'For fever and pain relief. 10 tablets.', imageUrl: 'https://placehold.co/300x200/e0f2fe/0891b2?text=Paracetamol' },
    { id: 2, name: 'Amoxicillin 250mg', mrp: 95.00, price: 80.00, description: 'Antibiotic for bacterial infections. 8 capsules.', imageUrl: 'https://placehold.co/300x200/dcfce7/166534?text=Amoxicillin' },
    { id: 3, name: 'Cetirizine 10mg', mrp: 50.00, price: 45.75, description: 'Antihistamine for allergy relief. 10 tablets.', imageUrl: 'https://placehold.co/300x200/fefce8/a16207?text=Cetirizine' },
    { id: 4, name: 'Multivitamin Complex', mrp: 180.00, price: 150.00, description: 'Dietary supplement with essential vitamins. 30 tablets.', imageUrl: 'https://placehold.co/300x200/f3e8ff/6b21a8?text=Multivitamins' },
    { id: 5, name: 'Antacid Syrup', mrp: 75.00, price: 65.20, description: 'For relief from acidity and indigestion. 200ml bottle.', imageUrl: 'https://placehold.co/300x200/fee2e2/991b1b?text=Antacid' },
    { id: 6, name: 'Aspirin 75mg', mrp: 35.00, price: 30.00, description: 'Low-dose aspirin for cardiovascular health. 14 tablets.', imageUrl: 'https://placehold.co/300x200/e5e7eb/4b5563?text=Aspirin' },
    { id: 7, name: 'Loratadine 10mg', mrp: 60.00, price: 55.00, description: 'Non-drowsy allergy relief. 10 tablets.', imageUrl: 'https://placehold.co/300x200/fff7ed/c2410c?text=Loratadine' },
    { id: 8, name: 'Ibuprofen 400mg', mrp: 45.00, price: 40.00, description: 'Pain and inflammation reducer. 10 tablets.', imageUrl: 'https://placehold.co/300x200/fce7f3/be185d?text=Ibuprofen' },
    { id: 9, name: 'Omeprazole 20mg', mrp: 110.00, price: 95.50, description: 'For chronic heartburn and acid reflux. 14 capsules.', imageUrl: 'https://placehold.co/300x200/ecfdf5/059669?text=Omeprazole' },
    { id: 10, name: 'Vitamin D3 60000 IU', mrp: 140.00, price: 120.00, description: 'High-dose Vitamin D supplement. 4 capsules.', imageUrl: 'https://placehold.co/300x200/eff6ff/3b82f6?text=Vitamin+D3' },
    { id: 11, name: 'Digital Thermometer', mrp: 350.00, price: 299.00, description: 'Fast and accurate digital thermometer for home use.', imageUrl: 'https://placehold.co/300x200/e0f2f1/00796b?text=Thermometer' },
    { id: 12, name: 'Blood Glucose Monitor', mrp: 1200.00, price: 999.00, description: 'Monitor your blood sugar levels easily. Includes 10 strips.', imageUrl: 'https://placehold.co/300x200/e8eaf6/3f51b5?text=Glucometer' },
    { id: 13, name: 'Whey Protein Powder', mrp: 2500.00, price: 2199.00, description: 'High-quality whey protein for muscle growth. 1kg pack.', imageUrl: 'https://placehold.co/300x200/f3e5f5/8e24aa?text=Protein' },
    { id: 14, name: 'Omega-3 Fish Oil', mrp: 600.00, price: 499.00, description: 'Supports heart and brain health. 60 softgels.', imageUrl: 'https://placehold.co/300x200/fff3e0/fb8c00?text=Omega-3' },
];

const initialAddresses: Address[] = [
    { id: 1, userId: 1, fullName: 'Clinic Admin', phone: '1111111111', addressLine1: 'Admin Office, Health Club HQ', addressLine2: 'Fraser Road Area', city: 'Patna', state: 'Bihar', pincode: '800001', type: 'Work' },
    { id: 2, userId: 2, fullName: 'Saurabh Anand', phone: '7667926418', addressLine1: 'Gali no A1, Behind RBSM School', addressLine2: 'Bharat Chowk, Shyam Kunj, Bhondsi, vishnu kumar sharma', city: 'Gurugram', state: 'Haryana', pincode: '122102', type: 'Home' },
    { id: 3, userId: 2, fullName: 'Saurabh Anand', phone: '7667926418', addressLine1: 'Alternate Address, Near City Park', addressLine2: 'Sector 5', city: 'Gurugram', state: 'Haryana', pincode: '122001', type: 'Work' },
    { id: 4, userId: 1, fullName: 'Clinic Admin', phone: '1111111111', addressLine1: 'Admin Villa, Apartment 4B', addressLine2: 'New Patliputra Colony', city: 'Patna', state: 'Bihar', pincode: '800013', type: 'Home' }
];

const initialLabTests: LabTest[] = [
    { id: 1, name: "Complete Blood Count (CBC)", description: "A comprehensive test that measures different components of your blood.", price: 350, mrp: 500, preparations: "No fasting required.", includes: ["Hemoglobin", "RBC Count", "WBC Count", "Platelet Count", "PCV", "MCV"], imageUrl: 'https://placehold.co/300x200/e0f2fe/0891b2?text=CBC+Test' },
    { id: 2, name: "Aarogyam C - Full Body Checkup", description: "A complete health package covering major tests for a full body assessment.", price: 1299, mrp: 2500, preparations: "10-12 hours fasting required. Water intake is allowed.", includes: ["Lipid Profile", "Liver Function Test (LFT)", "Kidney Function Test (KFT)", "Thyroid Profile", "Blood Sugar"], imageUrl: 'https://placehold.co/300x200/dcfce7/166534?text=Full+Body' },
    { id: 3, name: "Fasting Blood Sugar (FBS)", description: "Measures blood glucose levels after an overnight fast.", price: 150, mrp: 250, preparations: "10-12 hours fasting required.", includes: ["Glucose - Fasting"], imageUrl: 'https://placehold.co/300x200/fefce8/a16207?text=Blood+Sugar' },
    { id: 4, name: "Thyroid Profile (T3, T4, TSH)", description: "Evaluates thyroid gland function and helps diagnose thyroid disorders.", price: 600, mrp: 1000, preparations: "No fasting required.", includes: ["Triiodothyronine (T3)", "Thyroxine (T4)", "Thyroid Stimulating Hormone (TSH)"], imageUrl: 'https://placehold.co/300x200/f3e8ff/6b21a8?text=Thyroid' },
    { id: 5, name: "Hemodialysis Session", description: "A procedure to remove waste products and excess fluid from the blood when the kidneys stop working properly.", price: 2500, mrp: 3000, preparations: "As prescribed by your nephrologist. Please bring your medical records.", includes: ["Single Session of Dialysis", "Vital Monitoring", "Medical Supervision"], imageUrl: 'https://placehold.co/300x200/e5e7eb/4b5563?text=Dialysis' }
];


const seedData = () => {
    try {
        if (!localStorage.getItem(USERS_KEY)) {
            localStorage.setItem(USERS_KEY, JSON.stringify([initialOwner, initialAdmin, initialPatient]));
        }
        if (!localStorage.getItem(DOCTORS_KEY)) {
            localStorage.setItem(DOCTORS_KEY, JSON.stringify(initialDoctors));
        }
        if (!localStorage.getItem(APPOINTMENTS_KEY)) {
            localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify([]));
        }
        if (!localStorage.getItem(AUTH_LOGS_KEY)) {
            localStorage.setItem(AUTH_LOGS_KEY, JSON.stringify([]));
        }
        if (!localStorage.getItem(PHARMA_COMPANIES_KEY)) {
            localStorage.setItem(PHARMA_COMPANIES_KEY, JSON.stringify(initialPharmaCompanies));
        }
        if (!localStorage.getItem(SESSIONS_KEY)) {
            localStorage.setItem(SESSIONS_KEY, JSON.stringify([]));
        }
        if (!localStorage.getItem(MEDICINES_KEY)) {
            localStorage.setItem(MEDICINES_KEY, JSON.stringify(initialMedicines));
        }
        if (!localStorage.getItem(MEDICINE_ORDERS_KEY)) {
            localStorage.setItem(MEDICINE_ORDERS_KEY, JSON.stringify([]));
        }
        if (!localStorage.getItem(ADDRESSES_KEY)) {
            localStorage.setItem(ADDRESSES_KEY, JSON.stringify(initialAddresses));
        }
        if (!localStorage.getItem(LAB_TESTS_KEY)) {
            localStorage.setItem(LAB_TESTS_KEY, JSON.stringify(initialLabTests));
        }
        if (!localStorage.getItem(LAB_TEST_BOOKINGS_KEY)) {
            localStorage.setItem(LAB_TEST_BOOKINGS_KEY, JSON.stringify([]));
        }
    } catch (error) {
        console.error("Failed to seed data to localStorage", error);
    }
};

// Seed data on initial load
seedData();

export const getUsers = (): User[] => {
    try {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error("Failed to get users from localStorage", error);
        return [];
    }
}

export const getUserByPhone = (phone: string): User | undefined => {
    const users = getUsers();
    return users.find(u => u.phone === phone);
}

export const checkUserExists = (phone: string): boolean => {
    const users = getUsers();
    return users.some(u => u.phone === phone);
};


export const addUser = (data: Omit<User, 'id' | 'role'>): User => {
    const users = getUsers();
    if (getUserByPhone(data.phone)) {
        throw new Error("A user with this phone number already exists.");
    }
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser: User = { 
        id: newId, 
        ...data,
        role: 'patient' 
    };
    const updatedUsers = [...users, newUser];
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    return newUser;
};


const getAllDoctors = (): Doctor[] => {
    try {
        const doctors = localStorage.getItem(DOCTORS_KEY);
        return doctors ? JSON.parse(doctors) : [];
    } catch (error) {
        console.error("Failed to get doctors from localStorage", error);
        return [];
    }
};

export const getAllAppointments = (): Appointment[] => {
    try {
        const appointments = localStorage.getItem(APPOINTMENTS_KEY);
        return appointments ? JSON.parse(appointments) : [];
    } catch (error) {
        console.error("Failed to get appointments from localStorage", error);
        return [];
    }
};

export const getAuthLogs = (): AuthLog[] => {
    try {
        const logs = localStorage.getItem(AUTH_LOGS_KEY);
        return logs ? JSON.parse(logs) : [];
    } catch (error) {
        console.error("Failed to get auth logs from localStorage", error);
        return [];
    }
};

export const addAuthLog = (log: Omit<AuthLog, 'timestamp'>) => {
    try {
        const logsJson = localStorage.getItem(AUTH_LOGS_KEY);
        const logs: AuthLog[] = logsJson ? JSON.parse(logsJson) : [];
        const newLog: AuthLog = {
            ...log,
            timestamp: new Date().toISOString(),
        };
        // Keep logs to a reasonable number, e.g., last 50
        const updatedLogs = [newLog, ...logs].slice(0, 50);
        localStorage.setItem(AUTH_LOGS_KEY, JSON.stringify(updatedLogs));
    } catch (error) {
        console.error('Failed to write auth log:', error);
    }
};

export const getDoctors = (location?: string, specialty?: string): Doctor[] => {
    let doctors = getAllDoctors();
    if (location) {
        doctors = doctors.filter(d => d.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (specialty) {
        doctors = doctors.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
    }
    return doctors;
};

export const getPharmaCompanies = (): PharmaCompany[] => {
    try {
        const companies = localStorage.getItem(PHARMA_COMPANIES_KEY);
        return companies ? JSON.parse(companies) : [];
    } catch (error) {
        console.error("Failed to get pharma companies from localStorage", error);
        return [];
    }
};

export const addDoctor = (doctor: DoctorIn): { message: string, doctor_id: number } => {
    const doctors = getAllDoctors();
    const newId = doctors.length > 0 ? Math.max(...doctors.map(d => d.id)) + 1 : 1;
    const newDoctor: Doctor = { id: newId, ...doctor };
    const updatedDoctors = [...doctors, newDoctor];
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(updatedDoctors));
    return { message: "Doctor added successfully", doctor_id: newId };
};

export const updateDoctor = (doctorToUpdate: Doctor): Doctor => {
    const doctors = getAllDoctors();
    const index = doctors.findIndex(d => d.id === doctorToUpdate.id);
    if (index === -1) {
        throw new Error("Doctor not found for update.");
    }
    doctors[index] = doctorToUpdate;
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
    return doctorToUpdate;
};

export const deleteDoctor = (id: number): void => {
    const doctors = getAllDoctors();
    const updatedDoctors = doctors.filter(d => d.id !== id);
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(updatedDoctors));
};

const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

export const bookAppointment = async (data: AppointmentIn): Promise<{ message: string }> => {
    const doctors = getAllDoctors();
    const appointments = getAllAppointments();
    const doctor = doctors.find(d => d.id === data.doctor_id);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    let reportBase64: string | undefined = undefined;
    if (data.report_pdf_file) {
        reportBase64 = await fileToBase64(data.report_pdf_file);
    }

    const newId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
    const newAppointment: Appointment = {
      id: newId,
      userId: data.userId,
      doctor_name: doctor.name,
      patient_name: data.patient_name,
      doctor_id: data.doctor_id,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      created_at: new Date().toISOString(),
      is_repeat_visit: data.is_repeat_visit,
      heart_beat_rate: data.heart_beat_rate ? Number(data.heart_beat_rate) : null,
      symptoms: data.symptoms,
      blood_test_notes: data.blood_test_notes,
      nutrition_notes: data.nutrition_notes,
      report_pdf_base64: reportBase64,
    };
    const updatedAppointments = [...appointments, newAppointment];
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
    return { message: `Appointment booked with Dr. ${doctor.name}` };
};

export const getDoctorById = (id: number): Doctor | undefined => {
    const doctors = getAllDoctors();
    return doctors.find(d => d.id === id);
};

export const getAllSessions = (): UserSession[] => {
    try {
        const sessions = localStorage.getItem(SESSIONS_KEY);
        const parsedSessions = sessions ? JSON.parse(sessions) : [];
        return parsedSessions.sort((a: UserSession, b: UserSession) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    } catch (error) {
        console.error("Failed to get sessions from localStorage", error);
        return [];
    }
};

export const addSession = (session: Omit<UserSession, 'id'>) => {
    try {
        const sessions = getAllSessions();
        const newId = sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 1;
        const newSession: UserSession = {
            id: newId,
            ...session,
        };
        const updatedSessions = [newSession, ...sessions];
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
        console.error('Failed to write session log:', error);
    }
};

// --- Pharmacy Functions ---

const getAllAddressesFromStorage = (): Address[] => {
    try {
        const addresses = localStorage.getItem(ADDRESSES_KEY);
        return addresses ? JSON.parse(addresses) : [];
    } catch (error) {
        console.error("Failed to get addresses from localStorage", error);
        return [];
    }
}

export const getMedicines = (): Medicine[] => {
    try {
        const medicines = localStorage.getItem(MEDICINES_KEY);
        return medicines ? JSON.parse(medicines) : [];
    } catch (error) {
        console.error("Failed to get medicines from localStorage", error);
        return [];
    }
};

export const addMedicine = (medicine: MedicineIn): Medicine => {
    const medicines = getMedicines();
    const newId = medicines.length > 0 ? Math.max(...medicines.map(m => m.id)) + 1 : 1;
    const newMedicine: Medicine = { id: newId, ...medicine };
    const updatedMedicines = [...medicines, newMedicine];
    localStorage.setItem(MEDICINES_KEY, JSON.stringify(updatedMedicines));
    return newMedicine;
};

export const updateMedicine = (medicineToUpdate: Medicine): Medicine => {
    const medicines = getMedicines();
    const index = medicines.findIndex(m => m.id === medicineToUpdate.id);
    if (index === -1) {
        throw new Error("Medicine not found for update.");
    }
    medicines[index] = medicineToUpdate;
    localStorage.setItem(MEDICINES_KEY, JSON.stringify(medicines));
    return medicineToUpdate;
};

export const deleteMedicine = (id: number): void => {
    const medicines = getMedicines();
    const updatedMedicines = medicines.filter(m => m.id !== id);
    localStorage.setItem(MEDICINES_KEY, JSON.stringify(updatedMedicines));
};

export const getAllMedicineOrders = (): MedicineOrder[] => {
    try {
        const orders = localStorage.getItem(MEDICINE_ORDERS_KEY);
        const parsedOrders: MedicineOrder[] = orders ? JSON.parse(orders) : [];
        return parsedOrders.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    } catch (error) {
        console.error("Failed to get medicine orders from localStorage", error);
        return [];
    }
};

export const getAddressesForUser = (userId: number): Address[] => {
    try {
        const allAddresses = getAllAddressesFromStorage();
        return allAddresses.filter(addr => addr.userId === userId);
    } catch (error) {
        console.error("Failed to get addresses from localStorage", error);
        return [];
    }
};

export const addAddress = (data: Omit<Address, 'id'>): Address => {
    const allAddresses = getAllAddressesFromStorage();
    const newId = allAddresses.length > 0 ? Math.max(...allAddresses.map(a => a.id)) + 1 : 1;
    const newAddress: Address = {
        id: newId,
        ...data,
    };
    const updatedAddresses = [...allAddresses, newAddress];
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(updatedAddresses));
    return newAddress;
};

export const updateAddress = (id: number, data: Partial<Omit<Address, 'id'>>): Address => {
    const allAddresses = getAllAddressesFromStorage();
    const addressIndex = allAddresses.findIndex(a => a.id === id);
    if (addressIndex === -1) {
        throw new Error("Address not found");
    }
    const updatedAddress = { ...allAddresses[addressIndex], ...data };
    allAddresses[addressIndex] = updatedAddress;
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(allAddresses));
    return updatedAddress;
};

export const deleteAddress = (id: number): void => {
    const allAddresses = getAllAddressesFromStorage();
    const updatedAddresses = allAddresses.filter(a => a.id !== id);
    if (allAddresses.length === updatedAddresses.length) {
        console.warn(`Address with id ${id} not found for deletion.`);
    }
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(updatedAddresses));
};

export const getMedicineOrdersForUser = (userId: number): MedicineOrder[] => {
    const allOrders = getAllMedicineOrders();
    return allOrders.filter(order => order.userId === userId).sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
};

export const placeMedicineOrder = (userId: number, cart: { [medicineId: number]: number }, deliveryAddress: Address, deliveryFee: number, promiseFee: number): { message: string } => {
    const allMedicines = getMedicines();
    const allOrders = getAllMedicineOrders();
    
    if (Object.keys(cart).length === 0) {
        throw new Error("Cart is empty.");
    }

    const items = Object.entries(cart).map(([medicineId, quantity]) => {
        const medicine = allMedicines.find(m => m.id === Number(medicineId));
        if (!medicine) {
            throw new Error(`Medicine with ID ${medicineId} not found.`);
        }
        return {
            medicineId: medicine.id,
            medicineName: medicine.name,
            quantity: quantity,
            price: medicine.price,
            mrp: medicine.mrp,
        };
    });

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalMrp = items.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
    const savings = totalMrp - subtotal;
    const gst = subtotal * GST_RATE;
    const totalAmount = subtotal + gst + deliveryFee + promiseFee;
    
    const newId = allOrders.length > 0 ? Math.max(...allOrders.map(o => o.id)) + 1 : 1;

    const newOrder: MedicineOrder = {
        id: newId,
        userId: userId,
        items: items,
        deliveryAddress: deliveryAddress,
        subtotal: subtotal,
        savings: savings,
        gst: gst,
        deliveryFee: deliveryFee,
        totalAmount: totalAmount,
        status: 'Processing',
        orderDate: new Date().toISOString(),
    };
    
    const updatedOrders = [...allOrders, newOrder];
    localStorage.setItem(MEDICINE_ORDERS_KEY, JSON.stringify(updatedOrders));
    
    return { message: "Order placed successfully!" };
};

// --- Lab Test Functions ---

export const getLabTests = (): LabTest[] => {
    try {
        const tests = localStorage.getItem(LAB_TESTS_KEY);
        return tests ? JSON.parse(tests) : [];
    } catch (error) {
        console.error("Failed to get lab tests from localStorage", error);
        return [];
    }
};

export const getAllLabTestBookings = (): LabTestBooking[] => {
    try {
        const bookings = localStorage.getItem(LAB_TEST_BOOKINGS_KEY);
        const parsedBookings: LabTestBooking[] = bookings ? JSON.parse(bookings) : [];
        return parsedBookings.sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    } catch (error) {
        console.error("Failed to get lab test bookings from localStorage", error);
        return [];
    }
};

export const getLabTestBookingsForUser = (userId: number): LabTestBooking[] => {
    const allBookings = getAllLabTestBookings();
    return allBookings.filter(booking => booking.userId === userId);
};

export const bookLabTest = (data: LabTestBookingIn): { message: string } => {
    const allTests = getLabTests();
    const allBookings = getAllLabTestBookings();
    const test = allTests.find(t => t.id === data.testId);

    if (!test) {
        throw new Error("Lab test not found.");
    }

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
        totalAmount: test.price,
        status: 'Booked',
    };

    const updatedBookings = [newBooking, ...allBookings];
    localStorage.setItem(LAB_TEST_BOOKINGS_KEY, JSON.stringify(updatedBookings));

    return { message: "Lab test booked successfully!" };
};

export const updateLabTestBookingStatus = (bookingId: number, newStatus: LabTestBooking['status']): LabTestBooking => {
    const allBookings = getAllLabTestBookings();
    const bookingIndex = allBookings.findIndex(b => b.id === bookingId);

    if (bookingIndex === -1) {
        throw new Error("Booking not found.");
    }

    const updatedBooking = { ...allBookings[bookingIndex], status: newStatus };
    allBookings[bookingIndex] = updatedBooking;

    localStorage.setItem(LAB_TEST_BOOKINGS_KEY, JSON.stringify(allBookings));

    return updatedBooking;
};