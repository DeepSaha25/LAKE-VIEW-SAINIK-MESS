# Lakeview Sanic Mess PG Management System

A comprehensive web application for managing PG (Paying Guest) accommodations with separate portals for administrators and residents.

## 🌟 Features

### Admin Portal
- **Dashboard Overview**
  - Total residents count and available rooms
  - Occupancy rate with visual progress bar
  - Total pending dues across all residents
  - Total collected payments (all-time)
  - Recent residents activity

- **Resident Management**
  - Add new residents (max capacity: 15)
  - Edit resident information (name, room, phone, email)
  - Delete residents
  - View individual resident dues
  - Capacity tracking and warnings

- **Bills Management**
  - Add monthly bills for residents
  - Breakdown: Rent, Electricity, Food, Other charges
  - Month and year selection
  - Mark bills as paid/unpaid
  - Complete bill history table
  - Due date tracking

### Resident Portal
- **Personal Dashboard**
  - Welcome message with user details
  - Total pending amount display
  - Room number and contact information
  - Month-wise bill selector

- **Bill Details**
  - Detailed breakdown of charges
  - Rent, electricity, food, and other charges
  - Total amount calculation
  - Payment status (Paid/Pending)
  - Due date information

## 🎨 Design Features

### Professional Dashboard Theme
- Clean, modern interface with professional blue color scheme
- Dark sidebar with excellent contrast
- Hover effects and smooth transitions
- Responsive design for all screen sizes
- Card-based layouts for better organization

### Design System
- **Primary Color**: Professional Blue (#4E9AF1)
- **Typography**: Inter font family for clean readability
- **Shadows**: Elegant elevation with shadow system
- **Spacing**: Consistent 4px scale throughout
- **Icons**: Lucide React icons for clarity

## 🔐 Login Credentials

### Admin Access
- **Username**: admin
- **Password**: admin123

### Resident Access
- Select your name from the dropdown list
- Available residents:
  - Rahul Kumar - Room 101
  - Priya Sharma - Room 102
  - Amit Patel - Room 103

## 💾 Data Storage

The application uses **LocalStorage** for data persistence:
- All resident information
- Bill history and payment records
- Month-wise billing data
- No backend required - fully functional as a frontend prototype

### Sample Data
The app comes pre-loaded with 3 sample residents and their billing history for demonstration purposes.

## 🚀 How to Use

### For Administrators

1. **Login**
   - Navigate to the application
   - Click "Admin" tab
   - Enter credentials: admin / admin123

2. **View Dashboard**
   - See overview statistics
   - Monitor pending dues
   - Track occupancy rate

3. **Manage Residents**
   - Click "Residents" in sidebar
   - Add new resident (if capacity available)
   - Edit existing resident details
   - Delete residents if needed

4. **Manage Bills**
   - Click "Bills" in sidebar
   - Add new monthly bill for any resident
   - Enter rent, electricity, food, and other charges
   - Set due date
   - Mark bills as paid when received
   - View complete bill history in table format

### For Residents

1. **Login**
   - Navigate to the application
   - Click "Resident" tab
   - Select your name from dropdown
   - Click "Login as Resident"

2. **View Bills**
   - See total pending amount
   - Select month from dropdown
   - View detailed bill breakdown
   - Check payment status
   - Note due dates

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1920px+)
- Laptop (1280px - 1920px)
- Tablet (768px - 1280px)
- Mobile (320px - 768px)

## 🎯 Key Functionalities

### Admin Features
✅ Add/Edit/Delete residents (max 15)
✅ Add monthly bills with detailed breakdown
✅ Mark bills as paid/unpaid
✅ View complete billing history
✅ Track occupancy and capacity
✅ Monitor pending dues across all residents
✅ View total collections

### Resident Features
✅ View personal billing information
✅ Month-wise bill history
✅ See payment status
✅ Track due dates
✅ View room and contact details
✅ Calculate total pending amount

## 🛠️ Technical Stack

- **Framework**: React.js
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Icons**: Lucide React
- **Routing**: React Router
- **Notifications**: Sonner (Toast)
- **Storage**: LocalStorage
- **State Management**: React Hooks

## 📊 Data Structure

### Resident Object
```javascript
{
  id: "unique_id",
  name: "Full Name",
  room: "Room Number",
  phone: "Phone Number",
  email: "Email Address",
  joinDate: "YYYY-MM-DD",
  bills: [Bill Objects]
}
```

### Bill Object
```javascript
{
  month: "Month Name",
  year: 2024,
  rent: 5000,
  electricity: 800,
  food: 3500,
  other: 200,
  paid: false,
  dueDate: "YYYY-MM-DD",
  paidDate: "YYYY-MM-DD" // if paid
}
```

## 🎨 Color Palette

- **Primary**: HSL(217, 91%, 60%) - Professional Blue
- **Accent**: HSL(173, 80%, 40%) - Teal
- **Success**: HSL(142, 71%, 45%) - Green
- **Warning**: HSL(38, 92%, 50%) - Orange
- **Destructive**: HSL(0, 84%, 60%) - Red
- **Sidebar**: HSL(222, 47%, 11%) - Dark Navy

## 📝 Notes

- Maximum capacity is set to 15 residents
- All data is stored in browser's LocalStorage
- Data persists across sessions
- No backend API required
- **Mock Implementation**: This is a frontend prototype using LocalStorage for data persistence
- Perfect for demonstration and prototyping purposes

## 🔄 Future Enhancements

Potential features for full-stack implementation:
- Backend API integration
- Database storage (MongoDB/PostgreSQL)
- Payment gateway integration
- Email notifications for due dates
- PDF bill generation
- SMS reminders
- Expense tracking for admin
- Receipt upload for residents
- Multi-PG management
- Analytics and reports

## 🐛 Known Limitations

- Data is stored only in browser LocalStorage (cleared on cache clear)
- No real payment processing
- No email/SMS notifications
- Single PG management only
- No backup/restore functionality
- No export to Excel/PDF

## 📞 Support

For any issues or questions, please contact the PG administrator.

---

**Built with ❤️ for Lakeview Sanic Mess PG**
