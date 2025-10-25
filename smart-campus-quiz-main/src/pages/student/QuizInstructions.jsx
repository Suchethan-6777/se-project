import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/utils/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const QuizInstructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchQuizDetails();
  }, [id]);

  const fetchQuizDetails = async () => {
    try {
      const response = await api.get('/api/quizzes/assigned-to-me');
      const quizData = response.data.find((q) => q.id === parseInt(id));
      if (quizData) {
        setQuiz(quizData);
      } else {
        toast.error('Quiz not found');
        navigate('/student/dashboard');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    setStarting(true);
    try {
      const response = await api.post(`/api/student/quizzes/${id}/attempt`);
      const attemptData = response.data;
      
      navigate(`/student/quiz/${id}/taking`, {
        state: {
          attemptId: attemptData.id,
          questions: attemptData.questions,
        },
      });
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error('Failed to start quiz');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="shadow-card-hover">
        <CardHeader>
          <CardTitle className="text-3xl">{quiz.title}</CardTitle>
          <CardDescription className="text-base">{quiz.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="font-semibold">{quiz.subject}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Duration</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <p className="font-semibold">{quiz.durationInMinutes} minutes</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Marks</p>
              <p className="font-semibold">{quiz.totalMarks}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Questions</p>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <p className="font-semibold">{quiz.questions?.length || 0}</p>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p className="font-semibold">Instructions:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Read each question carefully before answering</li>
                <li>You can navigate between questions using Next/Previous buttons</li>
                <li>Make sure to submit before the time runs out</li>
                <li>Once submitted, you cannot retake the quiz</li>
                <li>Your timer will start as soon as you click "Start Quiz"</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Start Time</p>
            <p className="font-semibold">{new Date(quiz.startTime).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-3 mb-2">End Time</p>
            <p className="font-semibold">{new Date(quiz.endTime).toLocaleString()}</p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/student/dashboard')}>
            Back to Dashboard
          </Button>
          <Button
            className="flex-1"
            onClick={handleStartQuiz}
            disabled={starting}
          >
            {starting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              'Start Quiz'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizInstructions;
