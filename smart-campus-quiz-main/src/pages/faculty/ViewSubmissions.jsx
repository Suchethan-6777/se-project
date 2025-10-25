import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, FileText, Trophy, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const ViewSubmissions = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, [quizId]);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get(`/api/quizzes/${quizId}/submissions`);
      setSubmissions(response.data);
      
      if (response.data.length > 0) {
        setQuizTitle(response.data[0].quiz?.title || 'Quiz Submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const getPassStatus = (score, totalMarks) => {
    const percentage = (score / totalMarks) * 100;
    return percentage >= 50;
  };

  const calculateStatistics = () => {
    if (submissions.length === 0) return null;

    const scores = submissions.map((s) => s.score);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const totalMarks = submissions[0]?.quiz?.totalMarks || 100;
    const passCount = submissions.filter((s) => getPassStatus(s.score, totalMarks)).length;

    return {
      average: average.toFixed(2),
      highest,
      lowest,
      passRate: ((passCount / submissions.length) * 100).toFixed(1),
    };
  };

  const stats = calculateStatistics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Quiz Submissions</h1>
          <p className="text-muted-foreground">{quizTitle}</p>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                <p className="text-3xl font-bold text-primary">{stats.average}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Highest Score</p>
                <p className="text-3xl font-bold text-success">{stats.highest}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Lowest Score</p>
                <p className="text-3xl font-bold text-destructive">{stats.lowest}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Pass Rate</p>
                <p className="text-3xl font-bold text-primary">{stats.passRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submissions Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>All Submissions ({submissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No submissions yet</h3>
              <p className="text-muted-foreground">
                Submissions will appear here once students complete the quiz
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => {
                    const totalMarks = submission.quiz?.totalMarks || 100;
                    const percentage = ((submission.score / totalMarks) * 100).toFixed(1);
                    const passed = getPassStatus(submission.score, totalMarks);

                    return (
                      <TableRow key={submission.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {submission.student?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>{submission.student?.email || 'N/A'}</TableCell>
                        <TableCell className="font-semibold">
                          {submission.score} / {totalMarks}
                        </TableCell>
                        <TableCell>{percentage}%</TableCell>
                        <TableCell>
                          {passed ? (
                            <Badge variant="default" className="gap-1">
                              <Trophy className="h-3 w-3" />
                              Passed
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(submission.submittedAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewSubmissions;
