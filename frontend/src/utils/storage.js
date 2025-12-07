import axios from 'axios';

// --- Configuration ---
// Read the API URL from the environment variable (set in frontend/.env)
const API_URL = process.env.REACT_APP_API_URL;
if (!API_URL) {
    console.error("REACT_APP_API_URL not set. Check your frontend/.env file.");
}

// Authentication for admin requests (using Basic Auth)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const authHeader = {
    headers: {
        Authorization: `Basic ${btoa(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`)}`
    }
};

const STORAGE_KEYS = {
    CURRENT_USER: 'pg_current_user'
};

// --- Frontend Utility Functions (Calculations) ---

export const calculateBillTotal = (bill) => {
    // Total expected bill remains the sum of charges
    return (bill.rent || 0) + (bill.electricity || 0) + (bill.food || 0) + (bill.other || 0);
};

export const getUnpaidBills = (resident) => {
    if (!resident || !resident.bills) return [];
    // UPDATED LOGIC: A bill is unpaid if the total bill is greater than the paid amount
    return resident.bills.filter(b => calculateBillTotal(b) > (b.paidAmount || 0));
};

export const getTotalPending = (resident) => {
    // UPDATED LOGIC: Pending is the sum of (totalBill - paidAmount) for all bills
    const allBills = resident.bills || [];
    
    return allBills.reduce((totalPendingSum, bill) => {
        const totalBill = calculateBillTotal(bill);
        const paid = bill.paidAmount || 0;
        const due = totalBill - paid;
        return totalPendingSum + Math.max(0, due); // Only count positive dues
    }, 0);
};


// --- API Wrapper Functions ---

// Fetches ALL residents
export const getResidents = async () => {
    try {
        const response = await axios.get(`${API_URL}/residents`);
        return response.data;
    } catch (error) {
        console.error("Error fetching residents:", error);
        return [];
    }
};

// Fetches all residents and pre-calculates the total due for the Dashboard
export const getAllResidentsWithCalculations = async () => {
    const residents = await getResidents();
    if (!Array.isArray(residents)) {
        console.error("API did not return an array of residents.");
        return [];
    }
    
    return residents.map(resident => ({
        ...resident,
        // Calculate total due using the existing utility function
        totalDue: getTotalPending(resident)
    }));
};


// Fetches a single resident by ID
export const getResidentById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/residents/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching resident ${id}:`, error);
        return null;
    }
};

// Fetches admin credentials
export const getAdminCredentials = () => {
    return {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
        name: 'Admin',
        email: 'admin@lakeviewsainik.com'
    };
};

// RESIDENT MANAGEMENT (Admin Only)

export const addResident = async (resident) => {
    try {
        const response = await axios.post(`${API_URL}/residents`, resident, authHeader);
        return response.data;
    } catch (error) {
        console.error("Error adding resident:", error);
        throw error;
    }
};

export const updateResident = async (id, updates) => {
    try {
        const response = await axios.put(`${API_URL}/residents/${id}`, updates, authHeader);
        return response.data;
    } catch (error) {
        console.error(`Error updating resident ${id}:`, error);
        throw error;
    }
};

export const deleteResident = async (id) => {
    try {
        await axios.delete(`${API_URL}/residents/${id}`, authHeader);
    } catch (error) {
        console.error(`Error deleting resident ${id}:`, error);
        throw error;
    }
};

// BILL MANAGEMENT (Admin Only)

export const updateResidentBill = async (residentId, month, year, billData) => {
    // The API handles both adding a new bill and updating an existing one
    // Remove 'paid' field and use the new 'paidAmount' field
    const billPayload = {
        month,
        year,
        rent: billData.rent,
        electricity: billData.electricity,
        food: billData.food,
        other: billData.other,
        paidAmount: billData.paidAmount, // NEW FIELD
        dueDate: billData.dueDate,
        paidDate: billData.paidAmount > 0 ? (billData.paidDate || new Date().toISOString().split('T')[0]) : null
    };

    try {
        const response = await axios.post(`${API_URL}/residents/${residentId}/bills`, billPayload, authHeader);
        return response.data;
    } catch (error) {
        console.error(`Error adding/updating bill for resident ${residentId}:`, error);
        throw error;
    }
};

// --- Local Storage User State (for session management) ---

export const setCurrentUser = (user) => {
    // Only store minimal info for session (id/type), not the whole resident object
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({
        id: user.id,
        type: user.type,
        name: user.name,
        room: user.room 
    }));
};

export const getCurrentUser = () => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
};

export const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

// Note: initializeStorage is no longer needed
export const initializeStorage = () => {
    console.log("Storage initialization delegated to API.");
};