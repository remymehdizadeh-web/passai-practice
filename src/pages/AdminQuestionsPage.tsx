import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const sampleQuestion = {
  stem: "Which patient should the nurse assess first?",
  options: [
    { label: "A", text: "Patient with stable vital signs" },
    { label: "B", text: "Patient with sudden confusion" },
    { label: "C", text: "Patient requesting pain medication" },
    { label: "D", text: "Patient ready for discharge" }
  ],
  correct_label: "B",
  rationale_bullets: [
    "Sudden confusion indicates acute change in mental status",
    "May signal hypoxia, stroke, or sepsis requiring immediate assessment"
  ],
  wrong_option_bullets: {
    A: "Stable patients are low priority",
    C: "Pain is important but not life-threatening",
    D: "Discharge teaching can wait"
  },
  takeaway: "Prioritize patients with acute changes in condition.",
  category: "Management of Care",
  difficulty: "medium",
  exam_type: "Both" // Options: 'RN', 'PN', or 'Both'
};

export default function AdminQuestionsPage() {
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      toast.error("Please enter JSON data");
      return;
    }

    setIsLoading(true);
    try {
      const parsed = JSON.parse(jsonInput);
      const questions = Array.isArray(parsed) ? parsed : [parsed];

      const formattedQuestions = questions.map((q) => ({
        stem: q.stem,
        options: q.options,
        correct_label: q.correct_label,
        rationale_bullets: q.rationale_bullets || [],
        wrong_option_bullets: q.wrong_option_bullets || null,
        takeaway: q.takeaway,
        category: q.category,
        difficulty: q.difficulty || "medium",
        exam_type: q.exam_type || "Both",
        is_active: true
      }));

      const { error } = await supabase.from("questions").insert(formattedQuestions);

      if (error) throw error;

      toast.success(`Successfully imported ${questions.length} question(s)`);
      setJsonInput("");
    } catch (err: any) {
      console.error("Import error:", err);
      toast.error(err.message || "Failed to import questions");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = () => {
    setJsonInput(JSON.stringify([sampleQuestion], null, 2));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-2xl font-bold mb-2">Import Questions</h1>
        <p className="text-muted-foreground mb-4">
          Paste a single question object or an array of questions in JSON format.
        </p>

        <Button variant="outline" size="sm" onClick={loadSample} className="mb-3">
          Load Sample
        </Button>

        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='[{ "stem": "...", "options": [...], ... }]'
          className="min-h-[400px] font-mono text-sm mb-4"
        />

        <Button onClick={handleImport} disabled={isLoading} className="w-full">
          <Upload className="w-4 h-4 mr-2" />
          {isLoading ? "Importing..." : "Import Questions"}
        </Button>
      </div>
    </div>
  );
}
