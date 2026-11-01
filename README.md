# 🏠 RentNest — Rental Property Marketplace

**Find & List Rental Properties with Ease**

RentNest is a responsive rental property marketplace built with Next.js and TypeScript. It helps tenants find rental homes and landlords manage their properties through role-based dashboards.

## 🌐 Live Demo

- **Frontend:** https://rentnest-fronted.vercel.app
- **Backend API:** https://rentnest-backend-1.onrender.com/api
- **Frontend Repository:** https://github.com/talha-87/rentnest-frontend
- **Backend Repository:** https://github.com/talha-87/RentNest-Backend

## ✨ Features

- User registration and login
- Role-based dashboards for Tenant, Landlord, and Admin
- Browse and filter rental properties
- Property details and image display
- Rental request submission and status tracking
- Landlord property management
- Approve and reject rental requests
- Stripe payment integration
- Payment history
- Reviews for eligible rentals
- Form validation and user-friendly error messages
- Responsive user interface

## 🛠️ Technologies Used

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- REST API integration
- JWT authentication
- Stripe payment integration
- Vercel deployment

## 🚀 Getting Started

### Prerequisites

Install Node.js and npm before running the project.

### 1. Clone the repository

```bash
git clone https://github.com/talha-87/rentnest-frontend.git
```

### 2. Open the project folder

```bash
cd rentnest-frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the project root and add the required values:

```env
NEXT_PUBLIC_API_URL=https://rentnest-backend-1.onrender.com/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51TzHjvPWVAzVMG29aJV9g7akgHsEuvHZcoeAGpWYEB874SLt2eGiL9swmcS9nvXdflo3jAU3lGBUQZRZnHluZT79008bapyzjN
```

Replace the Stripe placeholder with your own Stripe **test publishable key**. Never put your Stripe secret key in a `NEXT_PUBLIC_` variable or commit secret keys to GitHub.

### 5. Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 💳 Payment Testing

Use Stripe test mode and Stripe's official test card details. Do not use real card details for test transactions.

## 📁 Project Structure

The project uses Next.js App Router. The main application code is located in the `src` directory. Routes, components, API helpers, authentication utilities, and styles are organized according to the project's source structure.

## 🔐 Security Notes

- Keep `.env.local` out of Git.
- Never expose Stripe secret keys in frontend code.
- Use test credentials when demonstrating payment functionality.

## 👨‍💻 Author

**Developer:** [Your Name]

## 📄 License

This project was developed for educational purposes as part of Programming Hero Assignment 5.
