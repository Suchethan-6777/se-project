import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Calendar, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';

const FacultyAssignedQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignedQuizzes();
  }, []);

  const fetchAssignedQuizzes = async () => {
    try {
      const response = await api.get('/api/quizzes/assigned-to-me');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load assigned quizzes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      DRAFT: 'secondary',
      PUBLISHED: 'default',
      ARCHIVED: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Assigned Quizzes
        </h1>
        <p className="text-muted-foreground">
          View quizzes that have been assigned to you
        </p>
      </div>

      {quizzes.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No quizzes assigned</h3>
            <p className="text-muted-foreground">
              You don't have any quizzes assigned to you at the moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-card-hover transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{quiz.title}</CardTitle>
                  {getStatusBadge(quiz.status)}
                </div>
                <CardDescription>{quiz.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Subject: {quiz.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{quiz.durationInMinutes} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {new Date(quiz.startTime).toLocaleDateString()}
                  </span>
                </div>
                <div className="pt-2 border-t space-y-1">
                  <p className="text-sm font-semibold">Total Marks: {quiz.totalMarks}</p>
                  <p className="text-sm text-muted-foreground">
                    Questions: {quiz.questions?.length || 0}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => navigate(`/faculty/quiz/${quiz.id}/submissions`)}
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyAssignedQuizzes;
