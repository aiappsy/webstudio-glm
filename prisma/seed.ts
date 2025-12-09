import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')
  
  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@aiappsy.com' },
    update: {},
    create: {
      email: 'demo@aiappsy.com',
      name: 'Demo User',
    },
  })

  // Create a demo workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      ownerId: user.id,
    },
  })

  // Create a demo project
  const project = await prisma.project.create({
    data: {
      name: 'Demo Project',
      slug: 'demo-project',
      workspaceId: workspace.id,
    },
  })

  // Create some demo files
  await prisma.file.createMany({
    data: [
      {
        name: 'index.html',
        path: '/index.html',
        type: 'file',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo Project</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto p-8">
        <h1 class="text-3xl font-bold text-center mb-8">Welcome to AiAppsy Web Studio</h1>
        <p class="text-center text-gray-600">Your complete web development environment</p>
    </div>
</body>
</html>`,
        projectId: project.id,
      },
      {
        name: 'styles.css',
        path: '/styles.css',
        type: 'file',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
    @apply bg-gray-100 min-h-screen;
}

.container {
    @apply mx-auto p-8;
}

h1 {
    @apply text-3xl font-bold text-center mb-8;
}

p {
    @apply text-center text-gray-600;
}`,
        projectId: project.id,
      },
      {
        name: 'script.js',
        path: '/script.js',
        type: 'file',
        content: `console.log('Welcome to AiAppsy Web Studio!');

// Add some interactivity
document.addEventListener('DOMContentLoaded', function() {
    const heading = document.querySelector('h1');
    if (heading) {
        heading.addEventListener('click', function() {
            heading.textContent = '🚀 AiAppsy Web Studio Rocks!';
        });
    }
});`,
        projectId: project.id,
      },
    ],
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })