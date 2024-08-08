-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "signInEmailAddress" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "pseudoname" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Destination_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Moment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activity" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "isIndispensable" BOOLEAN NOT NULL DEFAULT false,
    "context" TEXT NOT NULL,
    "dateAndTime" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "destinationId" TEXT NOT NULL,
    CONSTRAINT "Moment_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Step" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "momentId" TEXT NOT NULL,
    CONSTRAINT "Step_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES "Moment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_signInEmailAddress_key" ON "User"("signInEmailAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Destination_name_userId_key" ON "Destination"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Moment_objective_destinationId_key" ON "Moment"("objective", "destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "Step_title_momentId_key" ON "Step"("title", "momentId");
