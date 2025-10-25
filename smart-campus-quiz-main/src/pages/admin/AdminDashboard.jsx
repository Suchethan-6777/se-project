import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, FileQuestion, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const dashboardCards = [
    {
      title: 'User Management',
      description: 'Manage all users and their roles',
      icon: Users,
      link: '/admin/users',
      action: 'Manage Users',
      gradient: 'from-primary to-secondary',
    },
    {
      title: 'All Quizzes',
      description: 'View and manage all quizzes in the system',
      icon: BookOpen,
      link: '/admin/all-quizzes',
      action: 'View Quizzes',
      gradient: 'from-secondary to-accent',
    },
    {
      title: 'Question Bank',
      description: 'Manage the entire question repository',
      icon: FileQuestion,
      link: '/admin/questions',
      action: 'Manage Questions',
      gradient: 'from-accent to-primary',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-primary">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground">
            Complete control over the quiz system
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="hover:shadow-card-hover transition-all hover:scale-105 group"
            >
              <CardHeader>
                <div className={`p-4 rounded-lg bg-gradient-to-br ${card.gradient} w-fit mb-2`}>
                  <Icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">{card.title}</CardTitle>
                <CardDescription className="text-base">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={card.link}>
                  <Button className="w-full group-hover:bg-secondary">
                    {card.action}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
