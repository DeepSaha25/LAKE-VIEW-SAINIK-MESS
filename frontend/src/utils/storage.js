// LocalStorage utility functions for PG Management

const STORAGE_KEYS = {
  RESIDENTS: 'pg_residents',
  ADMIN: 'pg_admin',
  CURRENT_USER: 'pg_current_user'
};

// Initialize storage with sample data
export const initializeStorage = () => {
  // Check if data already exists
  const existingResidents = localStorage.getItem(STORAGE_KEYS.RESIDENTS);
  
  if (!existingResidents) {
    // Sample residents data
    const sampleResidents = [
      {
        id: '1',
        name: 'Rahul Kumar',
        room: '101',
        phone: '9876543210',
        email: 'rahul@example.com',
        joinDate: '2024-01-01',
        bills: [
          {
            month: 'November',
            year: 2024,
            rent: 5000,
            electricity: 800,
            food: 3500,
            other: 200,
            paid: false,
            dueDate: '2024-11-05'
          },
          {
            month: 'October',
            year: 2024,
            rent: 5000,
            electricity: 750,
            food: 3500,
            other: 150,
            paid: true,
            paidDate: '2024-10-03',
            dueDate: '2024-10-05'
          }
        ]
      },
      {
        id: '2',
        name: 'Priya Sharma',
        room: '102',
        phone: '9876543211',
        email: 'priya@example.com',
        joinDate: '2024-02-15',
        bills: [
          {
            month: 'November',
            year: 2024,
            rent: 5000,
            electricity: 650,
            food: 3500,
            other: 0,
            paid: false,
            dueDate: '2024-11-05'
          },
          {
            month: 'October',
            year: 2024,
            rent: 5000,
            electricity: 700,
            food: 3500,
            other: 100,
            paid: true,
            paidDate: '2024-10-02',
            dueDate: '2024-10-05'
          }
        ]
      },
      {
        id: '3',
        name: 'Amit Patel',
        room: '103',
        phone: '9876543212',
        email: 'amit@example.com',
        joinDate: '2024-01-20',
        bills: [
          {
            month: 'November',
            year: 2024,
            rent: 5000,
            electricity: 900,
            food: 3500,
            other: 500,
            paid: false,
            dueDate: '2024-11-05'
          }
        ]
      }
    ];
    
    localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(sampleResidents));
  }
  
  // Set admin credentials
  const adminData = {
    username: 'admin',
    password: 'admin123',
    name: 'Admin',
    email: 'admin@lakeviewsanic.com'
  };
  localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(adminData));
};

// Get all residents
export const getResidents = () => {
  const data = localStorage.getItem(STORAGE_KEYS.RESIDENTS);
  return data ? JSON.parse(data) : [];
};

// Get resident by ID
export const getResidentById = (id) => {
  const residents = getResidents();
  return residents.find(r => r.id === id);
};

// Add new resident
export const addResident = (resident) => {
  const residents = getResidents();
  const newResident = {
    ...resident,
    id: Date.now().toString(),
    joinDate: new Date().toISOString().split('T')[0],
    bills: []
  };
  residents.push(newResident);
  localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(residents));
  return newResident;
};

// Update resident
export const updateResident = (id, updates) => {
  const residents = getResidents();
  const index = residents.findIndex(r => r.id === id);
  if (index !== -1) {
    residents[index] = { ...residents[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(residents));
    return residents[index];
  }
  return null;
};

// Delete resident
export const deleteResident = (id) => {
  const residents = getResidents();
  const filtered = residents.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(filtered));
};

// Add or update bill for a resident
export const updateResidentBill = (residentId, month, year, billData) => {
  const residents = getResidents();
  const residentIndex = residents.findIndex(r => r.id === residentId);
  
  if (residentIndex !== -1) {
    const resident = residents[residentIndex];
    const billIndex = resident.bills.findIndex(
      b => b.month === month && b.year === year
    );
    
    if (billIndex !== -1) {
      // Update existing bill
      resident.bills[billIndex] = { ...resident.bills[billIndex], ...billData };
    } else {
      // Add new bill
      resident.bills.unshift({ month, year, ...billData });
    }
    
    localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(residents));
    return resident;
  }
  return null;
};

// Get admin credentials
export const getAdminCredentials = () => {
  const data = localStorage.getItem(STORAGE_KEYS.ADMIN);
  return data ? JSON.parse(data) : null;
};

// Set current logged in user
export const setCurrentUser = (user) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

// Get current logged in user
export const getCurrentUser = () => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

// Logout
export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

// Calculate total due for a bill
export const calculateBillTotal = (bill) => {
  return (bill.rent || 0) + (bill.electricity || 0) + (bill.food || 0) + (bill.other || 0);
};

// Get all unpaid bills for a resident
export const getUnpaidBills = (residentId) => {
  const resident = getResidentById(residentId);
  if (!resident) return [];
  return resident.bills.filter(b => !b.paid);
};

// Calculate total pending amount for a resident
export const getTotalPending = (residentId) => {
  const unpaidBills = getUnpaidBills(residentId);
  return unpaidBills.reduce((total, bill) => total + calculateBillTotal(bill), 0);
};