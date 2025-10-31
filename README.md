# 🛍️ Digital Product Store (DigitalHub)

A professional, responsive, and user-friendly digital marketplace built with **Node.js**, **Express**, and **Stripe Checkout**.

## 🚀 Features
- 💳 Secure Stripe Payment Integration  
- 📥 Instant Digital Downloads  
- 📱 Responsive, Modern UI  
- 🧩 Product Categories: Templates, Guides, Stock Photos, Presets  
- 🧠 Editable Backend for Product Updates  

## 🧰 Tech Stack
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js (Express)  
- **Payments:** Stripe API  
- **Hosting:** Works with Render / Vercel

⚙️ How to Run This Project Locally

Follow these steps to set up and run the Digital Product Store on your system 👇

🧩 1️⃣ Clone the Repository
git clone https://github.com/<your-username>/digital-product-store.git

🧭 2️⃣ Navigate into the Project Folder
cd digital-product-store

⚙️ 3️⃣ Install Dependencies

Install all required Node.js packages:

npm install

🧾 4️⃣ Create a .env File

Inside the root folder, create a new file named .env and add the following lines:

STRIPE_SECRET_KEY=sk_test_yourStripeSecretKeyHere
DOMAIN=http://localhost:4242


💡 Replace sk_test_yourStripeSecretKeyHere with your own Stripe Test Secret Key
from https://dashboard.stripe.com/test/apikeys

▶️ 5️⃣ Run the Server

Start the backend server with:

npm start


or (optional, if you have nodemon installed)

npx nodemon server.js


You’ll see:

Server running on port 4242

🌐 6️⃣ Open the App

Now open your browser and visit:

http://localhost:4242


✅ You’ll see your Digital Product Store homepage.

You can test checkout using a Stripe test card:

4242 4242 4242 4242
12/34
123


📁 Project Structure
digital-store-starter/
├─ public/
│  ├─ index.html
│  ├─ category-templates.html
│  ├─ styles.css
│  └─ app.js
├─ downloads/
│  ├─ guide.pdf
│  └─ template-pack.zip
├─ server.js
└─ .env


⭐ Built by Nadia Hafsa
