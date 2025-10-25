import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Trophy, Clock, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const QuizResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      const response = await api.get(`/api/student/attempts/${attemptId}`);
      setResult(response.data);
    } catch (error) {
      console.error('Error fetching result:', error);
      toast.error('Failed to load quiz result');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) return null;

  const percentage = (result.score / result.quiz?.totalMarks) * 100;
  const isPassed = percentage >= 50;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Quiz Results</h1>
        <p className="text-muted-foreground">{result.quiz?.title}</p>
      </div>

      {/* Score Card */}
      <Card className="shadow-card-hover">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            {isPassed ? (
              <Trophy className="h-20 w-20 text-success" />
            ) : (
              <XCircle className="h-20 w-20 text-destructive" />
            )}
          </div>
          <CardTitle className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {result.score} / {result.quiz?.totalMarks}
          </CardTitle>
          <p className="text-muted-foreground text-lg mt-2">
            {percentage.toFixed(1)}%
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Badge variant={isPassed ? 'default' : 'destructive'} className="text-lg px-6 py-2">
              {isPassed ? 'Passed' : 'Failed'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Submitted At</p>
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="font-semibold">
                  {new Date(result.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(result.submittedAt).toLocaleTimeString()}
              </p>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Questions</p>
              <p className="text-2xl font-bold text-primary">
                {result.quiz?.questions?.length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answer Review */}
      {result.answers && result.answers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Answer Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.answers.map((answer, index) => {
              const question = answer.question;
              const selectedOption = question?.options?.find(
                (opt) => opt.id === answer.selectedOptionId
              );
              const correctOption = question?.options?.find((opt) => opt.correct);
              const isCorrect = answer.correct;

              return (
                <div
                  key={answer.id}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect ? 'border-success/50 bg-success/5' : 'border-destructive/50 bg-destructive/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold">
                        Question {index + 1}: {question?.questionText}
                      </p>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Your answer: </span>
                          <span className={isCorrect ? 'text-success font-medium' : 'text-destructive font-medium'}>
                            {selectedOption?.optionText || 'Not answered'}
                          </span>
                        </p>
                        {!isCorrect && correctOption && (
                          <p>
                            <span className="text-muted-foreground">Correct answer: </span>
                            <span className="text-success font-medium">
                              {correctOption.optionText}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button size="lg" onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default QuizResult;
