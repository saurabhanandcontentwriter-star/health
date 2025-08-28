import { Doctor, Appointment, DoctorIn, AppointmentIn, AuthLog, User, PharmaCompany, UserSession, Medicine, MedicineOrder, Address, MedicineIn, LabTest, LabTestBooking, LabTestBookingIn, DeliveryBoy } from '../types';
import { GST_RATE } from '../utils/constants';

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


const initialDoctors: Doctor[] = [
    { id: 1, name: 'Dr. Ramesh Kumar', specialty: 'General Physician', location: 'Patna', available_time: '10:00 AM - 1:00 PM', imageUrl: 'https://placehold.co/100x100/e0f2fe/0891b2?text=RK' },
    { id: 2, name: 'Dr. Sunita Sharma', specialty: 'Dentist', location: 'Nalanda', available_time: '2:00 PM - 5:00 PM', imageUrl: 'https://placehold.co/100x100/dcfce7/166534?text=SS' },
    { id: 3, name: 'Dr. Anil Singh', specialty: 'Cardiologist', location: 'Patna', available_time: '9:00 AM - 12:00 PM', imageUrl: 'https://placehold.co/100x100/f3e8ff/6b21a8?text=AS' },
    { id: 4, name: 'Dr. Priya Gupta', specialty: 'Dermatologist', location: 'Nawada', available_time: '11:00 AM - 2:00 PM', imageUrl: 'https://placehold.co/100x100/fefce8/a16207?text=PG' },
    { id: 5, name: 'Dr. Manoj Verma', specialty: 'Orthopedic Surgeon', location: 'Shekhpura', available_time: '3:00 PM - 6:00 PM', imageUrl: 'https://placehold.co/100x100/fee2e2/991b1b?text=MV' },
    { id: 6, name: 'Dr. Alok Jha', specialty: 'General Physician', location: 'Mokama', available_time: '10:00 AM - 1:00 PM', imageUrl: 'https://placehold.co/100x100/e5e7eb/4b5563?text=AJ' },
    { id: 7, name: 'Dr. Sneha Patel', specialty: 'Pediatrician', location: 'Patna', available_time: '4:00 PM - 7:00 PM', imageUrl: 'https://placehold.co/100x100/fff7ed/c2410c?text=SP' },
    { id: 8, name: 'Dr. Vikram Rathore', specialty: 'Dentist', location: 'Patna', available_time: '9:00 AM - 12:00 PM', imageUrl: 'https://placehold.co/100x100/fce7f3/be185d?text=VR' },
    { id: 9, name: 'Dr. Meena Kumari', specialty: 'Gynecologist', location: 'Gaya', available_time: '10:00 AM - 2:00 PM', imageUrl: 'https://placehold.co/100x100/e0f2fe/0891b2?text=MK' },
    { id: 10, name: 'Dr. Rajesh Prasad', specialty: 'Neurologist', location: 'Muzaffarpur', available_time: '1:00 PM - 4:00 PM', imageUrl: 'https://placehold.co/100x100/dcfce7/166534?text=RP' },
    { id: 11, name: 'Dr. Aarti Sinha', specialty: 'ENT Specialist', location: 'Bhagalpur', available_time: '9:00 AM - 1:00 PM', imageUrl: 'https://placehold.co/100x100/f3e8ff/6b21a8?text=AS' },
    { id: 12, name: 'Dr. Rohan Das', specialty: 'Psychiatrist', location: 'Darbhanga', available_time: '12:00 PM - 3:00 PM', imageUrl: 'https://placehold.co/100x100/fefce8/a16207?text=RD' },
    { id: 13, name: 'Dr. Fatima Begum', specialty: 'General Physician', location: 'Purnia', available_time: '11:00 AM - 3:00 PM', imageUrl: 'https://placehold.co/100x100/fee2e2/991b1b?text=FB' },
    { id: 14, name: 'Dr. Harish Chandra', specialty: 'Urologist', location: 'Arrah', available_time: '4:00 PM - 7:00 PM', imageUrl: 'https://placehold.co/100x100/e5e7eb/4b5563?text=HC' },
    { id: 15, name: 'Dr. Geeta Yadav', specialty: 'Ophthalmologist', location: 'Begusarai', available_time: '10:00 AM - 1:00 PM', imageUrl: 'https://placehold.co/100x100/fff7ed/c2410c?text=GY' },
    { id: 16, name: 'Dr. Suresh Tiwari', specialty: 'Cardiologist', location: 'Katihar', available_time: '9:00 AM - 12:00 PM', imageUrl: 'https://placehold.co/100x100/fce7f3/be185d?text=ST' },
    { id: 17, name: 'Dr. Neha Choudhary', specialty: 'Pediatrician', location: 'Gaya', available_time: '2:00 PM - 5:00 PM', imageUrl: 'https://placehold.co/100x100/ecfdf5/059669?text=NC' },
    { id: 18, name: 'Dr. Amit Raj', specialty: 'Orthopedic Surgeon', location: 'Muzaffarpur', available_time: '5:00 PM - 8:00 PM', imageUrl: 'https://placehold.co/100x100/eff6ff/3b82f6?text=AR' },
    { id: 19, name: 'Dr. Kavita Singh', specialty: 'Dermatologist', location: 'Patna', available_time: '10:00 AM - 1:00 PM', imageUrl: 'https://placehold.co/100x100/fdf2f8/831843?text=KS' },
    { id: 20, name: 'Dr. Bimal Mandal', specialty: 'General Physician', location: 'Siwan', available_time: '9:00 AM - 12:00 PM', imageUrl: 'https://placehold.co/100x100/fafafa/1c1917?text=BM' },
    // Generated doctors
    ...Array.from({ length: 980 }, (_, i) => {
        const firstNames = ["Ramesh", "Sunita", "Anil", "Priya", "Manoj", "Alok", "Sneha", "Vikram", "Meena", "Rajesh", "Aarti", "Rohan", "Fatima", "Harish", "Geeta", "Suresh", "Neha", "Amit", "Kavita", "Bimal", "Sanjay", "Pooja", "Rahul", "Anjali", "Deepak", "Swati", "Nitin", "Priyanka", "Aditya", "Ritu", "Mahesh", "Sonia", "Vivek", "Isha", "Ravi", "Jyoti", "Arun", "Divya"];
        const lastNames = ["Kumar", "Sharma", "Singh", "Gupta", "Verma", "Jha", "Patel", "Rathore", "Kumari", "Prasad", "Sinha", "Das", "Begum", "Chandra", "Yadav", "Tiwari", "Choudhary", "Raj", "Mandal", "Pandey", "Mishra", "Thakur", "Roy", "Khan", "Mehta", "Shah"];
        const specialties = ["General Physician", "Dentist", "Cardiologist", "Dermatologist", "Orthopedic Surgeon", "Pediatrician", "Gynecologist", "Neurologist", "ENT Specialist", "Psychiatrist", "Urologist", "Ophthalmologist", "Pulmonologist", "Endocrinologist", "Gastroenterologist"];
        const locations = ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Arrah", "Begusarai", "Katihar", "Siwan", "Nalanda", "Nawada", "Shekhpura", "Mokama", "Buxar", "Jehanabad", "Aurangabad", "Sasaram", "Chapra", "Motihari", "Hajipur"];
        const timeSlots = ["10:00 AM - 1:00 PM", "2:00 PM - 5:00 PM", "9:00 AM - 12:00 PM", "11:00 AM - 2:00 PM", "3:00 PM - 6:00 PM", "4:00 PM - 7:00 PM", "5:00 PM - 8:00 PM", "9:30 AM - 12:30 PM"];
        const colors = [{ bg: 'e0f2fe', text: '0891b2' }, { bg: 'dcfce7', text: '166534' }, { bg: 'f3e8ff', text: '6b21a8' }, { bg: 'fefce8', text: 'a16207' }, { bg: 'fee2e2', text: '991b1b' }, { bg: 'e5e7eb', text: '4b5563' }, { bg: 'fff7ed', text: 'c2410c' }, { bg: 'fce7f3', text: 'be185d' }];
        const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

        const firstName = getRandom(firstNames);
        const lastName = getRandom(lastNames);
        const name = `Dr. ${firstName} ${lastName}`;
        const specialty = getRandom(specialties);
        const location = getRandom(locations);
        const available_time = getRandom(timeSlots);
        const initials = `${firstName.substring(0, 1)}${lastName.substring(0, 1)}`.toUpperCase();
        const color = getRandom(colors);
        const imageUrl = `https://placehold.co/100x100/${color.bg}/${color.text}?text=${initials}`;

        return {
            id: i + 21,
            name,
            specialty,
            location,
            available_time,
            imageUrl
        };
    })
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
    { id: 15, name: 'Combiflam Tablet', mrp: 25.00, price: 22.50, description: 'Combines Ibuprofen and Paracetamol for pain relief. 20 tablets.', imageUrl: 'https://placehold.co/300x200/fee2e2/991b1b?text=Combiflam' },
    { id: 16, name: 'Volini Pain Relief Gel', mrp: 150.00, price: 135.00, description: 'Topical gel for muscle pain, sprains, and joint pain. 75g.', imageUrl: 'https://placehold.co/300x200/fecaca/991b1b?text=Volini' },
    { id: 17, name: 'Moov Pain Relief Spray', mrp: 200.00, price: 185.00, description: 'Instant pain relief spray for backaches and muscle pulls. 80g.', imageUrl: 'https://placehold.co/300x200/fee2e2/b91c1c?text=Moov' },
    { id: 18, name: 'Diclofenac Gel', mrp: 120.00, price: 105.00, description: 'Anti-inflammatory gel for effective pain relief. 50g.', imageUrl: 'https://placehold.co/300x200/fecaca/b91c1c?text=Diclofenac' },
    { id: 19, name: 'Saridon Tablet', mrp: 38.00, price: 35.00, description: 'Triple action formula for quick headache relief. 10 tablets.', imageUrl: 'https://placehold.co/300x200/fee2e2/7f1d1d?text=Saridon' },
    { id: 20, name: 'Vicks Vaporub', mrp: 130.00, price: 120.00, description: 'Relief from cough, cold, and blocked nose. 50ml.', imageUrl: 'https://placehold.co/300x200/dbeafe/1e40af?text=Vicks' },
    { id: 21, name: 'Strepsils Lozenges', mrp: 45.00, price: 42.00, description: 'Soothing relief for sore throats. 8 lozenges.', imageUrl: 'https://placehold.co/300x200/e0f2fe/0c4a6e?text=Strepsils' },
    { id: 22, name: 'D-Cold Total Tablets', mrp: 50.00, price: 47.50, description: 'Effective relief from cold and cough symptoms. 10 tablets.', imageUrl: 'https://placehold.co/300x200/dbeafe/1e3a8a?text=D-Cold' },
    { id: 23, name: 'Benadryl Cough Syrup', mrp: 115.00, price: 105.00, description: 'Provides relief from cough and throat irritation. 100ml.', imageUrl: 'https://placehold.co/300x200/e0f2fe/084c6e?text=Benadryl' },
    { id: 24, name: 'Digene Acidity & Gas Relief Gel', mrp: 140.00, price: 128.00, description: 'Mint flavored gel for quick relief from acidity. 200ml.', imageUrl: 'https://placehold.co/300x200/fce7f3/9d2649?text=Digene' },
    { id: 25, name: 'ENO Fruit Salt', mrp: 55.00, price: 52.00, description: 'Lemon flavored powder for fast relief from indigestion. 100g.', imageUrl: 'https://placehold.co/300x200/f0fdf4/166534?text=ENO' },
    { id: 26, name: 'Pudin Hara Pearls', mrp: 30.00, price: 28.00, description: 'Ayurvedic capsules for gas, indigestion, and stomach ache. 10 pearls.', imageUrl: 'https://placehold.co/300x200/dcfce7/15803d?text=Pudin+Hara' },
    { id: 27, name: 'Liv.52 DS Tablets', mrp: 160.00, price: 145.00, description: 'Himalaya supplement for liver health and detoxification. 60 tablets.', imageUrl: 'https://placehold.co/300x200/f7fee7/3f6212?text=Liv.52' },
    { id: 28, name: 'Limcee Vitamin C Chewable Tablets', mrp: 25.00, price: 23.00, description: 'Orange flavored Vitamin C tablets to boost immunity. 15 tablets.', imageUrl: 'https://placehold.co/300x200/fffbeb/b45309?text=Limcee' },
    { id: 29, name: 'Neurobion Forte Tablet', mrp: 35.00, price: 32.50, description: 'Vitamin B complex for nerve health and energy. 30 tablets.', imageUrl: 'https://placehold.co/300x200/fef2f2/991b1b?text=Neurobion' },
    { id: 30, name: 'Zincovit Tablets', mrp: 105.00, price: 95.00, description: 'Multivitamin and multimineral tablets for overall health. 15 tablets.', imageUrl: 'https://placehold.co/300x200/f5f5f5/404040?text=Zincovit' },
    { id: 31, name: 'Shelcal 500mg Tablet', mrp: 120.00, price: 108.00, description: 'Calcium and Vitamin D3 for strong bones. 15 tablets.', imageUrl: 'https://placehold.co/300x200/eef2ff/3730a3?text=Shelcal' },
    { id: 32, name: 'Betadine Ointment', mrp: 110.00, price: 102.00, description: 'Antiseptic ointment for cuts, wounds, and burns. 20g.', imageUrl: 'https://placehold.co/300x200/fef2f2/b91c1c?text=Betadine' },
    { id: 33, name: 'Soframycin Skin Cream', mrp: 50.00, price: 46.00, description: 'Antibiotic cream for bacterial skin infections. 30g.', imageUrl: 'https://placehold.co/300x200/fafafa/525252?text=Soframycin' },
    { id: 34, name: 'Dettol Antiseptic Liquid', mrp: 180.00, price: 170.00, description: 'Protects from germs, for first aid and personal hygiene. 250ml.', imageUrl: 'https://placehold.co/300x200/f0fdf4/16a34a?text=Dettol' },
    { id: 35, name: 'Boro Plus Antiseptic Cream', mrp: 85.00, price: 80.00, description: 'Ayurvedic cream for dry skin, cuts, and cracked lips. 80ml.', imageUrl: 'https://placehold.co/300x200/ecfdf5/059669?text=Boro+Plus' },
    { id: 36, name: 'Azithromycin 500mg', mrp: 120.00, price: 110.00, description: 'Broad-spectrum antibiotic. 3 tablets.', imageUrl: 'https://placehold.co/300x200/ebf4ff/1d4ed8?text=Azithro' },
    { id: 37, name: 'Pantoprazole 40mg', mrp: 100.00, price: 90.00, description: 'Reduces stomach acid. 10 tablets.', imageUrl: 'https://placehold.co/300x200/fdf4ff/86198f?text=Panto' },
    { id: 38, name: 'Ondansetron 4mg', mrp: 55.00, price: 50.00, description: 'Prevents nausea and vomiting. 10 tablets.', imageUrl: 'https://placehold.co/300x200/fff7ed/9a3412?text=Ondan' },
    { id: 39, name: 'Metronidazole 400mg', mrp: 20.00, price: 18.00, description: 'For bacterial and parasitic infections. 15 tablets.', imageUrl: 'https://placehold.co/300x200/f7fee7/4d7c0f?text=Metro' },
    { id: 40, name: 'Genteal Eye Drops', mrp: 150.00, price: 138.00, description: 'Lubricating eye drops for dry and irritated eyes. 10ml.', imageUrl: 'https://placehold.co/300x200/e0f2fe/0369a1?text=Eye+Drops' },
    { id: 41, name: 'Head & Shoulders Anti-Dandruff Shampoo', mrp: 180.00, price: 165.00, description: 'Clinically proven to remove dandruff. 180ml.', imageUrl: 'https://placehold.co/300x200/e0e7ff/312e81?text=H%26S' },
    { id: 42, name: 'Dove Daily Shine Shampoo', mrp: 160.00, price: 145.00, description: 'For smooth and shiny hair. 180ml.', imageUrl: 'https://placehold.co/300x200/f5f5f5/44403c?text=Dove' },
    { id: 43, name: 'Clinic Plus Strong & Long Shampoo', mrp: 105.00, price: 99.00, description: 'With milk protein for strong hair. 180ml.', imageUrl: 'https://placehold.co/300x200/fef2f2/991b1b?text=Clinic+' },
    { id: 44, name: 'Pantene Hair Fall Control Conditioner', mrp: 210.00, price: 195.00, description: 'Strengthens hair from root to tip. 180ml.', imageUrl: 'https://placehold.co/300x200/fefce8/a16207?text=Pantene' },
    { id: 45, name: 'Lifebuoy Total 10 Soap', mrp: 120.00, price: 110.00, description: 'Germ protection soap for the whole family. Pack of 4.', imageUrl: 'https://placehold.co/300x200/fee2e2/991b1b?text=Lifebuoy' },
    { id: 46, name: 'Colgate MaxFresh Toothpaste', mrp: 100.00, price: 92.00, description: 'With cooling crystals for intense freshness. 150g.', imageUrl: 'https://placehold.co/300x200/e0f2fe/0891b2?text=Colgate' },
    { id: 47, name: 'Listerine Cool Mint Mouthwash', mrp: 140.00, price: 130.00, description: 'Kills 99.9% of germs that cause bad breath. 250ml.', imageUrl: 'https://placehold.co/300x200/ecfdf5/047857?text=Listerine' },
    { id: 48, name: 'Nivea Soft Moisturizing Cream', mrp: 185.00, price: 170.00, description: 'Light moisturizer for face, hands, and body. 100ml.', imageUrl: 'https://placehold.co/300x200/dbeafe/1e40af?text=Nivea' },
    { id: 49, name: 'Glucon-D Instant Energy', mrp: 160.00, price: 150.00, description: 'Enriched with Vitamin C for a quick energy boost. 450g.', imageUrl: 'https://placehold.co/300x200/fef08a/854d0e?text=Glucon-D' },
    { id: 50, name: 'Electral Powder (ORS)', mrp: 22.00, price: 21.00, description: 'Oral rehydration salts for dehydration. 21.8g sachet.', imageUrl: 'https://placehold.co/300x200/fed7aa/c2410c?text=Electral' },
    { id: 51, name: 'Horlicks Classic Malt Health Drink', mrp: 250.00, price: 235.00, description: 'Nutritional drink for growing children. 500g Jar.', imageUrl: 'https://placehold.co/300x200/fae8ff/701a75?text=Horlicks' },
    { id: 52, name: 'Quaker Oats', mrp: 195.00, price: 180.00, description: '100% whole grain oats for a healthy start to your day. 1kg pack.', imageUrl: 'https://placehold.co/300x200/fef2f2/991b1b?text=Oats' },
    { id: 53, name: 'Kellogg\'s Corn Flakes', mrp: 180.00, price: 172.00, description: 'Classic corn flakes for a nutritious breakfast. 475g.', imageUrl: 'https://placehold.co/300x200/fefce8/a16207?text=Kellogg\'s' },
    { id: 54, name: 'Thums Up Soft Drink', mrp: 40.00, price: 40.00, description: 'Strong, fizzy, and refreshing cola. 750ml bottle.', imageUrl: 'https://placehold.co/300x200/171717/f5f5f5?text=Thums+Up' },
    { id: 55, name: 'Coca-Cola Soft Drink', mrp: 40.00, price: 40.00, description: 'The original great tasting refreshment. 750ml bottle.', imageUrl: 'https://placehold.co/300x200/dc2626/fef2f2?text=Coke' },
    { id: 56, name: 'Sprite Soft Drink', mrp: 40.00, price: 40.00, description: 'Clear lime and lemon flavored soft drink. 750ml bottle.', imageUrl: 'https://placehold.co/300x200/16a34a/f0fdf4?text=Sprite' },
    { id: 57, name: 'Real Activ Mixed Fruit Juice', mrp: 120.00, price: 115.00, description: '100% mixed fruit juice with no added sugar. 1L pack.', imageUrl: 'https://placehold.co/300x200/fbbf24/92400e?text=Real' },
    { id: 58, name: 'Yoga Bar Protein Bar', mrp: 240.00, price: 220.00, description: 'Chocolate Brownie flavor, high protein snack. Pack of 6.', imageUrl: 'https://placehold.co/300x200/422006/fef3c7?text=Yoga+Bar' },
    { id: 59, name: 'Omron BP Monitor HEM-7120', mrp: 2200.00, price: 1999.00, description: 'Fully automatic digital blood pressure monitor.', imageUrl: 'https://placehold.co/300x200/f3f4f6/4b5563?text=BP+Monitor' },
    { id: 60, name: 'Accu-Chek Active Test Strips', mrp: 975.00, price: 899.00, description: 'Blood glucose test strips for use with Accu-Chek Active. 50 strips.', imageUrl: 'https://placehold.co/300x200/e0f2fe/0c4a6e?text=Strips' },
    { id: 61, name: 'Dr. Morepen Pulse Oximeter', mrp: 2500.00, price: 1499.00, description: 'Measures blood oxygen saturation (SpO2) and pulse rate.', imageUrl: 'https://placehold.co/300x200/e5e7eb/374151?text=Oximeter' },
    { id: 62, name: 'Omron Compressor Nebulizer NE-C101', mrp: 1800.00, price: 1650.00, description: 'For respiratory problems like asthma. Easy to use.', imageUrl: 'https://placehold.co/300x200/f9fafb/374151?text=Nebulizer' },
    { id: 63, name: 'Hot Water Bag', mrp: 350.00, price: 280.00, description: 'High quality rubber bag for pain relief and warmth.', imageUrl: 'https://placehold.co/300x200/f87171/7f1d1d?text=Hot+Bag' },
    { id: 64, name: 'Himalaya Septilin Tablets', mrp: 170, price: 155, description: 'Boosts immunity and builds resistance to infections. 60 tablets.', imageUrl: 'https://placehold.co/300x200/dcfce7/14532d?text=Septilin' },
    { id: 65, name: 'Cetaphil Gentle Skin Cleanser', mrp: 350, price: 320, description: 'Mild, non-irritating cleanser for all skin types. 125ml.', imageUrl: 'https://placehold.co/300x200/e0f2fe/0369a1?text=Cetaphil' },
    { id: 66, name: 'Revital H Women Tablets', mrp: 340, price: 310, description: 'Multivitamin supplement for women\'s health and well-being. 30 tablets.', imageUrl: 'https://placehold.co/300x200/fbcfe8/9d2649?text=Revital+W' },
    { id: 67, name: 'Dabur Chyawanprash', mrp: 390, price: 365, description: 'Ayurvedic formula for immunity and strength. 1kg.', imageUrl: 'https://placehold.co/300x200/422006/fef3c7?text=Chyawanprash' },
    { id: 68, name: 'Ensure Nutrition Powder', mrp: 550, price: 510, description: 'Complete, balanced nutrition for adults. Chocolate flavor. 400g.', imageUrl: 'https://placehold.co/300x200/e2e8f0/334155?text=Ensure' },
    { id: 69, name: 'Gaviscon Liquid', mrp: 150, price: 140, description: 'Fast-acting relief from heartburn and indigestion. 150ml.', imageUrl: 'https://placehold.co/300x200/fde68a/854d0e?text=Gaviscon' },
    { id: 70, name: 'Otrivin Nasal Spray', mrp: 95, price: 88, description: 'Quickly unblocks a stuffy nose. 10ml.', imageUrl: 'https://placehold.co/300x200/ccfbf1/0f766e?text=Otrivin' },
    { id: 71, name: 'Crocin Pain Relief Tablet', mrp: 30, price: 28, description: 'Targeted pain and fever relief. 15 tablets.', imageUrl: 'https://placehold.co/300x200/f87171/7f1d1d?text=Crocin' },
    { id: 72, name: 'Band-Aid Assorted Pack', mrp: 110, price: 100, description: 'Waterproof and fabric bandages for all wound types. 40 strips.', imageUrl: 'https://placehold.co/300x200/e5e7eb/4b5563?text=Band-Aid' },
    { id: 73, name: 'Isabgol (Psyllium Husk)', mrp: 150, price: 135, description: 'Natural fiber for relief from constipation. 100g.', imageUrl: 'https://placehold.co/300x200/f0abfc/86198f?text=Isabgol' },
    { id: 74, name: 'Sensodyne Toothpaste', mrp: 190, price: 175, description: 'Relief and protection for sensitive teeth. 150g.', imageUrl: 'https://placehold.co/300x200/cffafe/0e7490?text=Sensodyne' },
    { id: 75, name: 'Himalaya Neem Face Wash', mrp: 140, price: 125, description: 'Purifying face wash for pimple-free, clear skin. 100ml.', imageUrl: 'https://placehold.co/300x200/dcfce7/166534?text=Neem+FW' },
    { id: 76, name: 'Sugar Free Gold', mrp: 150, price: 138, description: 'Low-calorie sweetener for health-conscious individuals. 100 pellets.', imageUrl: 'https://placehold.co/300x200/fef08a/854d0e?text=SugarFree' },
    { id: 77, name: 'Pediasure Health Drink', mrp: 600, price: 560, description: 'Complete nutrition for kids. Vanilla delight. 400g.', imageUrl: 'https://placehold.co/300x200/f0f9ff/0284c7?text=Pediasure' },
    { id: 78, name: 'Protinex Protein Powder', mrp: 625, price: 580, description: 'High-protein supplement for strength and immunity. Tasty Chocolate. 400g.', imageUrl: 'https://placehold.co/300x200/27272a/fafafa?text=Protinex' },
    { id: 79, name: 'Vicks Inhaler', mrp: 60, price: 58, description: 'Provides quick relief from blocked noses. Pack of 1.', imageUrl: 'https://placehold.co/300x200/bfdbfe/1e40af?text=Inhaler' },
    { id: 80, name: 'Burnol Cream', mrp: 65, price: 60, description: 'Antiseptic cream for minor burns, cuts, and wounds. 20g.', imageUrl: 'https://placehold.co/300x200/fed7d7/991b1b?text=Burnol' },
    { id: 81, name: 'L-Arginine Sachets', mrp: 450, price: 410, description: 'Amino acid supplement for cardiovascular health. 10 sachets.', imageUrl: 'https://placehold.co/300x200/fde68a/854d0e?text=L-Arginine' },
    { id: 82, name: 'Cremaffin Plus Syrup', mrp: 210, price: 195, description: 'Laxative syrup for constipation relief. Mixed Fruit. 225ml.', imageUrl: 'https://placehold.co/300x200/fbcfe8/9d2649?text=Cremaffin' },
    { id: 83, name: 'Tata Simply Better Green Tea', mrp: 500, price: 450, description: 'Rich in antioxidants for a healthy lifestyle. 100 tea bags.', imageUrl: 'https://placehold.co/300x200/bef264/4d7c0f?text=Green+Tea' },
    { id: 84, name: 'Saffola Masala Oats', mrp: 180, price: 170, description: 'Healthy and tasty oats. Classic Masala. 500g.', imageUrl: 'https://placehold.co/300x200/fdba74/c2410c?text=Saffola+Oats' },
    { id: 85, name: 'Maaza Mango Drink', mrp: 80, price: 80, description: 'Refreshing mango drink to quench your thirst. 1.2L.', imageUrl: 'https://placehold.co/300x200/fca5a5/991b1b?text=Maaza' },
    { id: 86, name: 'Gillette Guard Razor', mrp: 30, price: 28, description: 'Single-blade razor for a safe and affordable shave.', imageUrl: 'https://placehold.co/300x200/bae6fd/075985?text=Gillette' },
    { id: 87, name: 'Parachute Coconut Oil', mrp: 210, price: 198, description: '100% pure coconut oil for hair and skin. 500ml.', imageUrl: 'https://placehold.co/300x200/e0f2fe/0369a1?text=Parachute' },
    { id: 88, name: 'Himalaya Baby Powder', mrp: 175, price: 160, description: 'Gentle and soothing powder for baby\'s delicate skin. 400g.', imageUrl: 'https://placehold.co/300x200/fce7f3/be185d?text=Baby+Powder' },
    { id: 89, name: 'Stayfree Secure Pads', mrp: 150, price: 140, description: 'Extra large sanitary pads for all-round protection. 20 count.', imageUrl: 'https://placehold.co/300x200/f3e8ff/581c87?text=Stayfree' },
    { id: 90, name: 'Durex Condoms - Extra Time', mrp: 220, price: 205, description: 'Performa lubricant for a long-lasting experience. Pack of 10.', imageUrl: 'https://placehold.co/300x200/dbeafe/1e3a8a?text=Durex' },
    { id: 91, name: 'Ciplox Eye/Ear Drops', mrp: 20, price: 18.50, description: 'Ciprofloxacin drops for bacterial infections. 10ml.', imageUrl: 'https://placehold.co/300x200/f0f9ff/0284c7?text=Ciplox' },
    { id: 92, name: 'Avil 25 Tablet', mrp: 10, price: 9.00, description: 'For relief from allergies and allergic reactions. 15 tablets.', imageUrl: 'https://placehold.co/300x200/f5f3ff/4c1d95?text=Avil' },
    { id: 93, name: 'Gelusil MPS Syrup', mrp: 125, price: 115, description: 'Antacid and antiflatulent syrup. 200ml.', imageUrl: 'https://placehold.co/300x200/fdf2f8/831843?text=Gelusil' },
    { id: 94, name: 'Fybogel Orange', mrp: 230, price: 215, description: 'High-fibre drink for constipation relief. 10 sachets.', imageUrl: 'https://placehold.co/300x200/ffedd5/c2410c?text=Fybogel' },
    { id: 95, name: 'Waterbury\'s Compound', mrp: 180, price: 172, description: 'Tonic for building strength and energy. 450ml.', imageUrl: 'https://placehold.co/300x200/7f1d1d/fef2f2?text=Waterburys' },
    { id: 96, name: 'Himalaya Koflet Syrup', mrp: 90, price: 82, description: 'Ayurvedic cough reliever for all ages. 100ml.', imageUrl: 'https://placehold.co/300x200/fef3c7/854d0e?text=Koflet' },
    { id: 97, name: 'Itch Guard Cream', mrp: 90, price: 85, description: 'Fast relief from fungal infections and itching. 20g.', imageUrl: 'https://placehold.co/300x200/e0f2fe/0369a1?text=Itch+Guard' },
    { id: 98, name: 'Krack Cream', mrp: 60, price: 55, description: 'Heel repair cream for cracked and dry heels. 25g.', imageUrl: 'https://placehold.co/300x200/fde68a/854d0e?text=Krack' },
    { id: 99, name: 'Garnier Men Face Wash', mrp: 180, price: 165, description: 'Power White face wash for a brighter skin tone. 100g.', imageUrl: 'https://placehold.co/300x200/44403c/f5f5f5?text=Garnier' },
    { id: 100, name: 'Set Wet Hair Gel', mrp: 120, price: 110, description: 'Vertical hold styling gel for a cool look. 100ml.', imageUrl: 'https://placehold.co/300x200/1d4ed8/ebf4ff?text=Set+Wet' },
    { id: 101, name: 'Fevicol MR', mrp: 25, price: 25, description: 'All-purpose white adhesive for crafts and repairs. 50g.', imageUrl: 'https://placehold.co/300x200/fafafa/18181b?text=Fevicol' },
    { id: 102, name: 'Vaseline Petroleum Jelly', mrp: 110, price: 105, description: 'Original skin protectant for dry skin. 85g.', imageUrl: 'https://placehold.co/300x200/dbeafe/1e3a8a?text=Vaseline' },
    { id: 103, name: 'Fair and Lovely Glow Cream', mrp: 120, price: 112, description: 'Advanced multivitamin cream for glowing skin. 50g.', imageUrl: 'https://placehold.co/300x200/fbcfe8/9d2649?text=Glow' },
    { id: 104, name: 'Eno Powder (Orange)', mrp: 10, price: 10, description: 'Quick action acidity relief. Single sachet.', imageUrl: 'https://placehold.co/300x200/ffedd5/c2410c?text=ENO' },
    { id: 105, name: 'Clotrimazole Dusting Powder', mrp: 115, price: 105, description: 'Antifungal powder for skin infections. 100g.', imageUrl: 'https://placehold.co/300x200/e0e7ff/312e81?text=Powder' },
    { id: 106, name: 'Gripe Water', mrp: 60, price: 55, description: 'For infant colic, gas, and stomach discomfort. 150ml.', imageUrl: 'https://placehold.co/300x200/cffafe/0891b2?text=Gripe' },
    { id: 107, name: 'Amrutanjan Pain Balm', mrp: 45, price: 42, description: 'Strong balm for headache and body pain. 9g.', imageUrl: 'https://placehold.co/300x200/fef08a/854d0e?text=Amrutanjan' },
    { id: 108, name: 'Iodex Balm', mrp: 75, price: 70, description: 'Multi-purpose pain balm for fast relief. 16g.', imageUrl: 'https://placehold.co/300x200/18181b/fafafa?text=Iodex' },
    { id: 109, name: 'Hansaplast Washproof Plasters', mrp: 40, price: 38, description: 'Medicated dressing plasters. 10 strips.', imageUrl: 'https://placehold.co/300x200/e5e7eb/4b5563?text=Hansaplast' },
    { id: 110, name: 'Savlon Antiseptic Liquid', mrp: 80, price: 75, description: 'For first aid and personal use. 100ml.', imageUrl: 'https://placehold.co/300x200/dbeafe/1e3a8a?text=Savlon' },
    { id: 111, name: 'Oral-B Toothbrush', mrp: 120, price: 110, description: 'Pro-Health Gum Care toothbrush. Pack of 3.', imageUrl: 'https://placehold.co/300x200/e0f2fe/0369a1?text=Oral-B' },
    { id: 112, name: 'Pepsodent Germicheck Toothpaste', mrp: 95, price: 88, description: 'Fights germs and cavities for 12 hours. 150g.', imageUrl: 'https://placehold.co/300x200/dbeafe/1e3a8a?text=Pepsodent' },
    { id: 113, name: 'Patanjali Dant Kanti Toothpaste', mrp: 90, price: 85, description: 'Ayurvedic toothpaste for healthy teeth and gums. 150g.', imageUrl: 'https://placehold.co/300x200/ffedd5/c2410c?text=Dant+Kanti' },
    { id: 114, name: 'Vicco Turmeric Cream', mrp: 180, price: 170, description: 'Ayurvedic skin cream with turmeric extract. 70g.', imageUrl: 'https://placehold.co/300x200/fef08a/854d0e?text=Vicco' },
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

export const updateUser = (updatedUser: User): User => {
    const users = getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index === -1) {
        throw new Error("User not found for update.");
    }
    users[index] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Also update the user in the 'bhc-user' session storage if it's the current user
    const storedUserJson = localStorage.getItem('bhc-user');
    if (storedUserJson) {
        const storedUser = JSON.parse(storedUserJson);
        if (storedUser.id === updatedUser.id) {
            localStorage.setItem('bhc-user', JSON.stringify(updatedUser));
        }
    }

    return updatedUser;
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
      report_pdf_base64: reportBase64,
    };

    const updatedAppointments = [...appointments, newAppointment];
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));

    return { message: 'Appointment booked successfully!' };
};

