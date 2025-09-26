import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Plus,
  SquareEqual,
  CircleX,
} from "lucide-react";
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

export interface ResultRow {
  index: number;
  subjectCode: string;
  semester: string;
  name: string;
  credits: number;
  grade: string;
  score: number;
}

export interface SemesterResult {
  semester: string;
  totalCredits: number;
  totalScore: number;
  gpa: string;
  rows: ResultRow[];
}

export interface GPAResults {
  rows: ResultRow[];
  totalCredits: number;
  totalScore: number;
  gpa: string;
  semesterResults: SemesterResult[];
}

interface CalculatorProps {
  subjects: Subject[];
  onSubjectsChange: (subjects: Subject[]) => void;
  onResultsChange?: (results: GPAResults | null) => void;
}

const Calculator: React.FC<CalculatorProps> = ({
  subjects,
  onSubjectsChange,
  onResultsChange,
}) => {
  const [results, setResults] = useState<GPAResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Add Subject
  const addSubject = () =>
    onSubjectsChange([
      ...subjects,
      {
        number: subjects.length + 1,
        code: "",
        semester: "",
        name: "",
        credits: "",
        grade: "",
      },
    ]);

  // Delete Subject
  const deleteSubject = (index: number) => {
    const updated = subjects.filter((_, i) => i !== index);
    onSubjectsChange(updated);
  };

  // Update Subject
  const updateSubject = (
    index: number,
    field: keyof Subject,
    value: string
  ) => {
    const updated = subjects.map((subj, i) =>
      i === index ? { ...subj, [field]: value } : subj
    );
    onSubjectsChange(updated);
  };

  // Calculate GPA with validation
  const calculateGPA = () => {
    if (!subjects || subjects.length === 0) {
      setError("No subjects found. Please add subjects before calculating.");
      return;
    }

    const gradeMap: Record<string, number> = {
      O: 10,
      "A+": 9,
      A: 8,
      "B+": 7,
      B: 6,
      "C+": 5,
      C: 4,
    };

    let totalCredits = 0;
    let totalScore = 0;

    const missingDataSubjects: number[] = [];
    const invalidCreditsSubjects: number[] = [];

    const rows: ResultRow[] = subjects.map((subj, idx) => {
      const cred = parseFloat(subj.credits);
      const gradeValue = subj.grade
        ? gradeMap[subj.grade.toUpperCase()]
        : undefined;

      // Missing fields
      if (!subj.credits || !subj.grade) {
        missingDataSubjects.push(idx + 1);
      }

      // Invalid credits
      if (isNaN(cred) || cred < 0 || cred > 6) {
        invalidCreditsSubjects.push(idx + 1);
      }

      const score = gradeValue ? cred * gradeValue : 0;
      if (gradeValue && !isNaN(cred) && cred > 0 && cred <= 6) {
        totalCredits += cred;
        totalScore += score;
      }

      return {
        index: idx + 1,
        subjectCode: subj.code || "-",
        semester: subj.semester || "-",
        name: subj.name || `Subject ${idx + 1}`,
        credits: cred || 0,
        grade: subj.grade || "-",
        score,
      };
    });

    if (missingDataSubjects.length > 0) {
      setError(
        `Missing data in subjects: ${missingDataSubjects.join(
          ", "
        )}. Both credits and grade are required.`
      );
      return;
    }

    if (invalidCreditsSubjects.length > 0) {
      setError(
        `Invalid credits in subjects: ${invalidCreditsSubjects.join(
          ", "
        )}. Credits must be between 0 and 6.`
      );
      return;
    }

    if (totalCredits === 0) {
      setError("No valid data to calculate GPA.");
      return;
    }

    // GPA calculation
    const overallGPA =
      totalCredits > 0 ? (totalScore / totalCredits).toFixed(3) : "N/A";

    const semesterMap: Record<
      string,
      { totalCredits: number; totalScore: number; rows: ResultRow[] }
    > = {};

    rows.forEach((row) => {
      if (!semesterMap[row.semester]) {
        semesterMap[row.semester] = {
          totalCredits: 0,
          totalScore: 0,
          rows: [],
        };
      }
      semesterMap[row.semester].rows.push(row);
      semesterMap[row.semester].totalCredits += row.credits;
      semesterMap[row.semester].totalScore += row.score;
    });

    const semesterResults: SemesterResult[] = Object.entries(semesterMap).map(
      ([sem, data]) => ({
        semester: sem,
        totalCredits: data.totalCredits,
        totalScore: data.totalScore,
        gpa:
          data.totalCredits > 0
            ? (data.totalScore / data.totalCredits).toFixed(3)
            : "N/A",
        rows: data.rows,
      })
    );

    const gpaResults: GPAResults = {
      rows,
      totalCredits,
      totalScore,
      gpa: overallGPA,
      semesterResults,
    };

    // Debug Logs
    console.log("Overall GPA:", overallGPA);
    console.log("Rows:", rows);
    console.log("Semester-wise GPA:", semesterResults);

    setResults(gpaResults);
    onResultsChange?.(gpaResults);
  };

  // Clear All Subjects and add 8 rows
  const handleClear = () => {
    const emptySubjects = Array.from({ length: 8 }, (_, i) => ({
      number: i + 1,
      code: "",
      semester: "",
      name: "",
      credits: "",
      grade: "",
    }));
    onSubjectsChange(emptySubjects);
    setResults(null);
    onResultsChange?.(null);
  };

  return (
    <>
      <div>
        {/* Subject rows */}
        <Card className="flex flex-col px-4 min-h-[430px] max-h-[430px] mb-2">
          <div className="flex-1 overflow-y-scroll max-h-[400px] custom-scrollbar">
            {subjects.map((subj, idx) => (
              <SubjectRow
                key={idx}
                index={idx}
                subject={subj}
                updateSubject={updateSubject}
                deleteSubject={deleteSubject}
              />
            ))}
          </div>
        </Card>

        {/* Footer actions */}
        <Card className="flex flex-row justify-between items-center p-2 ml-auto w-full">
          {/* Dropdown */}
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 sm:p-2 rounded-md hover:bg-gray-200">
                  <MoreVertical size={16} className="sm:size-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => console.log("Load Preset")}>
                  Load Preset
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Save Preset")}>
                  Save Preset
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Reset All")}>
                  Reset All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Subjects count */}
          <div className="text-xs sm:text-base shrink-0">
            Total Subjects: {subjects.length}
          </div>

          {/* Action Buttons */}
          <div
            className={`
              flex rounded-md border transition-colors duration-300
              hover:border-blue-500 dark:hover:border-yellow-500
              relative
            `}
          >
            {/* Add Subject */}
            <Button
              variant="ghost"
              onClick={addSubject}
              className="hover:text-green-500"
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Clear */}
            <Button
              variant="ghost"
              onClick={handleClear}
              className="hover:text-red-500"
            >
              <CircleX className="h-4 w-4" />
            </Button>

            {/* Calculate */}
            <Button
              variant="ghost"
              onClick={calculateGPA}
              className="flex gap-1 hover:text-blue-500 dark:hover:text-yellow-500"
            >
              <SquareEqual className="h-4 w-4" />
              <span className="hidden sm:inline">Calculate</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Error AlertDialog */}
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
