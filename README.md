# 🍱 SmartFood AI

SmartFood AI is a food-surplus redistribution platform that connects **kitchens** with surplus food to **NGOs**, coordinates pickup through **delivery partners**, and uses lightweight **AI/ML** to assess food freshness and recommend the nearest NGO for a donation.

---

## ✨ Features

- **Role-based dashboards** for Kitchen, NGO, Delivery, Processing, and Admin
- **Surplus food listings** with photo upload (Cloudinary)
- **AI freshness check** — analyzes an uploaded food photo and classifies it as `Fresh`, `Redistribute Immediately`, or `Spoiled / Compost`, with an estimated shelf life and confidence score
- **Nearest-NGO recommendation** using a K-Nearest Neighbors model trained on NGO location data
- **Food request & delivery tracking** — from request → approval → assignment → pickup → delivery
- **Production records & demand prediction** for kitchens
- **Notifications** system with unread-count badge
- **JWT-based authentication** with cookie sessions

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express 5 |
| Database | MongoDB (Mongoose) |
| Views | EJS + express-ejs-layouts |
| Auth | JWT + bcryptjs (cookie-based sessions) |
| File uploads | Multer (memory storage) → Cloudinary |
| Styling | Bootstrap 5, Bootstrap Icons, Font Awesome |
| AI / ML | Python (NumPy, Pillow, scikit-learn, joblib) |

---

## 📁 Project Structure

```
smart-food-ai/
├── app.js                     # Express app setup, middleware, routes
├── server.js                  # Entry point
├── config/
│   ├── db.js                  # MongoDB connection
│   └── cloudinary.js          # Cloudinary config
├── controllers/                # Route handlers (auth, kitchen, ngo, delivery, admin, ...)
├── models/                     # Mongoose schemas (User, SurplusFood, FoodRequest, ...)
├── routes/                     # Express routers
├── services/
│   ├── qualityAssessment.js   # Calls Python AI vision script
│   └── ngoRecommendation.js   # Calls Python KNN script
├── ml/
│   ├── assess_quality.py      # Image-based freshness heuristic
│   ├── train_knn.py           # Trains the nearest-NGO KNN model
│   ├── predict_nearest.py     # Predicts nearest NGO for a location
│   ├── ngo_dataset.csv        # Sample NGO location data
│   └── ngo_knn_model.pkl      # Trained KNN model
├── views/                      # EJS templates (per role)
├── public/                     # Static assets (CSS, images)
├── scripts/
│   └── createAdmin.js         # Interactive script to create an admin account
├── requirements.txt            # Python dependencies
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Python 3.11+ (with `pip`)
- A MongoDB connection string (local or Atlas)
- A Cloudinary account (for image uploads)

### 1. Clone & install Node dependencies

```bash
git clone <your-repo-url>
cd smart-food-ai
npm install
```

### 2. Set up Python environment

```bash
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Train the NGO recommendation model (first-time setup)

```bash
python ml/train_knn.py
```

This generates `ml/ngo_knn_model.pkl`, used by `services/ngoRecommendation.js`.

### 5. Create an admin account

```bash
node scripts/createAdmin.js
```

Follow the prompts to set an admin name, email, and password.

### 6. Run the app

```bash
npm run dev     # with nodemon
# or
npm start
```

Visit `http://localhost:3000` (or your configured port) and register accounts for **Kitchen**, **NGO**, **Delivery**, and **Processing** roles from the `/register` page.

---

## 🤖 How the AI Works

**1. Freshness Check (`ml/assess_quality.py`)**
When a kitchen uploads a surplus food photo, it's uploaded to Cloudinary, then the resulting URL is analyzed:
- Image saturation, brightness, brightness variance, and a "browning index" (red vs. green/blue) are measured
- These are combined into a simple score to classify the food as `Fresh`, `Redistribute Immediately`, or `Spoiled / Compost`, with an estimated shelf life and confidence score

**2. Nearest-NGO Recommendation (`ml/predict_nearest.py`)**
A K-Nearest Neighbors model, trained on sample NGO location data (`ml/train_knn.py`), finds the NGO closest to a kitchen's coordinates using geographic distance.

> ⚠️ Both models are lightweight, heuristic/demo-level implementations — not production-grade trained classifiers. They're well-suited for demos and prototypes; real-world deployment would need labeled training data.

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Kitchen** | Add production records, publish surplus food, view demand prediction, manage requests |
| **NGO** | Browse available surplus food, request food, track deliveries |
| **Delivery** | View and manage assigned deliveries |
| **Processing** | (Processing unit dashboard) |
| **Admin** | Analytics, manage users, oversee requests and deliveries |

---

## 📄 License

ISC