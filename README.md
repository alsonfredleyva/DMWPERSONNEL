# DMW RO-X Personnel Portal

A modern web application for managing employee information and tracking birthdays from the ROX INFO CSV file. This portal helps DMW RO X organize and display personnel data across all divisions.

## Features

✨ **Dashboard**
- See today's birthdays at a glance
- View this week's upcoming birthdays
- Check this month's birthday schedule
- Browse all upcoming birthdays for the next 30 days with searchable table

📅 **Interactive Calendar**
- Full calendar view with month navigation
- Visual indicators for dates with birthdays (🎂 emoji)
- Click any date to see detailed birthday information
- See age on upcoming birthday

🏢 **Division Pages**
- Organized by department (Finance, Migrant Workers Processing, etc.)
- Filter by division to see all employees
- Grouped by employment type (REGULAR, JOB ORDER, GIP)
- Employee contact information included

🔍 **Search & Filter**
- Search upcoming birthdays by employee name or division
- Filter divisions using quick-select buttons
- Real-time filtering as you type

📱 **Improved Mobile Layout**
- Responsive cards, navigation, and modals for mobile screens
- Mobile-friendly division filters and calendar view

## How to Use

### 1. **Setup**
- Make sure the CSV file `ROX INFO(Info) (1).csv` is in the same folder as `index.html`
- Open `index.html` in any modern web browser

### 2. **Navigate the Site**
The site has three main sections:

#### Dashboard (Home Page)
- **Click "Dashboard"** button in the navigation
- See birthday summaries for Today, This Week, This Month
- Scroll down to see a detailed table of upcoming birthdays
- Use the search box to find specific employees

#### Calendar
- **Click "Calendar"** button in the navigation
- Navigate months using ← and → buttons
- Dates with birthdays are marked with 🎂
- Click any date to see who has birthdays that day
- Today's date is highlighted in blue

#### Divisions
- **Click "Divisions"** button in the navigation
- Select "All Divisions" to see everyone
- Click specific division buttons to filter
- View employees organized by division and employment type

## File Structure

```
DMW HR1/
├── Frontend/
│   ├── index.html              # Main HTML file for the browser UI
│   ├── styles.css              # Styling and layout
│   ├── app.js                  # Frontend application logic
│   └── LOGO/                   # Logo and frontend assets
├── Backend/
│   ├── server.js               # Express backend API
│   ├── import_csv.js           # CSV seed/import script for MongoDB
│   ├── models/Employee.js      # Mongoose employee schema
│   ├── .env.example            # Example environment variables
│   ├── package.json            # Node backend metadata and scripts
│   └── package-lock.json       # Lockfile for Node dependencies
├── Data/
│   └── ROX INFO(Info) (1).csv  # Employee data source for import
└── README.md                   # This file
```

## Backend Setup

This project includes a Node/Express backend that supports MongoDB CRUD for employees.

1. Install dependencies:
```powershell
npm install
```

2. Create a `.env` file from `.env.example` and set your MongoDB connection string.

3. Use the Atlas application connection string, not the Atlas SQL path:
   - In MongoDB Atlas go to **Clusters** → **Connect** → **Connect your application**
   - Select **Node.js**
   - Copy the `mongodb+srv://...` URI
   - Replace `<password>` with your password
   - Add the target database name and recommended options, for example:
     `mongodb+srv://dmwrox:KHuMrxUeh1dkjBqt@cluster0.u4ijswb.mongodb.net/dmwrox?retryWrites=true&w=majority`

4. Ensure Atlas Database Access has the user account created and Network Access has your IP address whitelisted.

5. Basic local run command from the repo root:
```powershell
cd Backend
npm install
npm run dev
```

6. Open the app in your browser:
```text
http://localhost:5000
```

> Important: do not open `Frontend/index.html` directly from the file system. The app must be served by the backend at `http://localhost:5000`, otherwise the frontend cannot reach the API and will fall back to offline CSV mode.

7. In a separate PowerShell window, verify that the API is reachable:
```powershell
Invoke-RestMethod -Uri 'http://localhost:5000/api/employees'
```

7. Optional: import the CSV file into MongoDB:
```powershell
cd "C:\Users\Alsonfred leyva\Downloads\DMW HR1"
npm run import-csv
```

### Local fallback

If Atlas authentication fails, the backend will automatically fall back to local MongoDB at `mongodb://127.0.0.1:27017/dmwrox`.

## Browser Compatibility

✅ Works on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Most modern mobile browsers

## Features Explained

### Birthday Filtering
- **Today**: Employees with birthdays today
- **This Week**: Birthdays in the next 7 days
- **This Month**: Birthdays in the current month
- **Next 30 Days**: All upcoming birthdays sorted by date

### Division Organization
Employees are automatically organized by their division:
- Office of the Regional Director
- Finance and Administrative Division
- Migrant Workers Processing Division
- And any other divisions in the CSV

Within each division, employees are further categorized by:
- **REGULAR**: Regular employment
- **JOB ORDER**: Job order employees
- **GIP**: General Information Personnel

### Calendar Features
- Shows the full month view
- Days with birthdays are highlighted with pink borders and 🎂 indicator
- Today is highlighted in blue
- Click any date to see detailed birthday information
- Navigate between months to plan ahead

## Data Privacy

This application processes data locally in your browser. No data is sent to external servers. The CSV file is loaded from your local storage only.

## Tips & Tricks

💡 **Pro Tips:**
- Use the search feature on the Dashboard to quickly find specific employees
- Use the Calendar view to plan departmental birthday celebrations
- Check the "This Week" section regularly for upcoming team celebrations
- Click through divisions to understand birthday distribution across departments

## Troubleshooting

### CSV Not Loading?
- Make sure `ROX INFO(Info) (1).csv` is in the same folder as `index.html`
- Check that your browser hasn't blocked file access (check browser console for errors)
- If using Chrome locally, you may need to run a local server. Use: `python -m http.server 8000`

### No Birthdays Showing?
- Check that the CSV file format matches the expected format (birthdate as "Month DD, YYYY")
- Open browser developer tools (F12) and check the Console tab for any error messages

### Styling Looks Off?
- Refresh the page (Ctrl+R or Cmd+R)
- Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Try a different browser

## Future Enhancements

Potential features to add:
- 🔔 Birthday reminders and notifications
- 📧 Email alerts for upcoming birthdays
- 📥 Export to calendar (Google Calendar, Outlook, etc.)
- 🎨 Dark mode
- 📱 Improved mobile layout
- 🔐 Admin login for editing employee data
- 🎁 Birthday gift registry integration

## Support

If you encounter any issues:
1. Check the browser console (F12 → Console tab)
2. Verify the CSV file is in the correct location
3. Try refreshing the page
4. Clear browser cache and cookies

---

**Created for DMW Regional Office X** | Last Updated: 2024