export const getAllSessions = (): UserSession[] => {
    try {
        const sessions = localStorage.getItem(SESSIONS_KEY);
        return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
        console.error("Failed to get sessions from localStorage", error);
        return [];
    }
};

export const addSession = (sessionData: Omit<UserSession, 'id'>) => {
    try {
        const sessions = getAllSessions();
        const newId = sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 1;
        const newSession: UserSession = { id: newId, ...sessionData };
        const updatedSessions = [newSession, ...sessions].slice(0, 50); // Keep last 50 sessions
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
        console.error('Failed to write session data:', error);
    }
};


// Medicine DB functions
export const getMedicines = (): Medicine[] => {
    try {
        const medicines = localStorage.getItem(MEDICINES_KEY);
        return medicines ? JSON.parse(medicines) : [];
    } catch (e) { console.error(e); return []; }
};

export const addMedicine = (medicine: MedicineIn): Medicine => {
    const medicines = getMedicines();
    const newId = medicines.length > 0 ? Math.max(...medicines.map(m => m.id)) + 1 : 1;
    const newMedicine: Medicine = { id: newId, ...medicine };
    localStorage.setItem(MEDICINES_KEY, JSON.stringify([...medicines, newMedicine]));
    return newMedicine;
};

export const updateMedicine = (medicineToUpdate: Medicine): Medicine => {
    const medicines = getMedicines();
    const index = medicines.findIndex(m => m.id === medicineToUpdate.id);
    if (index === -1) throw new Error("Medicine not found for update.");
    medicines[index] = medicineToUpdate;
    localStorage.setItem(MEDICINES_KEY, JSON.stringify(medicines));
    return medicineToUpdate;
};

