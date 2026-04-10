# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites Check
- [ ] Node.js v18+ installed (`node --version`)
- [ ] MongoDB installed and running (`mongod --version`)
- [ ] npm or yarn installed

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Backend Environment

Create `backend/.env` file:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/social-media-analytics

JWT_ACCESS_SECRET=your-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-secret-refresh-key-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

**Generate secure secrets:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Step 3: Start MongoDB

**Windows:**
```bash
mongod
```

**Linux/Mac:**
```bash
brew services start mongodb-community
# OR
mongod --config /usr/local/etc/mongod.conf
```

**Or use MongoDB Atlas:**
- Create free account at https://www.mongodb.com/cloud/atlas
- Update `MONGODB_URI` in `.env` with connection string

### Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

✅ Backend running on `http://localhost:5000`

### Step 5: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 6: Start Frontend Dev Server

```bash
npm run dev
```

✅ Frontend running on `http://localhost:5173`

### Step 7: Open Application

Navigate to: **http://localhost:5173**

1. Click "Sign up" to create an account
2. Register with username, email, and password
3. Start adding usage entries!

---

## 📝 First Usage Entry

After logging in:

1. Scroll to "Add Usage Entry" form
2. Enter app name (e.g., "Instagram")
3. Enter minutes spent (e.g., 120)
4. Select date (defaults to today)
5. Click "Add Entry"
6. View dashboard update with analytics!

---

## 🧪 Test Different Risk Levels

### Low Risk (Score: 0-39)
- Add entries: < 60 minutes/day
- 3-4 days active per week
- Example: 30 min, 4 days = ~Low risk

### Moderate Risk (Score: 40-69)
- Add entries: 120-180 minutes/day
- 5-6 days active per week
- Example: 150 min/day, 5 days = ~Moderate risk

### High Risk (Score: 70-100)
- Add entries: > 240 minutes/day
- 7 days active per week
- Example: 300 min/day, 7 days = ~High risk

---

## 🔍 Verify Everything Works

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Social Media Analytics API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test Authentication
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123"
  }'
```

---

## 🐛 Common Issues

### MongoDB Connection Error
```
❌ MongoDB Connection Error: connect ECONNREFUSED
```
**Solution:** Make sure MongoDB is running:
```bash
mongod
```

### Port Already in Use
```
❌ Port 5000 is already in use
```
**Solution:** Change `PORT` in `backend/.env` or kill process using port 5000

### JWT Token Errors
```
❌ Invalid token
```
**Solution:** Clear browser localStorage or login again

### CORS Errors
```
❌ CORS policy: No 'Access-Control-Allow-Origin'
```
**Solution:** Verify `FRONTEND_URL` in `backend/.env` matches frontend URL (default: `http://localhost:5173`)

---

## 📚 Next Steps

1. **Read Full README**: See `README.md` for detailed documentation
2. **Check API Docs**: See `API_DOCUMENTATION.md` for API reference
3. **Explore Code**: Review the codebase structure in `README.md`
4. **Customize**: Modify analytics engine or add features!

---

**Need Help?** Check the main `README.md` for troubleshooting and detailed setup instructions.
