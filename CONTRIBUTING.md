# 🤝 Contributing to AiAppsy Web Studio

Thank you for your interest in contributing to AiAppsy Web Studio! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Create a Pull Request**

## 📋 Development Setup

### Prerequisites
- Node.js 18+
- npm 8+
- PostgreSQL database

### Setup Steps
```bash
# Clone your fork
git clone https://github.com/your-username/aiappsy-web-studio.git
cd aiappsy-web-studio

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run db:push

# Start development server
npm run dev
```

## 🧪 Code Style

### Formatting
We use Prettier for code formatting. Run:
```bash
npm run format
```

### Linting
We use ESLint for code linting. Run:
```bash
npm run lint
```

### TypeScript
All code must be written in TypeScript. Run type checking:
```bash
npm run type-check
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
- Write tests for new features
- Use React Testing Library for component tests
- Use Jest for unit tests
- Aim for high code coverage

## 📁 Project Structure

Please follow the existing project structure:
```
src/
├── app/                    # Next.js App Router
├── components/              # React components
│   ├── ui/               # shadcn/ui components
│   └── [component-name].tsx
├── lib/                    # Utilities and configurations
├── hooks/                  # React hooks
└── types/                  # TypeScript types
```

## 🔄 Pull Request Process

### Before Submitting
1. **Run all tests**: Ensure everything passes
2. **Update documentation**: If needed
3. **Follow code style**: Use the existing formatting
4. **Small commits**: Make focused, atomic commits
5. **Clear descriptions**: Explain what and why

### Pull Request Template
```markdown
## Description
Brief description of the change

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## 🐛 Bug Reports

### Reporting Bugs
1. **Use the issue template**: Provide all required information
2. **Include reproduction steps**: Clear steps to reproduce
3. **Add environment details**: OS, browser, Node.js version
4. **Include error logs**: Full error messages and stack traces

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to...
2. Click on...
3. Scroll to...
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Node.js version: [e.g., 18.17.0]
- App version: [e.g., 1.0.0]

## Additional Context
Any other relevant information

## Error Messages
Full error messages and stack traces
```

## 💡 Feature Requests

### Requesting Features
1. **Check existing issues**: Avoid duplicates
2. **Use the feature request template**
3. **Provide use cases**: Explain why it's needed
4. **Consider implementation**: Suggest possible approaches

### Feature Request Template
```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this work?

## Use Cases
Specific scenarios where this would be useful

## Alternatives Considered
Other approaches you've considered

## Additional Context
Any other relevant information
```

## 📖 Documentation

### Improving Documentation
- Fix typos and grammatical errors
- Add missing information
- Improve examples and code snippets
- Update outdated information

### Documentation Structure
- `README_DEVELOPMENT.md`: Development guide
- `CHANGELOG.md`: Version history
- `CONTRIBUTING.md`: This file
- API documentation in code comments

## 🏷️ Coding Standards

### General Guidelines
- Use TypeScript for all new code
- Follow existing naming conventions
- Write meaningful commit messages
- Keep functions small and focused
- Add JSDoc comments for public APIs
- Handle errors gracefully

### React Component Guidelines
- Use functional components with hooks
- Follow React best practices
- Use proper TypeScript types
- Include accessibility features
- Test components thoroughly

### API Guidelines
- Use proper HTTP status codes
- Include error handling
- Validate input data
- Use consistent response formats
- Document API endpoints

## 🚀 Release Process

### Version Management
- Follow semantic versioning (SemVer)
- Update CHANGELOG.md
- Tag releases properly
- Create GitHub releases

### Deployment
- Test thoroughly before deployment
- Update environment variables
- Verify database migrations
- Monitor for issues post-deployment

## 🤝 Community

### Getting Help
- GitHub Issues: For bug reports and feature requests
- Discussions: For questions and ideas
- Documentation: For development guidance

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Follow the project's communication guidelines

## 📞 Contact

- Maintainers: [Maintainer Name](mailto:maintainer@example.com)
- Project Repository: [GitHub Repository](https://github.com/your-repo)
- Documentation: [Development Guide](README_DEVELOPMENT.md)

---

Thank you for contributing to AiAppsy Web Studio! 🎉