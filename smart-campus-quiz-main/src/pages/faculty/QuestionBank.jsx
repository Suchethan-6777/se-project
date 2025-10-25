import { useEffect, useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Edit, Trash2, FileQuestion, Filter } from 'lucide-react';
import { toast } from 'sonner';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    questionText: '',
    category: '',
    options: [
      { optionText: '', correct: false },
      { optionText: '', correct: false },
      { optionText: '', correct: false },
      { optionText: '', correct: false },
    ],
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, categoryFilter, searchTerm]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/api/questions/all');
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter((q) => q.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter((q) =>
        q.questionText.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  };

  const resetForm = () => {
    setFormData({
      questionText: '',
      category: '',
      options: [
        { optionText: '', correct: false },
        { optionText: '', correct: false },
        { optionText: '', correct: false },
        { optionText: '', correct: false },
      ],
    });
    setSelectedQuestion(null);
  };

  const handleOpenModal = (question = null) => {
    if (question) {
      setSelectedQuestion(question);
      setFormData({
        questionText: question.questionText,
        category: question.category,
        options: question.options.map((opt) => ({
          optionText: opt.optionText,
          correct: opt.correct,
        })),
      });
    } else {
      resetForm();
    }
    setModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.questionText.trim()) {
      toast.error('Question text is required');
      return;
    }
    if (!formData.category.trim()) {
      toast.error('Category is required');
      return;
    }
    if (formData.options.some((opt) => !opt.optionText.trim())) {
      toast.error('All options must have text');
      return;
    }
    if (!formData.options.some((opt) => opt.correct)) {
      toast.error('At least one option must be marked as correct');
      return;
    }

    setSaving(true);
    try {
      if (selectedQuestion) {
        await api.put(`/api/questions/replace/${selectedQuestion.id}`, formData);
        toast.success('Question updated successfully');
      } else {
        await api.post('/api/questions/add', formData);
        toast.success('Question added successfully');
      }
      setModalOpen(false);
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return;

    setDeleting(true);
    try {
      await api.delete(`/api/questions/delete/${selectedQuestion.id}`);
      toast.success('Question deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    } finally {
      setDeleting(false);
    }
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...formData.options];
    if (field === 'correct') {
      // Only one correct answer allowed
      newOptions.forEach((opt, i) => {
        opt.correct = i === index ? value : false;
      });
    } else {
      newOptions[index][field] = value;
    }
    setFormData({ ...formData, options: newOptions });
  };

  const categories = [...new Set(questions.map((q) => q.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-primary">
            <FileQuestion className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Question Bank</h1>
            <p className="text-muted-foreground">Manage your question collection</p>
          </div>
        </div>
        <Button size="lg" onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="h-5 w-5" />
          Add Question
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Search Questions</Label>
              <Input
                placeholder="Search by question text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
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
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>
            Questions ({filteredQuestions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredQuestions.length === 0 ? (
            <div className="py-12 text-center">
              <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No questions found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question) => (
                    <TableRow key={question.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {question.questionText}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{question.category}</Badge>
                      </TableCell>
                      <TableCell>{question.options?.length || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(question)}
                            className="gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedQuestion(question);
                              setDeleteDialogOpen(true);
                            }}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
            <DialogDescription>
              {selectedQuestion
                ? 'Update the question details below'
                : 'Fill in the details to create a new question'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveQuestion} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="questionText">Question Text *</Label>
              <Textarea
                id="questionText"
                placeholder="Enter your question"
                value={formData.questionText}
                onChange={(e) =>
                  setFormData({ ...formData, questionText: e.target.value })
                }
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                placeholder="e.g., Mathematics, Science, History"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>

            <div className="space-y-4">
              <Label>Options *</Label>
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={option.correct}
                    onCheckedChange={(checked) =>
                      updateOption(index, 'correct', checked)
                    }
                    className="mt-3"
                  />
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Option {index + 1} {option.correct && '(Correct Answer)'}
                    </Label>
                    <Input
                      placeholder={`Enter option ${index + 1}`}
                      value={option.optionText}
                      onChange={(e) =>
                        updateOption(index, 'optionText', e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Check the box next to the correct answer
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : selectedQuestion ? (
                  'Update Question'
                ) : (
                  'Add Question'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuestion}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuestionBank;
