"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { type Subject } from "@/components/SubjectRow";

interface PresetsProps {
  onSubjectsParsed: (subjects: Subject[]) => void;
}

const Presets: React.FC<PresetsProps> = ({ onSubjectsParsed }) => {
  const [open, setOpen] = useState(false);
  const [parsedSubjects, setParsedSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        // map excel rows -> Subject[]
        const subjects: Subject[] = jsonData
          .map((row, idx) => {
            const credits = row["credits"]?.toString().trim();
            if (!credits) {
              console.warn(`Row ${idx + 2}: Missing credits, skipping`);
              return null; // skip this row
            }

            return {
              number: idx + 1,
              semester: row["semester"]?.toString() || "",
              code: row["subjectcode"]?.toString() || "",
              name: row["subjectname"]?.toString() || "",
              credits, // required
              grade: row["grade"]?.toString() || "", // optional
            };
          })
          .filter((s): s is Subject => s !== null);

        if (subjects.length === 0) {
          setError("No valid data found (credits are required).");
          return;
        }

        setParsedSubjects(subjects);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to parse Excel file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirm = () => {
    if (parsedSubjects.length > 0) {
      onSubjectsParsed(parsedSubjects);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Excel</DialogTitle>
          <DialogDescription>
            Select an Excel file with columns: <br />
            <code>semester | subjectcode | subjectname | credits | grade</code>
            <br />
            <span className="text-red-500">* credits are required, grade is optional</span>
          </DialogDescription>
        </DialogHeader>

        <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {parsedSubjects.length > 0 && (
          <div className="mt-4 max-h-48 overflow-y-auto border rounded p-2 text-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b p-1">#</th>
                  <th className="border-b p-1">Semester</th>
                  <th className="border-b p-1">Code</th>
                  <th className="border-b p-1">Name</th>
                  <th className="border-b p-1">Credits</th>
                  <th className="border-b p-1">Grade</th>
                </tr>
              </thead>
              <tbody>
                {parsedSubjects.map((s) => (
                  <tr key={s.number}>
                    <td className="border-b p-1">{s.number}</td>
                    <td className="border-b p-1">{s.semester}</td>
                    <td className="border-b p-1">{s.code}</td>
                    <td className="border-b p-1">{s.name}</td>
                    <td className="border-b p-1">{s.credits}</td>
                    <td className="border-b p-1">{s.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleConfirm} disabled={parsedSubjects.length === 0}>
            Add to Calculator
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Presets;
