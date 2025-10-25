# College Quiz System - Frontend

A comprehensive React + Vite frontend application for a college quiz management system. This application provides interfaces for Students, Faculty, and Administrators to interact with the quiz system.

## Features

### Student Features
- **Dashboard**: View assigned quizzes with status indicators
- **Quiz Taking**: Real-time quiz interface with timer and navigation
- **Quiz Results**: Detailed score analysis and performance feedback
- **Profile Management**: View profile and request faculty promotion

### Faculty Features
- **Dashboard**: Overview of created quizzes and assigned quizzes
- **Quiz Management**: Create, edit, and manage quizzes
- **Question Bank**: Comprehensive question management system
- **Submissions View**: Track student performance and submissions
- **Quiz Analytics**: View detailed statistics and results

### Admin Features
- **System Overview**: Complete system statistics and monitoring
- **User Management**: Manage all users and their roles
- **Quiz Oversight**: View and manage all quizzes in the system
- **Full Access**: Access to all faculty and student features

## Tech Stack

- **React 18** - Frontend framework
- **Vite** - Build tool and development server
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API calls
- **JWT Decode** - JWT token handling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on http://localhost:8080

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd sefrontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
sefrontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.jsx      # Main layout wrapper
│   │   ├── Login.jsx       # Login page
│   │   ├── LoginCallback.jsx # OAuth callback handler
│   │   ├── Navbar.jsx      # Navigation component
│   │   └── ProtectedRoute.jsx # Route protection
│   ├── pages/              # Page components
│   │   ├── student/        # Student-specific pages
│   │   ├── faculty/        # Faculty-specific pages
│   │   ├── admin/          # Admin-specific pages
│   │   └── Home.jsx        # Landing page
│   ├── utils/              # Utility functions
│   │   ├── api.js          # API service layer
│   │   └── auth.js         # Authentication utilities
│   ├── App.jsx             # Main app component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## Authentication

The application uses Google OAuth2 for authentication:

1. Users click "Sign In with Google"
2. They are redirected to the backend OAuth2 endpoint
3. After successful authentication, they are redirected back with a JWT token
4. The token is stored in localStorage and used for API calls
5. The user is redirected to their role-specific dashboard

## API Integration

The frontend communicates with the backend API through:

- **Base URL**: `http://localhost:8080`
- **Authentication**: Bearer token in Authorization header
- **Error Handling**: Automatic token refresh and logout on 401 errors

### Key API Endpoints Used

- `GET /auth/me` - Get current user details
- `POST /auth/promote-to-faculty` - Promote student to faculty
- `GET /api/quizzes/assigned-to-me` - Get assigned quizzes
- `POST /api/student/quizzes/{id}/attempt` - Start quiz attempt
- `POST /api/student/quizzes/attempt/{attemptId}/submit` - Submit quiz
- `GET /api/questions/all` - Get all questions
- `POST /api/quizzes` - Create quiz
- `GET /api/admin/users` - Get all users (admin only)

## Role-Based Access Control

The application implements role-based access control:

- **Student**: Can take quizzes, view results, manage profile
- **Faculty**: Can create quizzes, manage questions, view submissions
- **Admin**: Full system access including user management

## Styling

The application uses Tailwind CSS for styling with:

- Responsive design for all screen sizes
- Consistent color scheme and typography
- Interactive components with hover states
- Loading states and error handling
- Modern, clean UI design

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Organization

- Components are organized by feature and role
- Reusable components are in the `components` directory
- Page components are in the `pages` directory
- Utility functions are in the `utils` directory
- All components use functional components with hooks

## Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript for type safety
3. Follow React best practices
4. Ensure responsive design
5. Test all user flows before submitting

## License

This project is part of a college software engineering course.


