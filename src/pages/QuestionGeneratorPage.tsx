import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NCLEX_CATEGORIES, NCLEX_SHORT_NAMES, type NclexCategory } from '@/lib/categories';
import { cn } from '@/lib/utils';

interface GenerationStatus {
  category: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  count: number;
  error?: string;
}

export default function QuestionGeneratorPage() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [statuses, setStatuses] = useState<GenerationStatus[]>([]);
  const [questionsPerCategory, setQuestionsPerCategory] = useState(25);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const generateForCategory = async (category: string, count: number, difficulty: string): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: { nclex_category: category, count, difficulty }
      });

      if (error) {
        console.error('Function invoke error:', error);
        return { success: false, count: 0, error: error.message };
      }

      if (data.error) {
        return { success: false, count: 0, error: data.error };
      }

      return { success: true, count: data.count || 0 };
    } catch (err) {
      console.error('Generation error:', err);
      return { success: false, count: 0, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const handleBulkGenerate = async () => {
    setIsGenerating(true);
    
    // Initialize statuses
    const initialStatuses: GenerationStatus[] = NCLEX_CATEGORIES.map(cat => ({
      category: cat,
      status: 'pending',
      count: 0,
    }));
    setStatuses(initialStatuses);

    let totalGenerated = 0;

    // Generate for each category sequentially (to avoid rate limits)
    for (let i = 0; i < NCLEX_CATEGORIES.length; i++) {
      const category = NCLEX_CATEGORIES[i];
      
      // Update status to generating
      setStatuses(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'generating' } : s
      ));

      // Generate in batches of 5 to avoid timeouts
      let categoryTotal = 0;
      const batchSize = 5;
      const batches = Math.ceil(questionsPerCategory / batchSize);

      for (let batch = 0; batch < batches; batch++) {
        const remaining = questionsPerCategory - categoryTotal;
        const currentBatchSize = Math.min(batchSize, remaining);
        
        const result = await generateForCategory(category, currentBatchSize, selectedDifficulty);
        
        if (result.success) {
          categoryTotal += result.count;
          totalGenerated += result.count;
        } else {
          // If we hit rate limit, wait and retry
          if (result.error?.includes('Rate limit')) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const retryResult = await generateForCategory(category, currentBatchSize, selectedDifficulty);
            if (retryResult.success) {
              categoryTotal += retryResult.count;
              totalGenerated += retryResult.count;
            }
          } else {
            setStatuses(prev => prev.map((s, idx) => 
              idx === i ? { ...s, status: 'error', count: categoryTotal, error: result.error } : s
            ));
            break;
          }
        }

        // Small delay between batches
        if (batch < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Update final status for this category
      setStatuses(prev => prev.map((s, idx) => 
        idx === i ? { 
          ...s, 
          status: s.status === 'error' ? 'error' : 'complete', 
          count: categoryTotal 
        } : s
      ));
    }

    setIsGenerating(false);
    toast.success(`Generated ${totalGenerated} questions across all categories!`);
  };

  const handleSingleCategory = async (category: string) => {
    setIsGenerating(true);
    
    setStatuses([{
      category,
      status: 'generating',
      count: 0,
    }]);

    const result = await generateForCategory(category, questionsPerCategory, selectedDifficulty);
    
    setStatuses([{
      category,
      status: result.success ? 'complete' : 'error',
      count: result.count,
      error: result.error,
    }]);

    setIsGenerating(false);
    
    if (result.success) {
      toast.success(`Generated ${result.count} questions for ${category}`);
    } else {
      toast.error(result.error || 'Failed to generate questions');
    }
  };

  const completedCount = statuses.filter(s => s.status === 'complete').length;
  const totalQuestions = statuses.reduce((sum, s) => sum + s.count, 0);
  const progress = NCLEX_CATEGORIES.length > 0 ? (completedCount / NCLEX_CATEGORIES.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Question Generator</h1>
            <p className="text-sm text-muted-foreground">Generate NCLEX-style questions with AI</p>
          </div>
        </div>

        {/* Settings */}
        <div className="card-organic p-5 mb-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Questions per Category</label>
            <div className="flex gap-2">
              {[10, 25, 50].map(num => (
                <button
                  key={num}
                  onClick={() => setQuestionsPerCategory(num)}
                  disabled={isGenerating}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    questionsPerCategory === num 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Difficulty</label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  disabled={isGenerating}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors",
                    selectedDifficulty === diff 
                      ? diff === 'easy' ? "bg-success text-white" :
                        diff === 'medium' ? "bg-warning text-white" :
                        "bg-destructive text-white"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bulk Generate Button */}
        <Button 
          onClick={handleBulkGenerate} 
          disabled={isGenerating}
          className="w-full mb-6 h-14 text-lg"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating... ({totalQuestions} created)
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate {questionsPerCategory * 8} Questions (All Categories)
            </>
          )}
        </Button>

        {/* Progress */}
        {statuses.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completedCount}/{NCLEX_CATEGORIES.length} categories</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Category Status / Individual Generate */}
        <div className="space-y-2">
          <h2 className="font-semibold text-foreground mb-3">Categories</h2>
          {NCLEX_CATEGORIES.map((category) => {
            const status = statuses.find(s => s.category === category);
            
            return (
              <div 
                key={category}
                className="card-organic p-4 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {NCLEX_SHORT_NAMES[category as NclexCategory]}
                  </p>
                  <p className="text-xs text-muted-foreground">{category}</p>
                </div>

                {status ? (
                  <div className="flex items-center gap-2">
                    {status.status === 'generating' && (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    )}
                    {status.status === 'complete' && (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    )}
                    {status.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                    {status.count > 0 && (
                      <span className="text-sm font-medium text-foreground">
                        +{status.count}
                      </span>
                    )}
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSingleCategory(category)}
                    disabled={isGenerating}
                  >
                    Generate
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