export const deleteMedicine = (id: number): void => {
    const medicines = getMedicines();
    const updatedMedicines = medicines.filter(m => m.id !== id);
    localStorage.setItem(MEDICINES_KEY, JSON.stringify(updatedMedicines));
};


// Medicine Order DB functions
export const getAllMedicineOrders = (): MedicineOrder[] => {
    try {
        const orders = localStorage.getItem(MEDICINE_ORDERS_KEY);
        return orders ? JSON.parse(orders) : [];
    } catch (e) { console.error(e); return []; }
};

export const getMedicineOrdersForUser = (userId: number): MedicineOrder[] => {
    return getAllMedicineOrders().filter(order => order.userId === userId);
};

export const placeMedicineOrder = (userId: number, cart: { [medicineId: number]: number }, address: Address, deliveryFee: number, promiseFee: number): MedicineOrder => {
    const allOrders = getAllMedicineOrders();
    const medicines = getMedicines();

    const items = Object.entries(cart).map(([id, quantity]) => {
        const medicine = medicines.find(m => m.id === Number(id));
        if (!medicine) throw new Error(`Medicine with ID ${id} not found.`);
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
        trackingHistory: [{ status: 'Processing', timestamp: new Date().toISOString() }],
    };
    
    localStorage.setItem(MEDICINE_ORDERS_KEY, JSON.stringify([...allOrders, newOrder]));
    return newOrder;
};

export const updateMedicineOrderStatus = (orderId: number, status: MedicineOrder['status']): void => {
    const orders = getAllMedicineOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error("Medicine order not found.");
    
    orders[index].status = status;
    orders[index].trackingHistory.push({ status, timestamp: new Date().toISOString() });

    localStorage.setItem(MEDICINE_ORDERS_KEY, JSON.stringify(orders));
};

// Address DB functions
export const getAddressesForUser = (userId: number): Address[] => {
     try {
        const allAddresses = localStorage.getItem(ADDRESSES_KEY);
        if (!allAddresses) return [];
        return JSON.parse(allAddresses).filter((addr: Address) => addr.userId === userId);
    } catch (e) { console.error(e); return []; }
};

export const addAddress = (address: Omit<Address, 'id'>): Address => {
    const allAddresses = JSON.parse(localStorage.getItem(ADDRESSES_KEY) || '[]');
    const newId = allAddresses.length > 0 ? Math.max(...allAddresses.map((a: Address) => a.id)) + 1 : 1;
    const newAddress: Address = { id: newId, ...address };
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify([...allAddresses, newAddress]));
    return newAddress;
};

