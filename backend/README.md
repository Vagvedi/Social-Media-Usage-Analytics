# Social Media Usage & Behavior Analytics Platform

A production-quality full-stack web application that helps college students and young professionals track their social media usage, analyze behavior patterns, and receive personalized insights and recommendations.

## 🎯 Project Overview

This platform provides ethical, privacy-focused social media usage tracking and behavioral analytics. It tracks **time-based usage only** - no content analysis, no personal data mining, just pure usage patterns to help users build awareness of their digital habits.

### Key Features

- ✅ **User Authentication** - Secure JWT-based authentication with refresh tokens
- ✅ **Daily Usage Tracking** - Manual entry of social media app usage (app name, minutes, date)
- ✅ **Comprehensive Analytics** - Daily, weekly, and monthly aggregations
- ✅ **Behavioral Risk Indicators** - Calculated addiction risk scores (0-100) based on usage patterns
- ✅ **Visual Dashboards** - Interactive charts and graphs using Recharts
- ✅ **Personalized Recommendations** - Context-aware behavioral suggestions
- ✅ **Dark Mode** - Full dark mode support
- ✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Composable charting library
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors
- **date-fns** - Date utility library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (v5 or higher) - Running locally or MongoDB Atlas account

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Social Media Analysis"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# On Windows (PowerShell):
Copy-Item .env.example .env

# On Linux/Mac:
cp .env.example .env
```

**Configure `.env` file:**

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/social-media-analytics

JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

**Important:** Replace the JWT secrets with secure random strings in production!

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file (optional - defaults work for local dev)
# VITE_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

Make sure MongoDB is running:

```bash
# On Windows
mongod

# On Linux/Mac (if installed via Homebrew)
brew services start mongodb-community
# OR
mongod --config /usr/local/etc/mongod.conf
```

Or use MongoDB Atlas (cloud) and update `MONGODB_URI` in `.env`.

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 📁 Project Structure

```
Social Media Analysis/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js    # Authentication logic
│   │   │   ├── usageController.js   # Usage CRUD operations
│   │   │   └── analyticsController.js # Analytics endpoints
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # JWT verification
│   │   │   ├── errorHandler.js      # Global error handling
│   │   │   └── validator.js         # Input validation
│   │   ├── models/
│   │   │   ├── User.js              # User schema
│   │   │   └── UsageLog.js          # Usage log schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # Auth endpoints
│   │   │   ├── usageRoutes.js       # Usage endpoints
│   │   │   └── analyticsRoutes.js   # Analytics endpoints
│   │   ├── utils/
│   │   │   ├── analyticsEngine.js   # Analytics calculations
│   │   │   └── recommendations.js   # Recommendation engine
│   │   └── server.js                # Express app entry point
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx           # Main layout wrapper
│   │   │   ├── ProtectedRoute.jsx   # Route protection
│   │   │   ├── UsageEntry.jsx       # Add usage form
│   │   │   └── UsageHistory.jsx     # Usage history table
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Registration page
│   │   │   └── Dashboard.jsx        # Main dashboard
│   │   ├── services/
│   │   │   └── api.js               # API client with interceptors
│   │   ├── utils/
│   │   │   └── darkMode.js          # Dark mode utilities
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles + Tailwind
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .gitignore
│   └── package.json
│
└── README.md                        # This file
```

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Endpoints

#### Authentication

**POST** `/api/auth/register`
- Register a new user
- Body: `{ username, email, password }`
- Returns: User object + access + refresh tokens

**POST** `/api/auth/login`
- Login user
- Body: `{ email, password }`
- Returns: User object + access + refresh tokens

**POST** `/api/auth/refresh`
- Refresh access token
- Body: `{ refreshToken }`
- Returns: New access + refresh tokens

**POST** `/api/auth/logout` (Protected)
- Logout user (invalidate refresh token)

**GET** `/api/auth/me` (Protected)
- Get current user profile

#### Usage Logs

**POST** `/api/usage` (Protected)
- Create usage entry
- Body: `{ appName, minutesSpent, date? }`
- Note: Duplicate entries for same app/date are prevented

**GET** `/api/usage` (Protected)
- Get all usage logs
- Query params: `startDate`, `endDate`, `appName`, `limit`

**GET** `/api/usage/:id` (Protected)
- Get specific usage log

**PUT** `/api/usage/:id` (Protected)
- Update usage log
- Body: `{ appName?, minutesSpent?, date? }`

**DELETE** `/api/usage/:id` (Protected)
- Delete usage log

#### Analytics

**GET** `/api/analytics/dashboard` (Protected)
- Get comprehensive dashboard data
- Returns: Daily/weekly/monthly stats, risk score, recommendations, charts data

**GET** `/api/analytics/stats` (Protected)
- Get custom date range statistics
- Query params: `startDate`, `endDate`, `period` (daily/weekly/monthly)

**GET** `/api/analytics/risk-score` (Protected)
- Get current behavioral risk score

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message"
}
```

