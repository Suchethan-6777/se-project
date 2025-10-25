import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, ArrowLeft, Search } from 'lucide-react';
import { toast } from 'sonner';

const QuizForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    durationInMinutes: 30,
    totalMarks: 100,
    startTime: '',
    endTime: '',
    status: 'DRAFT',
    assignmentCriteria: '',
  });

  useEffect(() => {
    fetchQuestions();
    if (isEditing) {
      fetchQuizData();
    }
  }, [id]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/api/questions/all');
      setAllQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    }
  };

  const fetchQuizData = async () => {
    try {
      const response = await api.get('/api/quizzes');
      const quiz = response.data.find((q) => q.id === parseInt(id));
      
      if (quiz) {
        setFormData({
          title: quiz.title,
          description: quiz.description,
          subject: quiz.subject,
          durationInMinutes: quiz.durationInMinutes,
          totalMarks: quiz.totalMarks,
          startTime: quiz.startTime.slice(0, 16),
          endTime: quiz.endTime.slice(0, 16),
          status: quiz.status,
          assignmentCriteria: quiz.assignmentCriteria || '',
        });
        setSelectedQuestionIds(quiz.questions?.map((q) => q.id) || []);
      } else {
        toast.error('Quiz not found');
        navigate('/faculty/my-quizzes');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedQuestionIds.length === 0) {
      toast.error('Please select at least one question');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        questions: selectedQuestionIds.map((qid) => ({ id: qid })),
      };

      if (isEditing) {
        await api.put(`/api/quizzes/${id}`, payload);
        toast.success('Quiz updated successfully');
      } else {
        await api.post('/api/quizzes', payload);
        toast.success('Quiz created successfully');
      }
      navigate('/faculty/my-quizzes');
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const filteredQuestions = allQuestions.filter((q) => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || q.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(allQuestions.map((q) => q.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/faculty/my-quizzes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update quiz details' : 'Fill in the details to create a quiz'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter quiz title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics, Science"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the quiz"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.durationInMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, durationInMinutes: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks *</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  min="1"
                  value={formData.totalMarks}
                  onChange={(e) =>
                    setFormData({ ...formData, totalMarks: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignmentCriteria">Assignment Criteria</Label>
              <Textarea
                id="assignmentCriteria"
                placeholder="Describe who should be assigned this quiz (e.g., All students, Class A, etc.)"
                value={formData.assignmentCriteria}
                onChange={(e) =>
                  setFormData({ ...formData, assignmentCriteria: e.target.value })
                }
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Question Selection */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>
              Select Questions ({selectedQuestionIds.length} selected)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Search Questions</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Filter by Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredQuestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No questions found</p>
              ) : (
                filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => toggleQuestionSelection(question.id)}
                  >
                    <Checkbox
                      checked={selectedQuestionIds.includes(question.id)}
                      onCheckedChange={() => toggleQuestionSelection(question.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <p className="font-medium">{question.questionText}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {question.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {question.options?.length || 0} options
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/faculty/my-quizzes')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditing ? 'Update Quiz' : 'Create Quiz'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;
