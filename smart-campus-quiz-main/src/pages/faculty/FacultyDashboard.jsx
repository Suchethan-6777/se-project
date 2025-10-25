import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileQuestion, ClipboardList, Plus } from 'lucide-react';

const FacultyDashboard = () => {
  const dashboardCards = [
    {
      title: 'My Quizzes',
      description: 'Create and manage your quizzes',
      icon: ClipboardList,
      link: '/faculty/my-quizzes',
      action: 'View Quizzes',
      gradient: 'from-primary to-secondary',
    },
    {
      title: 'Question Bank',
      description: 'Add and manage your question collection',
      icon: FileQuestion,
      link: '/faculty/questions',
      action: 'Manage Questions',
      gradient: 'from-secondary to-accent',
    },
    {
      title: 'Assigned Quizzes',
      description: 'View quizzes assigned to you',
      icon: BookOpen,
      link: '/faculty/quizzes',
      action: 'View Assigned',
      gradient: 'from-accent to-primary',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Faculty Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your quizzes and question bank
          </p>
        </div>
        <Link to="/faculty/quiz/create">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Quiz
          </Button>
        </Link>
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

export default FacultyDashboard;
