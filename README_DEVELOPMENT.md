# 🚀 AiAppsy Web Studio - Development Guide

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd aiappsy-web-studio

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up the database
npm run db:push

# Start development server
npm run dev
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm 8+
- PostgreSQL database (or use Neon)

### Environment Variables
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
OPENROUTER_API_KEY="your-openrouter-api-key"
```

### Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# View database in Prisma Studio
npm run db:studio
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css         # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/              # React components
│   ├── ui/               # shadcn/ui components
│   ├── AIAssistant.tsx   # AI assistant
│   ├── MonacoEditor.tsx   # Code editor
│   └── XtermTerminal.tsx  # Terminal
├── lib/                    # Utilities
│   ├── auth.ts           # Authentication
│   ├── db.ts             # Database
│   └── utils.ts          # Helper functions
├── hooks/                  # React hooks
└── types/                  # TypeScript types
```

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:push          # Push schema changes
npm run db:studio        # Open Prisma Studio
npm run db:generate       # Generate Prisma client
npm run db:seed           # Seed database with sample data

# Code Quality
npm run lint              # Run ESLint
npm run type-check        # Run TypeScript check
npm run format            # Format code with Prettier
npm run format:check      # Check code formatting

# Testing
npm run test              # Run tests
npm run test:watch        # Run tests in watch mode
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test --coverage
```

### Writing Tests
```typescript
// Example test
import { render, screen } from '@testing-library/react'
import { expect, test } from '@jest/globals'

test('renders learn react link', () => {
  render(<App />)
  expect(screen.getByText('Learn React')).toBeInTheDocument()
})
```

## 🚀 Deployment

### Environment Setup
1. Set production environment variables
2. Build the application
3. Deploy to your preferred platform

### Coolify Deployment
```bash
# Deploy to Coolify
./coolify-deploy.sh
```

### Docker Deployment
```bash
# Build Docker image
docker build -t aiappsy-web-studio .

# Run container
docker run -p 3000:3000 aiappsy-web-studio
```

## 🔧 Configuration

### Next.js Configuration
See `next.config.ts` for Next.js configuration options.

### Tailwind CSS Configuration
See `tailwind.config.ts` for styling configuration.

### TypeScript Configuration
See `tsconfig.json` for TypeScript compiler options.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check your DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Verify network connectivity

2. **Build Errors**
   - Run `npm run type-check` to check TypeScript errors
   - Run `npm run lint` to check for linting issues

3. **Authentication Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your environment

### Getting Help

- Check the [GitHub Issues](https://github.com/your-repo/issues)
- Review the [Documentation](#-documentation)
- Join our [Discord Community](https://discord.gg/your-server)