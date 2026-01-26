# 🍽️ MADHURAM POS System

A modern Point of Sale (POS) system for restaurants and cafes. Features centralized server-based storage accessible from multiple devices on the same network.

---

## 🚀 Quick Start

### Start the System (Single Command)

```bash
cd /home/vivek/dakshin
npm run start
```

This starts both:
- **Backend Server** (Port 3001) - SQLite database
- **Frontend** (Port 5173) - React UI

---

## 📱 Access the POS

| From | URL |
|------|-----|
| **This Computer** | http://localhost:5173 |
| **Other Devices on WiFi** | http://192.168.29.244:5173 |

> **Note:** Replace `192.168.29.244` with your computer's actual IP address. The server will display the correct IP when it starts.

---

## 🔐 Admin Panel

Access backup and restore features through the **Admin** tab.

| | |
|---|---|
| **Admin Password** | `Madhuram@2024#Admin` |
| **Features** | Backup to Excel, Clear Database, Reset Bill Numbers |

---

## 📋 Features

- ✅ **Order Management** - Create orders, add items, print bills
- ✅ **KOT (Kitchen Order Ticket)** - Print kitchen orders
- ✅ **Menu Management** - Add, edit, delete menu items
- ✅ **Bill History** - View all past bills with statistics
- ✅ **Admin Panel** - Password-protected backup/restore
- ✅ **Multi-Device Support** - Access from any device on the network
- ✅ **Centralized Storage** - All data stored in SQLite database

---

## 🛠️ Installation

### First Time Setup

```bash
# 1. Navigate to project directory
cd /home/vivek/dakshin

# 2. Install all dependencies (frontend + server)
npm run setup
```

### Start the System

```bash
# Start both server and frontend
npm run start
```

### Stop the System

Press `Ctrl + C` in the terminal to stop both servers.

---

## 📁 Data Storage

All data is stored in a single SQLite file:

```
/home/vivek/dakshin/server/madhuram.db
```

This file contains:
- Menu items
- Bill history
- Settings (bill numbers, etc.)

### Backup the Database

You can either:
1. **From the app**: Go to Admin → Enter password → Click "Backup" (exports to Excel)
2. **Manually**: Copy the `madhuram.db` file to a safe location

---

## 🔧 Commands Reference

| Command | Description |
|---------|-------------|
| `npm run start` | Start both server and frontend |
| `npm run dev` | Start frontend only |
| `npm run server` | Start backend server only |
| `npm run setup` | Install all dependencies |
| `npm run build` | Build for production |

---

## 🌐 Network Setup for Hotel/Restaurant

### Server Machine (Your Main Computer)

1. Keep this computer running with the POS server
2. Note down the IP address shown when server starts
3. Make sure firewall allows ports 3001 and 5173

### Client Devices (Tablets, Phones, Other PCs)

1. Connect to the same WiFi network
2. Open browser and go to: `http://[SERVER-IP]:5173`
3. Example: `http://192.168.29.244:5173`

### Finding Your IP Address

```bash
hostname -I | awk '{print $1}'
```

---

## 🔄 Backup & Restore

### Backup (Download Excel)
1. Go to **Admin** tab
2. Enter password: `Madhuram@2024#Admin`
3. Click **Backup** - Downloads all bills as Excel file

### Backup & Restore (Clear Database)
1. Go to **Admin** tab
2. Enter password: `Madhuram@2024#Admin`
3. Click **Backup & Restore**
   - Downloads all bills as Excel
   - Clears the database
   - Resets bill numbering to 0001

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Your WiFi Network                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐                                   │
│  │   Main Computer  │  ← Server runs here               │
│  │   Backend: 3001  │    Database: madhuram.db          │
│  │   Frontend: 5173 │                                   │
│  └──────────────────┘                                   │
│           │                                              │
│     ┌─────┴─────┬─────────────┐                         │
│     ▼           ▼             ▼                         │
│  ┌──────┐   ┌──────┐     ┌──────┐                      │
│  │ POS  │   │ POS  │     │ POS  │                      │
│  │Tab 1 │   │Tab 2 │     │Phone │                      │
│  └──────┘   └──────┘     └──────┘                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📞 Troubleshooting

### Server Not Starting?
```bash
# Kill any existing processes on ports
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Then restart
npm run start
```

### Can't Connect from Other Devices?
1. Check if server is running
2. Ensure devices are on the same WiFi
3. Check firewall settings
4. Try using the IP address (not localhost)

### Data Not Saving?
Check if the backend server is running:
```bash
curl http://localhost:3001/api/health
```

Should return: `{"status":"ok",...}`

---

## 📄 License

Private - MADHURAM Café and Tiffins

---

**Made with ❤️ for MADHURAM Café and Tiffins**
