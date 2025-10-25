import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '@/utils/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const QuizTaking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { attemptId, questions } = location.state || {};

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!attemptId || !questions) {
      navigate('/student/dashboard');
      return;
    }

    // Initialize timer (assuming quiz duration from backend)
    const duration = 30 * 60; // 30 minutes in seconds - you can get this from quiz data
    setTimeRemaining(duration);
  }, [attemptId, questions, navigate]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const currentQuestion = questions?.[currentQuestionIndex];

  const handleAnswerChange = (optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const submissionData = {
        answers: Object.entries(answers).map(([questionId, optionId]) => ({
          questionId: parseInt(questionId),
          selectedOptionId: optionId,
        })),
      };

      await api.post(`/api/student/quizzes/attempt/${attemptId}/submit`, submissionData);
      toast.success('Quiz submitted successfully!');
      navigate(`/student/quiz/result/${attemptId}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestionIndex + 1) / questions?.length) * 100;
  const answeredCount = Object.keys(answers).length;

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Timer and Progress */}
      <Card className="bg-gradient-card shadow-card">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">
                {timeRemaining !== null ? formatTime(timeRemaining) : '00:00'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="font-semibold">
                {answeredCount} / {questions.length} answered
              </p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="shadow-card-hover">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">
              Question {currentQuestionIndex + 1} of {questions.length}
            </CardTitle>
            {!answers[currentQuestion.id] && (
              <div className="flex items-center gap-1 text-warning text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Not answered</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-medium">{currentQuestion.questionText}</p>

          <RadioGroup
            value={answers[currentQuestion.id]?.toString()}
            onValueChange={(value) => handleAnswerChange(parseInt(value))}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                <Label
                  htmlFor={`option-${option.id}`}
                  className="flex-1 cursor-pointer"
                >
                  {option.optionText}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={() => setShowSubmitDialog(true)}>
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Question Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Question Navigator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, index) => (
              <Button
                key={q.id}
                variant={currentQuestionIndex === index ? 'default' : answers[q.id] ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setCurrentQuestionIndex(index)}
                className="w-10 h-10"
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} out of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-warning font-semibold">
                  Warning: {questions.length - answeredCount} question(s) are unanswered.
                </span>
              )}
              <span className="block mt-2">
                Once submitted, you cannot change your answers. Are you sure you want to submit?
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitQuiz} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizTaking;
