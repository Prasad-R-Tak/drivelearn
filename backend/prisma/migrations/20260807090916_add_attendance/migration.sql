-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Enrollment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentName" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "schoolId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "userId" INTEGER,
    "slotId" INTEGER,
    "instructorId" INTEGER,
    CONSTRAINT "Enrollment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "LessonSlot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Enrollment" ("courseId", "id", "instructorId", "progress", "schoolId", "slotId", "status", "studentName", "userId") SELECT "courseId", "id", "instructorId", "progress", "schoolId", "slotId", "status", "studentName", "userId" FROM "Enrollment";
DROP TABLE "Enrollment";
ALTER TABLE "new_Enrollment" RENAME TO "Enrollment";
CREATE UNIQUE INDEX "Enrollment_slotId_key" ON "Enrollment"("slotId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
