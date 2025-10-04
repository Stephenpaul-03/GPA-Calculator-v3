// src/components/Dashboard.tsx
import { useEffect, useRef, useState } from "react";
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Calculator from "@/components/Calculator";
import Result from "@/components/Result";
import type { GPAResults } from "@/components/Calculator_Logic";
import { Mail, Github, Linkedin, BookMarked } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "./theme_toggle/mode-toggle";
import { ThemeProvider } from "./theme_toggle/theme-provider";
import Presets from "@/components/Preset_Logic";

import { type Subject } from "@/components/SubjectRow";

const Dashboard = () => {
  const [subjects, setSubjects] = useState<Subject[]>(
    Array(3).fill({ name: "", credits: "", grade: "" })
  );
  const [results, setResults] = useState<GPAResults | null>(null);
  const [semesters, setSemesters] = useState<string[]>([]);

  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (results && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results]);

  const toggleSemester = (sem: string) => {
    if (semesters.includes(sem)) {
      setSemesters(semesters.filter((s) => s !== sem));
    } else {
      setSemesters([...semesters, sem]);
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen flex flex-col">
        {/* Top Navigation */}
        <div className="flex">
          <Menubar className="w-fit m-2 mr-auto border transition-colors duration-300 hover:border-blue-500 dark:hover:border-yellow-500">
            <MenubarMenu>
              <MenubarTrigger className="w-fit gap-2 hover:text-blue-500 dark:hover:text-yellow-500 data-[state=open]:text-blue-500 data-[state=open]:dark:text-yellow-500 data-[state=open]:bg-transparent data-[state=open]:border-blue-500 data-[state=open]:dark:border-yellow-500 ">
                <BookMarked className="w-4 h-4" />
                Semester
              </MenubarTrigger>
              <MenubarContent align="start" className="w-fit !min-w-0 p-2 hover:border-blue-500 dark:hover:border-yellow-500">
                {[
                  "Semester 1",
                  "Semester 2",
                  "Semester 3",
                  "Semester 4",
                  "Semester 5",
                  "Semester 6",
                  "Semester 7",
                  "Semester 8",
                ].map((sem) => (
                  <div
                    key={sem}
                    className="flex items-center gap-2 p-2 w-fit rounded-md cursor-pointer hover:text-blue-500 dark:hover:text-yellow-500"
                  >
                    <Checkbox
                      id={sem}
                      checked={semesters.includes(sem)}
                      onCheckedChange={() => toggleSemester(sem)}
                      className="
                        data-[state=checked]:bg-blue-500
                        data-[state=checked]:border-blue-500
                        dark:data-[state=checked]:bg-yellow-500
                        dark:data-[state=checked]:border-yellow-500
                        text-white
                      "
                    />
                    <Label htmlFor={sem} className="cursor-pointer">
                      {sem}
                    </Label>
                  </div>
                ))}
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          <Menubar className="w-fit m-2 ml-auto flex items-center gap-1">
            <Button
              variant="link"
              size="icon"
              onClick={() => window.open("mailto:yourmail@gmail.com", "_blank")}
              className="hover:text-red-500"
            >
              <Mail className="h-4 w-4" />
            </Button>

            <Button
              variant="link"
              size="icon"
              onClick={() =>
                window.open("https://github.com/yourusername", "_blank")
              }
              className="hover:text-gray-500"
            >
              <Github className="h-4 w-4" />
            </Button>

            <Button
              variant="link"
              size="icon"
              onClick={() =>
                window.open("https://linkedin.com/in/yourusername", "_blank")
              }
              className="hover:text-blue-500"
            >
              <Linkedin className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="bg-blue-500 dark:bg-yellow-500 h-6" />

            <MenubarMenu>
              <ModeToggle />
            </MenubarMenu>
          </Menubar>
        </div>

        {/* Calculator Section */}
        <div className="flex flex-1 flex-col justify-center items-center py-8">
          <div className="w-full max-w-4xl">
            <Calculator
              subjects={subjects}
              onSubjectsChange={setSubjects}
              onResultsChange={setResults}
              uploadButton={<Presets onSubjectsParsed={setSubjects} />}
            />
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="min-h-screen flex flex-col">
            <div
              ref={resultRef}
              className="flex flex-1 flex-col justify-center items-center py-8"
            >
              <div className="w-full max-w-6xl sm:max-w-4xl">
                <Result results={results} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default Dashboard;
