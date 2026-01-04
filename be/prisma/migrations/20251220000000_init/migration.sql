-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('Low', 'Normal', 'High');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OpenCall', 'InProgress', 'Closed');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('CRP', 'EducationMigration', 'SkillAssessment');

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "priority" "TicketPriority" NOT NULL,
    "status" "TicketStatus" NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticketId" TEXT NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
