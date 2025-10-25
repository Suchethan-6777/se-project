import { Link } from 'react-router-dom';
import { GraduationCap, Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getUser, getUserRole, logout } from '@/utils/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { darkMode, toggleTheme } = useTheme();
  const user = getUser();
  const role = getUserRole();

  const getNavLinks = () => {
    if (role === 'ADMIN') {
      return [
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/all-quizzes', label: 'All Quizzes' },
        { to: '/admin/questions', label: 'Questions' },
      ];
    } else if (role === 'FACULTY') {
      return [
        { to: '/faculty/dashboard', label: 'Dashboard' },
        { to: '/faculty/my-quizzes', label: 'My Quizzes' },
        { to: '/faculty/questions', label: 'Question Bank' },
        { to: '/faculty/quizzes', label: 'Assigned Quizzes' },
      ];
    } else {
      return [
        { to: '/student/dashboard', label: 'Dashboard' },
        { to: '/student/profile', label: 'Profile' },
      ];
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                QuizMaster
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-4">
              {getNavLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <p className="text-xs font-semibold text-primary">{role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
