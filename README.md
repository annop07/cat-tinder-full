# Pawmise - Cat Breeding Matching Application

แอปพลิเคชันจับคู่แมวเพื่อผสมพันธุ์ คล้าย Tinder แต่สำหรับเจ้าของแมว

## Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API Server
- **MongoDB** + **Mongoose** - Database
- **Socket.io** - Real-time messaging
- **Cloudinary** - Image storage
- **Multer** - File upload handling
- **bcryptjs** - Password hashing
- **JWT** - Token-based authentication
- **express-validator** - Input validation
- **geolib** - Distance calculation

### Frontend
- **React Native** + **Expo**
- **NativeWind** (Tailwind CSS for React Native)
- **Expo Router** - File-based navigation
- **Axios** - HTTP client
- **AsyncStorage** - Local storage
- **Socket.io-client** - Real-time communication

---

## Features

### 1. Authentication
- Email/Password registration and login
- JWT token-based authentication
- Secure password hashing with bcrypt

### 2. Profile Management
- Owner profile creation and editing
- Location-based matching (จังหวัด + lat/lng)
- Profile picture upload

### 3. Cat Management
- Add multiple cats per owner
- Upload 1-5 photos per cat
- Cat details: name, gender, age, breed, traits, vaccination status
- Set breeding availability

### 4. Swipe & Matching
- Swipe-based discovery (like Tinder)
- Smart filtering:
  - Opposite gender only
  - Within 50km radius
  - Ready for breeding
  - Not previously swiped
- Automatic matching when both parties like each other

### 5. Real-time Chat
- Socket.io powered messaging
- Chat with matched owners
- Message read status
- Online/offline indicators

---

## Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Cloudinary account (for image storage)

### Backend Setup

```bash
cd backend_cat-tinder
npm install
cp .env.example .env    # แก้ไข config
npm run dev
```

### Frontend Setup

```bash
cd frontend_cat-tinder
npm install
npx expo start
```

---

## Environment Variables

Create `.env` file in `backend_cat-tinder/`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pawmise
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=*
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login
GET    /api/auth/me          # Get current user (protected)
```

### Owner Management
```
GET    /api/owners/profile        # Get profile
PUT    /api/owners/profile        # Update profile
POST   /api/owners/onboarding     # Complete onboarding
```

### Cat Management
```
GET    /api/cats/feed        # Get swipeable cats
GET    /api/cats/my-cats     # Get my cats
GET    /api/cats/:id         # Get cat by ID
POST   /api/cats             # Create cat (with photos)
PUT    /api/cats/:id         # Update cat
DELETE /api/cats/:id         # Delete cat
```

### Swipe & Match
```
POST   /api/swipes                        # Create swipe (like/pass)
GET    /api/swipes/likes-sent/:catId      # Get likes sent
GET    /api/swipes/likes-received/:catId  # Get likes received
GET    /api/matches                       # Get all matches
GET    /api/matches/:id                   # Get match details
DELETE /api/matches/:id                   # Unmatch
```

### Messaging
```
GET    /api/messages/:matchId       # Get messages
POST   /api/messages                # Send message
PUT    /api/messages/:matchId/read  # Mark as read
```

---

## Database Schema

### Owner
```javascript
{
  email: String (unique, required),
  passwordHash: String (required),
  firstName: String (required),
  lastName: String (required),
  displayName: String (required),
  phone: String,
  avatarUrl: String,
  location: {
    province: String (required),
    district: String,
    lat: Number (required),
    lng: Number (required)
  },
  onboardingCompleted: Boolean,
  active: Boolean
}
```

### Cat
```javascript
{
  ownerId: ObjectId (ref: Owner),
  name: String (required),
  gender: String (male/female),
  ageYears: Number,
  ageMonths: Number,
  breed: String (required),
  color: String,
  traits: [String], // playful, calm, friendly, etc.
  photos: [{ url, publicId }], // 1-5 photos
  readyForBreeding: Boolean,
  vaccinated: Boolean,
  neutered: Boolean,
  notes: String,
  location: { province, district, lat, lng },
  active: Boolean
}
```

### Swipe
```javascript
{
  swiperOwnerId: ObjectId,
  swiperCatId: ObjectId,
  targetCatId: ObjectId,
  action: String (like/pass)
}
```

### Match
```javascript
{
  catAId: ObjectId,
  ownerAId: ObjectId,
  catBId: ObjectId,
  ownerBId: ObjectId,
  lastMessageAt: Date
}
```

### Message
```javascript
{
  matchId: ObjectId,
  senderOwnerId: ObjectId,
  text: String,
  read: Boolean,
  sentAt: Date
}
```

---

## API Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John D",
    "phone": "0812345678",
    "location": {
      "province": "กรุงเทพมหานคร",
      "lat": 13.7563,
      "lng": 100.5018
    }
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Cat Feed (requires auth token)
```bash
curl -X GET "http://localhost:5000/api/cats/feed?catId=xxx" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Project Structure

```
cat-tinder/
├── backend_cat-tinder/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── ownersController.js
│   │   │   ├── catsController.js
│   │   │   ├── swipesController.js
│   │   │   ├── matchesController.js
│   │   │   └── messagesController.js
│   │   ├── models/
│   │   │   ├── Owner.js
│   │   │   ├── Cat.js
│   │   │   ├── Swipe.js
│   │   │   ├── Match.js
│   │   │   └── Message.js
│   │   ├── routes/
│   │   │   ├── authRoute.js
│   │   │   ├── ownersRoute.js
│   │   │   ├── catsRoute.js
│   │   │   ├── swipesRoute.js
│   │   │   ├── matchesRoute.js
│   │   │   └── messagesRoute.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── utils/
│   │   │   ├── cloudinary.js
│   │   │   ├── imageUpload.js
│   │   │   └── geolocation.js
│   │   ├── socket/
│   │   │   └── socketServer.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend_cat-tinder/
    ├── app/
    │   ├── (auth)/
    │   │   ├── login.tsx
    │   │   ├── register.tsx
    │   │   └── _layout.tsx
    │   ├── (tabs)/
    │   │   ├── home.tsx
    │   │   ├── like.tsx
    │   │   ├── messages.tsx
    │   │   ├── profile.tsx
    │   │   └── _layout.tsx
    │   └── index.tsx
    ├── services/
    ├── contexts/
    ├── constants/
    └── package.json
```

---

## Frontend TODO

- [ ] Create Onboarding screens (owner info + add first cat)
- [ ] Implement Swipe card UI with animations
- [ ] Build Chat interface with Socket.io
- [ ] Add image picker for cat photos
- [ ] Create location picker component
- [ ] Implement error handling & loading states
- [ ] Add dark/light theme support
- [ ] Create reusable components library

---

## License

MIT

---

Built with love for cats! 🐱❤️