export const updateAddress = (id: number, updatedAddress: Omit<Address, 'id'>): Address => {
    const allAddresses = JSON.parse(localStorage.getItem(ADDRESSES_KEY) || '[]');
    const index = allAddresses.findIndex((a: Address) => a.id === id);
    if (index === -1) throw new Error("Address not found.");
    allAddresses[index] = { id, ...updatedAddress };
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(allAddresses));
    return allAddresses[index];
};

export const deleteAddress = (id: number): void => {
    const allAddresses = JSON.parse(localStorage.getItem(ADDRESSES_KEY) || '[]');
    const updatedAddresses = allAddresses.filter((a: Address) => a.id !== id);
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(updatedAddresses));
};

// Lab Test DB Functions
export const getLabTests = (): LabTest[] => {
    try {
        const tests = localStorage.getItem(LAB_TESTS_KEY);
        return tests ? JSON.parse(tests) : [];
    } catch (e) { console.error(e); return []; }
};

export const getAllLabTestBookings = (): LabTestBooking[] => {
    try {
        const bookings = localStorage.getItem(LAB_TEST_BOOKINGS_KEY);
        return bookings ? JSON.parse(bookings) : [];
    } catch (e) { console.error(e); return []; }
};

export const getLabTestBookingsForUser = (userId: number): LabTestBooking[] => {
    return getAllLabTestBookings().filter(b => b.userId === userId);
};

