
import { useState, useCallback, useEffect } from 'react';
import * as db from '../services/dbService';
import { User, Doctor, Appointment, PharmaCompany, UserSession, Medicine, MedicineOrder, Address, LabTest, LabTestBooking, MedicineReminder, LabTestReminder } from '../types';

export function useMockDb(currentUser: User | null) {
    const [data, setData] = useState({
        users: [] as User[],
        doctors: [] as Doctor[],
        appointments: [] as Appointment[],
        pharmaCompanies: [] as PharmaCompany[],
        sessions: [] as UserSession[],
        medicines: [] as Medicine[],
        allMedicineOrders: [] as MedicineOrder[],
        addresses: [] as Address[],
        labTests: [] as LabTest[],
        allLabTestBookings: [] as LabTestBooking[],
        userAppointments: [] as Appointment[],
        medicineOrders: [] as MedicineOrder[],
        labTestBookings: [] as LabTestBooking[],
        medicineReminders: [] as MedicineReminder[],
        labTestReminders: [] as LabTestReminder[],
    });

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

        let userSpecificData = {
            userAppointments: [] as Appointment[],
            medicineOrders: [] as MedicineOrder[],
            labTestBookings: [] as LabTestBooking[],
            addresses: [] as Address[],
            medicineReminders: [] as MedicineReminder[],
            labTestReminders: [] as LabTestReminder[],
        };

        if (currentUser) {
            userSpecificData = {
                userAppointments: allAppointments.filter(a => a.userId === currentUser.id),
                medicineOrders: db.getMedicineOrdersForUser(currentUser.id),
                labTestBookings: db.getLabTestBookingsForUser(currentUser.id),
                addresses: db.getAddressesForUser(currentUser.id),
                medicineReminders: db.getMedicineRemindersForUser(currentUser.id),
                labTestReminders: db.getLabTestRemindersForUser(currentUser.id),
            };
        }

        setData({
            users: allUsers,
            doctors: allDoctors,
            appointments: allAppointments,
            pharmaCompanies: allPharmaCompanies,
            sessions: allSessions,
            medicines: allMedicines,
            allMedicineOrders: allOrders,
            labTests: allLabTests,
            allLabTestBookings: allBookings,
            ...userSpecificData,
        });
    }, [currentUser]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    return { ...data, refreshData };
}
