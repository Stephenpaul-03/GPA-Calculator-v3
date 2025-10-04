"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ResultRow {
  index: number;
  semester?: string;
  name: string;
  subjectCode?: string;
  credits: number;
  grade: string;
  score: number;
}

interface SemesterResult {
  semester: string;
  rows: ResultRow[];
  gpa: string;
  totalCredits: number;
  totalScore: number;
}

interface GPAResults {
  rows: ResultRow[];
  gpa: string;
  semesterResults: SemesterResult[];
}

interface ResultPageProps {
  results: GPAResults;
}

const ResultPage: React.FC<ResultPageProps> = ({ results }) => {
  const [activeTab, setActiveTab] = useState("all");

  const semesterTabs = [
    "all",
    ...results.semesterResults.map((s) => s.semester),
  ];

  const getRowsForTab = (tab: string): ResultRow[] => {
    if (tab === "all") return results.rows;
    const sem = results.semesterResults.find((s) => s.semester === tab);
    return sem?.rows || [];
  };

  const getSemesterGPA = (tab: string) => {
    if (tab === "all") return results.gpa;
    const sem = results.semesterResults.find((s) => s.semester === tab);
    return sem?.gpa || "-";
  };

  const getCGPATill = (tab: string) => {
    if (tab === "all") return results.gpa;
    const semIndex = results.semesterResults.findIndex(
      (s) => s.semester === tab
    );
    if (semIndex === -1) return "-";
    const semTill = results.semesterResults.slice(0, semIndex + 1);
    const totalCredits = semTill.reduce((acc, s) => acc + s.totalCredits, 0);
    const totalScore = semTill.reduce((acc, s) => acc + s.totalScore, 0);
    return totalCredits > 0 ? (totalScore / totalCredits).toFixed(3) : "-";
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Semester-wise table */}
      <Card>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              {semesterTabs.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {tab === "all" ? "All Semesters" : tab}
                </TabsTrigger>
              ))}
            </TabsList>

            {semesterTabs.map((tab) => (
              <TabsContent key={tab} value={tab}>
                <div className="overflow-auto max-h-[350px] rounded-md border mb-2">
                  <Table className="table-fixed w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead className="w-16">Semester</TableHead>
                        <TableHead className="w-24">Code</TableHead>
                        <TableHead className="w-48">Name</TableHead>
                        <TableHead className="w-16">Credits</TableHead>
                        <TableHead className="w-16">Grade</TableHead>
                        <TableHead className="w-20">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getRowsForTab(tab).map((row) => (
                        <TableRow key={row.index}>
                          <TableCell className="truncate">
                            {row.index}
                          </TableCell>
                          <TableCell className="truncate">
                            {row.semester || "-"}
                          </TableCell>
                          <TableCell className="truncate">
                            {row.subjectCode || "-"}
                          </TableCell>
                          <TableCell className="truncate">{row.name}</TableCell>
                          <TableCell className="truncate">
                            {row.credits}
                          </TableCell>
                          <TableCell className="truncate">
                            {row.grade}
                          </TableCell>
                          <TableCell className="truncate">
                            {row.score.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end gap-6 mt-2 font-semibold">
                  <div>Semester GPA: {getSemesterGPA(tab)}</div>
                  <div>Cumulative GPA: {getCGPATill(tab)}</div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultPage;
