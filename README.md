# SecureBank - Banking Management System

## Overview
A complete, interactive banking management system built with Next.js 16, TypeScript, and Tailwind CSS. All currency values are displayed in Indian Rupees (₹).

## Technology Stack
- **Frontend**: Next.js 16 with App Router, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing

## Features Implemented

### 1. Authentication System
- **Login Page**: User and admin authentication
- **Registration Page**: New user registration with validation
- **Built-in Admin Account**:
  - Email: `admin@bank.com`
  - Password: `admin123`

### 2. User Dashboard
- **Single Account**: Each user can have only one bank account
- **Account Numbers**: Unique 10-digit continuous format starting from 1000000001
- **Deposit Money**: Submit deposit requests (requires admin approval)
- **Withdraw Money**: Instant withdrawal from account balance
- **Check Balance**: View real-time account balance
- **Transfer Money**: Transfer funds between accounts (instant, no approval needed)
- **E-Statement**: Download account statements in HTML format
- **Transaction History**: View all transactions with status indicators
- **Logout**: Secure logout functionality

### 3. Admin Dashboard
- **User Management**: View and approve/reject new user registrations
- **Deposit Approvals**: Review and approve/reject deposit requests
- **Statistics**: Real-time overview of:
  - Total users
  - Total accounts
  - Pending approvals
  - Total system balance
- **Logout**: Secure admin logout

## Database Schema

### User Model
- `id`: Unique identifier
- `name`: Full name
- `email`: Email address (unique)
- `password`: Hashed password
- `dob`: Date of birth
- `mobile`: 10-digit mobile number
- `isApproved`: Approval status
- `isAdmin`: Admin flag
- `accounts`: Relation to Account model

### Account Model
- `id`: Unique identifier
- `accountNumber`: 10-digit unique account number
- `userId`: Foreign key to User
- `balance`: Current balance
- `transactions`: Relation to Transaction model

### Transaction Model
- `id`: Unique identifier
- `type`: deposit | withdraw | transfer
- `amount`: Transaction amount
- `description`: Transaction description
- `status`: pending | approved | rejected
- `accountId`: Foreign key to Account
- `fromAccount`: Source account for transfers
- `toAccount`: Destination account for transfers

## API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Accounts
- `GET /api/accounts` - Get user accounts
- `POST /api/accounts/create` - Create new account

### Transactions
- `GET /api/transactions` - Get transaction history
- `POST /api/transactions/deposit` - Submit deposit request
- `POST /api/transactions/withdraw` - Withdraw money
- `POST /api/transactions/transfer` - Transfer money
- `GET /api/transactions/statement` - Download e-statement

### Admin
- `GET /api/admin/pending-users` - Get pending user approvals
- `GET /api/admin/pending-deposits` - Get pending deposit approvals
- `GET /api/admin/stats` - Get system statistics
- `POST /api/admin/approve-user/[id]` - Approve user
- `POST /api/admin/reject-user/[id]` - Reject/delete user
- `POST /api/admin/approve-deposit/[id]` - Approve deposit
- `POST /api/admin/reject-deposit/[id]` - Reject deposit

## How to Use

### For Admin
1. Login with admin credentials
2. View pending user registrations in the "Pending Users" tab
3. Approve or reject new users
4. View pending deposit requests in the "Pending Deposits" tab
5. Approve or reject deposit requests
6. Monitor system statistics

### For Regular Users
1. Register for a new account (or login if already registered)
2. Wait for admin approval (new registrations require approval)
3. Create one or more bank accounts
4. Deposit money (submit request, wait for admin approval)
5. Withdraw money (instant)
6. Transfer money to other accounts (instant)
7. Check balance and view transaction history
8. Download e-statements

## Security Features
- Password hashing with bcrypt
- JWT token-based authentication
- Admin-only endpoints protected
- Input validation on all forms
- Secure logout (clears local storage)

## UI/UX Features
- Modern, professional design with emerald/teal color scheme
- Responsive layout for all screen sizes
- Interactive cards with hover effects
- Real-time balance updates
- Transaction status badges (pending/approved/rejected)
- Currency formatting in Indian Rupees
- Loading states and error handling
- Smooth transitions and animations

## Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── accounts/
│   │   ├── transactions/
│   │   └── admin/
│   └── page.tsx
├── components/
│   ├── LoginPage.tsx
│   └── dashboard/
│       ├── UserDashboard.tsx
│       └── AdminDashboard.tsx
└── lib/
    └── db.ts
prisma/
├── schema.prisma
└── seed.ts
```

## Notes
- The e-statement is generated as an HTML file that can be printed or saved as PDF from the browser
- All deposit transactions require admin approval before balance is updated
- Withdrawals and transfers happen instantly
- Account numbers are generated in continuous format (1000000001, 1000000002, etc.)
- The system uses localStorage for client-side authentication persistence