export const bookLabTest = (data: LabTestBookingIn): { message: string } => {
    const allBookings = getAllLabTestBookings();
    const test = getLabTests().find(t => t.id === data.testId);
    if (!test) throw new Error("Lab test not found.");

    const newId = allBookings.length > 0 ? Math.max(...allBookings.map(b => b.id)) + 1 : 1;
    
    const subtotal = test.price;
    const gst = subtotal * GST_RATE;
    const totalAmount = subtotal + gst;

    const newBooking: LabTestBooking = {
        id: newId,
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
        trackingHistory: [{ status: 'Booked', timestamp: new Date().toISOString() }],
    };

    localStorage.setItem(LAB_TEST_BOOKINGS_KEY, JSON.stringify([...allBookings, newBooking]));
    return { message: 'Lab test booked successfully!' };
};

export const updateLabTestBookingStatus = (bookingId: number, status: LabTestBooking['status']): void => {
    const bookings = getAllLabTestBookings();
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index === -1) throw new Error("Booking not found.");
    
    bookings[index].status = status;
    bookings[index].trackingHistory.push({ status, timestamp: new Date().toISOString() });

    localStorage.setItem(LAB_TEST_BOOKINGS_KEY, JSON.stringify(bookings));
};

// Universal Delivery Info Assignment
export const assignDeliveryInfo = (orderType: 'medicine' | 'lab', orderId: number, deliveryBoy: DeliveryBoy): void => {
    if (orderType === 'medicine') {
        const orders = getAllMedicineOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index === -1) throw new Error("Medicine order not found.");
        
        orders[index].deliveryBoy = deliveryBoy;
        // Optionally update status and add tracking history
        if (orders[index].status === 'Processing') {
            orders[index].status = 'Shipped';
            orders[index].trackingHistory.push({ status: 'Shipped', timestamp: new Date().toISOString(), notes: `Assigned to ${deliveryBoy.name}` });
        } else {
            orders[index].trackingHistory.push({ status: orders[index].status, timestamp: new Date().toISOString(), notes: `Assigned to ${deliveryBoy.name}` });
        }
        
        localStorage.setItem(MEDICINE_ORDERS_KEY, JSON.stringify(orders));

    } else if (orderType === 'lab') {
        const bookings = getAllLabTestBookings();
        const index = bookings.findIndex(b => b.id === orderId);
        if (index === -1) throw new Error("Lab test booking not found.");

        bookings[index].deliveryBoy = deliveryBoy;
        if (bookings[index].status === 'Booked') {
            bookings[index].status = 'Sample Collected';
            bookings[index].trackingHistory.push({ status: 'Sample Collected', timestamp: new Date().toISOString(), notes: `Phlebotomist: ${deliveryBoy.name}` });
        } else {
            bookings[index].trackingHistory.push({ status: bookings[index].status, timestamp: new Date().toISOString(), notes: `Phlebotomist: ${deliveryBoy.name}` });
        }
        
        localStorage.setItem(LAB_TEST_BOOKINGS_KEY, JSON.stringify(bookings));
    }
};


