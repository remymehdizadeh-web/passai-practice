import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export type ExamType = 'RN' | 'PN';

interface ExamTypeSelectionProps {
  onSelect: (examType: ExamType) => void;
}

export function ExamTypeSelection({ onSelect }: ExamTypeSelectionProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <GraduationCap className="w-8 h-8 text-primary" />
      </div>
      
      <h1 className="text-2xl font-bold text-foreground text-center mb-2">
        Welcome to NCLEX Go
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        Which exam are you preparing for?
      </p>
      
      <div className="w-full max-w-xs space-y-3">
        <Button
          onClick={() => onSelect('RN')}
          variant="outline"
          className="w-full h-14 text-lg font-semibold border-2 hover:border-primary hover:bg-primary/5"
        >
          NCLEX-RN
        </Button>
        <Button
          onClick={() => onSelect('PN')}
          variant="outline"
          className="w-full h-14 text-lg font-semibold border-2 hover:border-primary hover:bg-primary/5"
        >
          NCLEX-PN
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-6 text-center">
        You can change this later in Settings
      </p>
    </div>
  );
}