## 🧮 Analytics Engine

### Risk Score Calculation (0-100)

The behavioral risk indicator is calculated using four factors:

1. **Average Daily Usage (40 points)**
   - < 60 min: 0-10 points
   - 60-120 min: 10-20 points
   - 120-240 min: 20-30 points
   - 240-360 min: 30-35 points
   - > 360 min: 35-40 points

2. **Peak Usage Day (20 points)**
   - Based on highest single-day usage in the week

3. **Consistency - Daily Usage (20 points)**
   - Using app 7 days = 20 points
   - Proportionally fewer points for fewer days

4. **Trend Direction (20 points)**
   - Increasing: 20 points
   - Stable: 10 points
   - Decreasing: 5 points

### Risk Categories

- **Low (0-39)**: Well-balanced usage patterns
- **Moderate (40-69)**: Moderate engagement, worth monitoring
- **High (70-100)**: Frequent engagement, consider setting boundaries

**⚠️ Important:** This is a behavioral indicator, not a medical or clinical diagnosis.

## 🔒 Security Features

- Password hashing with bcrypt
- JWT tokens with expiration
- Refresh token rotation
- Input validation and sanitization
- Protected routes with authentication middleware
- CORS configuration
- Environment variables for secrets
- No hard-coded credentials

## 🎨 UI/UX Features

- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Mobile-first approach
- **Loading States** - Spinners and skeleton screens
- **Error Handling** - User-friendly error messages
- **Form Validation** - Client and server-side validation
- **Accessible** - Semantic HTML and ARIA labels

## 🧪 Testing the Application

### Sample Data Entry

1. Register a new account or login
2. Navigate to Dashboard
3. Use "Add Usage Entry" form to add entries:
   - App Name: Instagram, TikTok, Facebook, Twitter, etc.
   - Minutes Spent: Any value between 0-1440
   - Date: Select any date (defaults to today)

4. View analytics update in real-time:
   - Risk score calculation
   - Usage statistics
   - Trend charts
   - Recommendations

### Testing Risk Score

To test different risk levels:

**Low Risk:**
- < 60 minutes/day average
- 3-4 days active per week

**Moderate Risk:**
- 120-180 minutes/day average
- 5-6 days active per week
- Stable trend

**High Risk:**
- > 240 minutes/day average
- 7 days active per week
- Increasing trend
- Peak days > 360 minutes

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity

### JWT Token Expired
- The frontend automatically refreshes tokens
- If refresh fails, user is redirected to login

### CORS Errors
- Verify `FRONTEND_URL` in backend `.env`
- Ensure frontend runs on port 5173

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: Modify `port` in `vite.config.js`

## 🚢 Production Deployment

### Backend (Node.js + Express)

1. Set `NODE_ENV=production`
2. Use secure JWT secrets (generate with: `openssl rand -base64 32`)
3. Use MongoDB Atlas or managed MongoDB service
4. Set up reverse proxy (Nginx)
5. Enable HTTPS
6. Configure rate limiting (already included)
7. Set up monitoring and logging

### Frontend (React + Vite)

1. Build: `npm run build`
2. Serve static files with Nginx or similar
3. Configure API URL via environment variable
4. Enable compression and caching
5. Set up CDN if needed

## 📝 Ethical Considerations

This platform adheres to strict ethical guidelines:

- ✅ Tracks **time-based usage only**
- ❌ Does NOT analyze message content
- ❌ Does NOT track personal data
- ❌ Does NOT make medical claims
- ✅ Labels insights as "behavioral indicators"
- ✅ Uses supportive, non-judgmental language
- ✅ Emphasizes user awareness and choice

## 🤝 Contributing

This is a college project. For contributions:

1. Follow the existing code style
2. Add meaningful comments
3. Test your changes thoroughly
4. Update documentation as needed

## 📄 License

This project is for educational purposes.

## 👨‍💻 Developer Notes

### Key Design Decisions

1. **MVC Pattern** - Clear separation of concerns in backend
2. **JWT with Refresh Tokens** - Secure, stateless authentication
3. **MongoDB** - Flexible schema for usage logs and future expansion
4. **Recharts** - Lightweight, responsive charting library
5. **Context API** - Simple state management without Redux overhead
6. **Tailwind CSS** - Rapid UI development with utility classes
7. **Dark Mode** - Stored in localStorage with system preference fallback

### Future Enhancements

- [ ] Email notifications for high usage days
- [ ] Export data as CSV/JSON
- [ ] Goal setting and tracking
- [ ] Social comparison (anonymous, aggregated)
- [ ] Mobile app (React Native)
- [ ] Automated usage tracking via browser extensions
- [ ] Advanced analytics (weekly reports, predictions)

---

**Built with ❤️ for better digital wellness awareness**