// Wishlist DB functions
export const getWishlist = (userId: number): number[] => {
    try {
        const wishlistJson = localStorage.getItem(`${WISHLIST_KEY_PREFIX}${userId}`);
        return wishlistJson ? JSON.parse(wishlistJson) : [];
    } catch (e) {
        console.error("Failed to get wishlist from localStorage", e);
        return [];
    }
};

export const isMedicineInWishlist = (userId: number, medicineId: number): boolean => {
    const wishlist = getWishlist(userId);
    return wishlist.includes(medicineId);
};

export const addToWishlist = (userId: number, medicineId: number): void => {
    try {
        const wishlist = getWishlist(userId);
        if (!wishlist.includes(medicineId)) {
            const updatedWishlist = [...wishlist, medicineId];
            localStorage.setItem(`${WISHLIST_KEY_PREFIX}${userId}`, JSON.stringify(updatedWishlist));
        }
    } catch (e) {
        console.error("Failed to add to wishlist in localStorage", e);
    }
};

export const removeFromWishlist = (userId: number, medicineId: number): void => {
    try {
        const wishlist = getWishlist(userId);
        const updatedWishlist = wishlist.filter(id => id !== medicineId);
        localStorage.setItem(`${WISHLIST_KEY_PREFIX}${userId}`, JSON.stringify(updatedWishlist));
    } catch (e) {
        console.error("Failed to remove from wishlist in localStorage", e);
    }
};