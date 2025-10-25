import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api'; // Use your main api instance
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const StudentDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const isQuizActive = (quiz) => {
    const now = new Date().getTime();
    const startTime = new Date(quiz.startTime).getTime();
    const endTime = new Date(quiz.endTime).getTime();
    return now >= startTime && now <= endTime;
  };

  const getQuizStatus = (quiz) => {
    if (quiz.status !== 'PUBLISHED') return 'NOT_AVAILABLE';
    const now = new Date().getTime();
    const startTime = new Date(quiz.startTime).getTime();
    const endTime = new Date(quiz.endTime).getTime();
    
    if (now < startTime) return 'UPCOMING';
    if (now > endTime) return 'EXPIRED';
    return 'ACTIVE';
  };

  useEffect(() => {
    fetchAssignedQuizzes();
  }, []);

  const fetchAssignedQuizzes = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const response = await api.get('/api/quizzes/assigned-to-me');
      setQuizzes(response.data || []); // Ensure quizzes is always an array
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
      setError('Failed to load assigned quizzes.'); // Set error state
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (quiz) => {
    const status = getQuizStatus(quiz);
    const variants = {
      NOT_AVAILABLE: 'secondary',
      UPCOMING: 'warning',
      ACTIVE: 'success',
      EXPIRED: 'destructive',
    };

    const labels = {
      NOT_AVAILABLE: 'Not Available',
      UPCOMING: 'Upcoming',
      ACTIVE: 'Active',
      EXPIRED: 'Expired',
    };

    return <Badge variant={variants[status] || 'secondary'}>{labels[status]}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
     return (
       <div className="text-center p-6 bg-red-100 dark:bg-red-900/20 rounded-lg">
         <p className="text-red-700 dark:text-red-300">{error}</p>
         <Button onClick={fetchAssignedQuizzes} className="mt-4">Try Again</Button>
       </div>
     );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          My Quizzes
        </h1>
        <p className="text-muted-foreground">
          View and attempt your assigned quizzes
        </p>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No quizzes assigned yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-card-hover transition-shadow flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{quiz.title}</CardTitle>
                  {getStatusBadge(quiz)}
                </div>
                <CardDescription>{quiz.description || 'No description provided.'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 flex-grow">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Subject: {quiz.subject || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{quiz.durationInMinutes} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Starts: {new Date(quiz.startTime).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Ends: {new Date(quiz.endTime).toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t dark:border-gray-700">
                  <p className="text-sm font-semibold">Total Marks: {quiz.totalMarks}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  // --- THIS IS THE CORRECTED LINE ---
                  onClick={() => navigate(`/student/quiz/${quiz.id}/instructions`)}
                  disabled={getQuizStatus(quiz) !== 'ACTIVE'}
                >
                  {(() => {
                    const status = getQuizStatus(quiz);
                    switch (status) {
                      case 'ACTIVE':
                        return 'Start Quiz';
                      case 'UPCOMING':
                        return 'Not Started Yet';
                      case 'EXPIRED':
                        return 'Quiz Ended';
                      default:
                        return 'Not Available';
                    }
                  })()}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
