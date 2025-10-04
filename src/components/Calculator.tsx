import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, SquareEqual, CircleX } from "lucide-react";
import SubjectRow, { type Subject } from "../components/SubjectRow";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { calculateGPA, type GPAResults } from "@/components/Calculator_Logic";

interface CalculatorProps {
  subjects: Subject[];
  onSubjectsChange: (subjects: Subject[]) => void;
  onResultsChange?: (results: GPAResults | null) => void;
  uploadButton?: React.ReactNode; // <-- allow injection of custom button
}

const Calculator: React.FC<CalculatorProps> = ({ subjects, onSubjectsChange, onResultsChange, uploadButton }) => {
  const [results, setResults] = useState<GPAResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addSubject = () =>
    onSubjectsChange([...subjects, { number: subjects.length + 1, code: "", semester: "", name: "", credits: "", grade: "" }]);
  const deleteSubject = (index: number) => onSubjectsChange(subjects.filter((_, i) => i !== index));
  const updateSubject = (index: number, field: keyof Subject, value: string) => {
    onSubjectsChange(subjects.map((subj, i) => (i === index ? { ...subj, [field]: value } : subj)));
  };

  const handleCalculate = () => {
    const { results, error } = calculateGPA(subjects);
    if (error) setError(error.message);
    if (results) {
      setResults(results);
      onResultsChange?.(results);
    }
  };

  const handleClear = () => {
    onSubjectsChange(
      Array.from({ length: 8 }, (_, i) => ({ number: i + 1, code: "", semester: "", name: "", credits: "", grade: "" }))
    );
    setResults(null);
    onResultsChange?.(null);
  };

  return (
    <>
      <div>
        <Card className="flex flex-col px-4 min-h-[430px] max-h-[430px] mb-2">
          <div className="flex-1 overflow-y-scroll max-h-[400px] custom-scrollbar">
            {subjects.map((subj, idx) => (
              <SubjectRow key={idx} index={idx} subject={subj} updateSubject={updateSubject} deleteSubject={deleteSubject} />
            ))}
          </div>
        </Card>

        <Card className="flex flex-row justify-between items-center p-2 ml-auto w-full">
          {/* Replace dropdown with Upload Excel button */}
          <div>{uploadButton}</div>

          <div className="text-xs sm:text-base shrink-0">Total Subjects: {subjects.length}</div>

          <div className="flex rounded-md border transition-colors duration-300 hover:border-blue-500 dark:hover:border-yellow-500 relative">
            <Button variant="ghost" onClick={addSubject} className="hover:text-green-500">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={handleClear} className="hover:text-red-500">
              <CircleX className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={handleCalculate}
              className="flex gap-1 hover:text-blue-500 dark:hover:text-yellow-500"
            >
              <SquareEqual className="h-4 w-4" />
              <span className="hidden sm:inline">Calculate</span>
            </Button>
          </div>
        </Card>
      </div>

      <AlertDialog open={!!error} onOpenChange={(open) => !open && setError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setError(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Calculator;
