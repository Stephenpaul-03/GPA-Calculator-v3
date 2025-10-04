import { type Subject } from "@/components/SubjectRow";

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
  gpa: string; // cumulative GPA (CGPA)
  semesterResults: SemesterResult[];
  gradeDistribution: Record<string, number>;
  maxSemesterGPA?: { semester: string; gpa: string };
  minSemesterGPA?: { semester: string; gpa: string };
  cgpaTrend: { semester: string; cgpa: string }[];
}

export interface GPAWarning {
  subjectIndex: number;
  message: string;
}

export interface GPAError {
  message: string;
  warnings?: GPAWarning[];
}

export const calculateGPA = (subjects: Subject[]): { results?: GPAResults; error?: GPAError } => {
  if (!subjects || subjects.length === 0) {
    return { error: { message: "No subjects found. Please add subjects before calculating." } };
  }

  const gradeMap: Record<string, number> = {
    O: 10, "A+": 9, A: 8, "B+": 7, B: 6, "C+": 5, C: 4
  };

  let totalCredits = 0;
  let totalScore = 0;
  const missingDataSubjects: number[] = [];
  const invalidCreditsSubjects: number[] = [];

  const rows: ResultRow[] = subjects.map((subj, idx) => {
    const cred = parseFloat(subj.credits);
    const gradeValue = subj.grade ? gradeMap[subj.grade.toUpperCase()] : undefined;

    if (!subj.credits || !subj.grade) missingDataSubjects.push(idx + 1);
    if (isNaN(cred) || cred < 0 || cred > 6) invalidCreditsSubjects.push(idx + 1);

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
    return { error: { message: "Missing data in subjects", warnings: missingDataSubjects.map(i => ({ subjectIndex: i, message: "Missing credits or grade" })) } };
  }
  if (invalidCreditsSubjects.length > 0) {
    return { error: { message: "Invalid credits", warnings: invalidCreditsSubjects.map(i => ({ subjectIndex: i, message: "Credits must be between 0 and 6" })) } };
  }
  if (totalCredits === 0) {
    return { error: { message: "No valid data to calculate GPA." } };
  }

  // --- Semester-wise calculation ---
  const semesterMap: Record<string, { totalCredits: number; totalScore: number; rows: ResultRow[] }> = {};
  rows.forEach(row => {
    if (!semesterMap[row.semester]) semesterMap[row.semester] = { totalCredits: 0, totalScore: 0, rows: [] };
    semesterMap[row.semester].rows.push(row);
    semesterMap[row.semester].totalCredits += row.credits;
    semesterMap[row.semester].totalScore += row.score;
  });

  const semesterResults: SemesterResult[] = Object.entries(semesterMap).map(([sem, data]) => ({
    semester: sem,
    totalCredits: data.totalCredits,
    totalScore: data.totalScore,
    gpa: (data.totalScore / data.totalCredits).toFixed(3),
    rows: data.rows
  }));

  // --- Cumulative GPA trend ---
  const semestersSorted = Object.keys(semesterMap).sort();
  const cgpaTrend: { semester: string; cgpa: string }[] = [];
  let runningCredits = 0;
  let runningScore = 0;
  semestersSorted.forEach(sem => {
    runningCredits += semesterMap[sem].totalCredits;
    runningScore += semesterMap[sem].totalScore;
    cgpaTrend.push({ semester: sem, cgpa: (runningScore / runningCredits).toFixed(3) });
  });

  // --- Grade distribution ---
  const gradeDistribution: Record<string, number> = {};
  rows.forEach(r => {
    gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1;
  });

  // --- Max / Min Semester GPA ---
  const sortedSemesterGPA = semesterResults.slice().sort((a, b) => parseFloat(b.gpa) - parseFloat(a.gpa));
  const maxSemesterGPA = { semester: sortedSemesterGPA[0].semester, gpa: sortedSemesterGPA[0].gpa };
  const minSemesterGPA = { semester: sortedSemesterGPA[sortedSemesterGPA.length - 1].semester, gpa: sortedSemesterGPA[sortedSemesterGPA.length - 1].gpa };

  const overallGPA = (totalScore / totalCredits).toFixed(3);

  return {
    results: {
      rows,
      totalCredits,
      totalScore,
      gpa: overallGPA,
      semesterResults,
      gradeDistribution,
      maxSemesterGPA,
      minSemesterGPA,
      cgpaTrend
    }
  };
};
