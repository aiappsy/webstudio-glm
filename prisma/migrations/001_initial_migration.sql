-- Create initial migration for User table
CREATE TABLE "User" (
  id TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  openRouterApiKey TEXT,
  sessions Session[]
  workspaces Workspace[]
);

-- Create initial migration for Session table
CREATE TABLE "Session" (
  id TEXT NOT NULL,
  userId TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expiresAt TIMESTAMP(3) NOT NULL,
  createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user User @relation(fields: [userId], references: [id], onDelete: CASCADE) NOT NULL,
);

-- Create initial migration for Workspace table
CREATE TABLE "Workspace" (
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  ownerId TEXT NOT NULL,
  createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  settings JSONB,
  projects Project[],
  owner User @relation(fields: [ownerId], references: [id], onDelete: CASCADE) NOT NULL,
);

-- Create initial migration for Project table
CREATE TABLE "Project" (
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  settings JSONB,
  slug TEXT NOT NULL,
  workspaceId TEXT NOT NULL,
  deployments Deployment[],
  files File[],
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: CASCADE) NOT NULL,
);

-- Create initial migration for File table
CREATE TABLE "File" (
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  content TEXT DEFAULT '',
  type TEXT NOT NULL,
  projectId TEXT NOT NULL,
  parentId TEXT,
  createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  parent File @relation("FileHierarchy", fields: [parentId], references: [id]),
  children File[] @relation("FileHierarchy", fields: [parentId]),
  project Project @relation(fields: [projectId], references: [id], onDelete: CASCADE) NOT NULL,
);

-- Create initial migration for Deployment table
CREATE TABLE "Deployment" (
  id TEXT NOT NULL,
  projectId TEXT NOT NULL,
  url TEXT,
  status TEXT DEFAULT 'pending',
  logs TEXT,
  createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  project Project @relation(fields: [projectId], references: [id], onDelete: CASCADE) NOT NULL,
);

-- Add indexes for better performance
CREATE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "Session_userId" ON "Session"("userId");
CREATE INDEX "Session_token" ON "Session"("token");
CREATE INDEX "Workspace_ownerId" ON "Workspace"("ownerId");
CREATE INDEX "Project_workspaceId" ON "Project"("workspaceId");
CREATE INDEX "File_projectId" ON "File"("projectId");
CREATE INDEX "File_parentId" ON "File"("parentId");
CREATE INDEX "Deployment_projectId" ON "Deployment"("projectId");