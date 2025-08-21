# TutorBridge - Tuition Matchmaking Platform

A comprehensive web platform connecting students with qualified tutors, built with vanilla HTML, CSS, and JavaScript, fully ready for Supabase backend integration.

## 🚀 **Backend Integration Status: COMPLETE** ✅

The entire codebase is now **100% backend-ready** with:
- ✅ Complete authentication system (login/signup)
- ✅ Role-based access control (admin/tutor/student)
- ✅ Session management and security
- ✅ Supabase integration placeholders
- ✅ Mock data fallbacks for development
- ✅ Error handling and loading states
- ✅ Form validation and submission

## 🏗️ **Architecture Overview**

### **Frontend Stack**
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid/Flexbox, custom properties
- **Vanilla JavaScript**: ES6+ features, async/await, modules
- **No Frameworks**: Pure vanilla implementation for maximum performance

### **Backend Integration**
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Authentication**: Row-level security (RLS) with role-based access
- **API**: RESTful endpoints with automatic CRUD operations
- **Real-time**: Live updates for messages and notifications

## 📁 **Project Structure**

```
TutorBridge/
├── assets/                 # Images and static assets
├── components/            # Reusable UI components
├── pages/                 # Application pages
│   ├── auth/             # Authentication pages
│   ├── dashboards/       # Role-specific dashboards
│   └── features/         # Core feature pages
├── scripts/               # JavaScript modules
│   ├── auth.js           # Authentication & session management
│   ├── supabaseClient.js # Database client configuration
│   ├── admin-data.js     # Admin data operations
│   └── [feature].js      # Feature-specific logic
├── styles/                # CSS stylesheets
└── index.html            # Landing page
```

## 🔐 **Authentication System**

### **User Roles**
- **Student**: Can post tuition requests, view applications, message tutors
- **Tutor**: Can browse requests, apply, manage applications, message students
- **Admin**: Full platform management, user approval, reports handling

### **Security Features**
- Session-based authentication with automatic expiration
- Role-based page access guards
- Form validation and sanitization
- CSRF protection through Supabase RLS

## 🗄️ **Database Schema**

### **Core Tables**

