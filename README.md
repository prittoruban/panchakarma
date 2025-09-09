# AyurSutra - Panchakarma Patient Management System

A comprehensive Next.js application for managing Panchakarma patients, therapy scheduling, and doctor-patient interactions.

## 🌟 Features

### Patient Features
- **Session Booking**: Book therapy sessions with available doctors
- **Calendar View**: Visual calendar showing upcoming sessions
- **Session Management**: View and track therapy progress
- **Feedback System**: Rate sessions and provide detailed feedback
- **Notifications**: Real-time updates about sessions and treatments

### Doctor Features
- **Patient Management**: View assigned patients and their sessions
- **Session Updates**: Update session status (scheduled → in progress → completed)
- **Patient Feedback**: Review patient feedback and symptoms
- **Schedule Management**: View daily and weekly schedules

### Admin Features
- **User Management**: Manage doctors, patients, and roles
- **Center Management**: Manage therapy centers and locations
- **Therapy Management**: Configure available therapies and treatments
- **Analytics**: View system-wide metrics and performance data
- **Complete Oversight**: Full access to all system data

## 🚀 Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **UI Components**: React Big Calendar, Chart.js, Lucide Icons
- **Authentication**: Supabase Auth with Row Level Security
- **Deployment**: Vercel + Supabase

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- Vercel account (for deployment)

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd panchakarma
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your project URL and keys
3. Run the SQL schema in your Supabase SQL Editor:
   ```sql
   -- Copy and paste the contents from database/schema.sql
   ```

### 3. Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXTAUTH_SECRET=your_random_secret_key
   NEXTAUTH_URL=http://localhost:3000
   ```

### 4. Create Demo Users

In your Supabase Auth panel, create three users:

1. **Admin User**
   - Email: `admin@example.com`
   - Password: `Admin@123`

2. **Doctor User**
   - Email: `doctor@example.com`  
   - Password: `Doctor@123`

3. **Patient User**
   - Email: `patient@example.com`
   - Password: `Patient@123`

After creating these users in Auth, add their profiles to the database:

```sql
-- Get the user IDs from auth.users table first
insert into profiles (id, role, full_name, phone, center_id) values
  ('admin-user-id', 'admin', 'Admin User', '+1234567890', 1),
  ('doctor-user-id', 'doctor', 'Dr. Smith', '+1234567891', 1),
  ('patient-user-id', 'patient', 'John Doe', '+1234567892', 1);
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📱 Usage

### Demo Login
Use the demo accounts to explore different user roles:

- **Admin**: `admin@example.com` / `Admin@123`
- **Doctor**: `doctor@example.com` / `Doctor@123`  
- **Patient**: `patient@example.com` / `Patient@123`

### Patient Workflow
1. Login as patient
2. Navigate to "Book Therapy" to schedule sessions
3. View upcoming sessions in dashboard
4. Provide feedback after completed sessions

### Doctor Workflow
1. Login as doctor
2. View assigned patients and today's sessions
3. Update session status as treatments progress
4. Review patient feedback

### Admin Workflow
1. Login as admin
2. Manage users, centers, and therapies
3. View system analytics and metrics
4. Oversee all operations

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Role-based dashboards
│   │   ├── admin/        # Admin-specific pages
│   │   ├── doctor/       # Doctor-specific pages
│   │   └── patient/      # Patient-specific pages
│   ├── login/            # Authentication page
│   ├── therapy/          # Therapy booking page
│   └── api/              # API routes
├── components/           # Reusable React components
│   ├── Calendar.tsx     # Calendar component
│   ├── FeedbackForm.tsx # Patient feedback form
│   ├── Navbar.tsx       # Navigation component
│   └── SessionCard.tsx  # Session display card
├── lib/                 # Utility libraries
│   ├── auth.ts         # Authentication helpers
│   ├── database.types.ts # TypeScript types
│   ├── supabase.ts     # Client-side Supabase
│   └── supabase-server.ts # Server-side Supabase
└── database/           # Database schema and setup
    └── schema.sql     # Complete database schema
```

## 🔐 Security Features

- **Row Level Security (RLS)**: Patients only see their data, doctors see assigned patients, admins see everything
- **Role-based Access Control**: Different UI and permissions per user role
- **Authentication**: Secure login with Supabase Auth
- **API Protection**: Server-side validation for all operations

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Migrations

When updating the schema:
1. Modify `database/schema.sql`
2. Run the new SQL in Supabase SQL Editor
3. Update TypeScript types in `lib/database.types.ts`

## 📊 Features Implemented

- ✅ Role-based authentication (Admin, Doctor, Patient)
- ✅ Therapy session booking with conflict detection
- ✅ Interactive calendar view
- ✅ Real-time notifications
- ✅ Patient feedback system
- ✅ Doctor session management
- ✅ Admin analytics dashboard
- ✅ Row Level Security (RLS)
- ✅ Responsive design
- ✅ TypeScript throughout

## 🎯 Future Enhancements

- Email notifications with SendGrid integration
- Advanced analytics with charts
- Mobile app with React Native
- Payment integration
- Telemedicine video calls
- Automated reminder system
- Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or issues:
- Check the database schema in `database/schema.sql`
- Review the authentication setup in `lib/auth.ts`
- Ensure environment variables are configured correctly

## 📄 License

This project is for demonstration purposes. Please ensure proper licensing for production use.
