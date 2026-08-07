/*
  Warnings:

  - You are about to drop the `LessonSlot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `attended` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `slotId` on the `Enrollment` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LessonSlot";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Batch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startDate" DATETIME NOT NULL,
    "totalLessons" INTEGER NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "courseId" INTEGER NOT NULL,
    "instructorId" INTEGER NOT NULL,
    CONSTRAINT "Batch_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Batch_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LessonDay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "batchId" INTEGER NOT NULL,
    CONSTRAINT "LessonDay_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Enrollment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentName" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "schoolId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "userId" INTEGER,
    "batchId" INTEGER,
    "instructorId" INTEGER,
    CONSTRAINT "Enrollment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Enrollment" ("courseId", "id", "instructorId", "progress", "schoolId", "status", "studentName", "userId") SELECT "courseId", "id", "instructorId", "progress", "schoolId", "status", "studentName", "userId" FROM "Enrollment";
DROP TABLE "Enrollment";
ALTER TABLE "new_Enrollment" RENAME TO "Enrollment";
CREATE UNIQUE INDEX "Enrollment_batchId_key" ON "Enrollment"("batchId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