#### **profiles**
```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('student', 'tutor', 'admin')) NOT NULL,
    status TEXT CHECK (status IN ('active', 'pending', 'blocked')) DEFAULT 'pending',
    location TEXT,
    subjects TEXT[],
    hourly_rate DECIMAL(10,2),
    experience TEXT,
    qualification TEXT,
    institution TEXT,
    bio TEXT,
    profile_image_url TEXT,
    availability JSONB,
    teaching_style TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **tuition_requests**
```sql
CREATE TABLE tuition_requests (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES profiles(id) NOT NULL,
    subject TEXT NOT NULL,
    class_level TEXT NOT NULL,
    curriculum TEXT,
    location TEXT NOT NULL,
    tuition_type TEXT CHECK (tuition_type IN ('online', 'home')) NOT NULL,
    session_duration DECIMAL(4,2) NOT NULL,
    days_per_week INTEGER CHECK (days_per_week BETWEEN 1 AND 7) NOT NULL,
    salary_range TEXT NOT NULL,
    additional_details TEXT,
    status TEXT CHECK (status IN ('open', 'closed', 'assigned')) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **applications**
```sql
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    tutor_id UUID REFERENCES profiles(id) NOT NULL,
    request_id INTEGER REFERENCES tuition_requests(id) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    proposed_salary DECIMAL(10,2),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tutor_id, request_id)
);
```

#### **messages**
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id UUID REFERENCES profiles(id) NOT NULL,
    receiver_id UUID REFERENCES profiles(id) NOT NULL,
    content TEXT NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **reports**
```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    reporter_id UUID REFERENCES profiles(id) NOT NULL,
    reported_user_id UUID REFERENCES profiles(id) NOT NULL,
    content_id TEXT,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT CHECK (status IN ('pending', 'resolved', 'dismissed')) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);
```

#### **payments**
```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
    commission_collected BOOLEAN DEFAULT FALSE,
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Row Level Security (RLS) Policies**

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tuition_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Tuition requests policies
CREATE POLICY "Students can view their own requests" ON tuition_requests
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create requests" ON tuition_requests
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Tutors can view open requests" ON tuition_requests
    FOR SELECT USING (status = 'open');

-- Applications policies
CREATE POLICY "Tutors can view their applications" ON applications
    FOR SELECT USING (tutor_id = auth.uid());

CREATE POLICY "Students can view applications to their requests" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tuition_requests 
            WHERE id = request_id AND student_id = auth.uid()
        )
    );

-- Messages policies
CREATE POLICY "Users can view messages they sent or received" ON messages
    FOR SELECT USING (
        sender_id = auth.uid() OR receiver_id = auth.uid()
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());
```

## 🚀 **Backend Setup Instructions**

### **1. Supabase Project Setup**

1. **Create Supabase Project**
   ```bash
   # Visit https://supabase.com
   # Create new project
   # Note down: Project URL and anon key
   ```

2. **Install Supabase CLI** (optional)
   ```bash
   npm install -g supabase
   ```

3. **Configure Environment**
   ```javascript
   // scripts/supabaseClient.js
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

### **2. Database Setup**

1. **Run SQL Schema**
   ```bash
   # Copy schema from above to Supabase SQL Editor
   # Execute all CREATE TABLE statements
   # Enable RLS and create policies
   ```

2. **Seed Initial Data** (optional)
   ```sql
   -- Insert admin user
   INSERT INTO profiles (id, full_name, email, role, status)
   VALUES (
       'your-admin-user-id',
       'Admin User',
       'admin@tutorbridge.com',
       'admin',
       'active'
   );
   ```

### **3. Frontend Integration**

1. **Include Supabase Library**
   ```html
   <!-- Add to pages that need database access -->
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```

2. **Initialize Client**
   ```javascript
   // Automatically initialized in supabaseClient.js
   const supabase = window.getSupabaseClient();
   ```

3. **Test Connection**
   ```javascript
   // Check if backend is available
   if (window.isSupabaseAvailable()) {
       console.log('✅ Backend connected');
   } else {
       console.log('🔧 Using mock data');
   }
   ```

## 🧪 **Testing & Development**

### **Mock Data Mode**
- All scripts include fallback mock data
- Perfect for development without backend
- Automatic fallback when Supabase unavailable

### **Testing Authentication**
```javascript
// Test role-based access
if (window.auth?.isAdmin()) {
    console.log('Admin access granted');
}

// Test session validity
const isValid = await window.auth?.checkSessionValidity();
```

### **Testing Database Queries**
```javascript
// Test with fallback
const result = await window.executeQuery(
    (supabase) => supabase.from('profiles').select('*'),
    fallbackData
);
```

## 🔧 **Customization & Extension**

### **Adding New Features**
1. Create HTML page in `pages/`
2. Add JavaScript logic in `scripts/`
3. Include Supabase queries with fallbacks
4. Add authentication guards if needed

### **Modifying Database Schema**
1. Update SQL schema
2. Modify RLS policies
3. Update JavaScript queries
4. Test with existing data

### **Adding New User Roles**
1. Update `profiles.role` CHECK constraint
2. Modify authentication guards
3. Update dashboard redirects
4. Add role-specific features

## 📱 **Responsive Design**

- **Mobile-first** approach
- **CSS Grid & Flexbox** for layouts
- **Custom properties** for theming
- **Media queries** for breakpoints
- **Touch-friendly** interactions

## 🌐 **Browser Support**

- **Modern browsers**: Chrome 80+, Firefox 75+, Safari 13+
- **ES6+ features**: Async/await, arrow functions, destructuring
- **CSS Grid**: Full support in all modern browsers
- **Progressive enhancement**: Graceful degradation for older browsers

## 🚀 **Deployment**

### **Static Hosting**
- **Netlify**: Drag & drop deployment
- **Vercel**: Git-based deployment
- **GitHub Pages**: Free hosting for public repos

### **Environment Variables**
```bash
# Set in hosting platform
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### **Build Process**
```bash
# No build step required - pure vanilla JS
# Just upload files to hosting platform
```

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** feature branch
3. **Make** changes with proper error handling
4. **Test** with both mock and real data
5. **Submit** pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

- **Issues**: GitHub Issues
- **Documentation**: This README
- **Backend**: Supabase documentation
- **Community**: GitHub Discussions

---

**🎉 Your TutorBridge platform is now fully backend-ready!**

Simply configure your Supabase credentials and deploy. The platform will automatically switch between real backend data and mock fallbacks based on availability.
