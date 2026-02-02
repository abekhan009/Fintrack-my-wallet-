# Contributing to FinTrack

Thank you for your interest in contributing to FinTrack! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup Development Environment

1. **Fork the repository**
   ```bash
   git clone https://github.com/abekhan009/Fintrack-my-wallet-.git
   cd Fintrack-my-wallet-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style
- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Maintain consistent indentation (2 spaces)
- Use meaningful variable and function names

### Component Structure
```jsx
// Component imports
import { useState, useEffect } from 'react';
import './Component.css';

// Component definition
function Component({ prop1, prop2 }) {
    // State and hooks
    const [state, setState] = useState(null);
    
    // Effects
    useEffect(() => {
        // Effect logic
    }, []);
    
    // Event handlers
    const handleClick = () => {
        // Handler logic
    };
    
    // Render
    return (
        <div className="component">
            {/* JSX content */}
        </div>
    );
}

export default Component;
```

### CSS Guidelines
- Use CSS custom properties (variables)
- Follow BEM naming convention
- Mobile-first responsive design
- Use the existing design system colors and spacing

### File Naming
- Components: `PascalCase` (e.g., `UserProfile.jsx`)
- Files/Folders: `camelCase` (e.g., `userService.js`)
- CSS files: Match component name (e.g., `UserProfile.css`)

## 🔧 Development Workflow

### Branch Naming
- Feature: `feature/description-of-feature`
- Bug fix: `fix/description-of-bug`
- Hotfix: `hotfix/description-of-hotfix`

### Commit Messages
Follow conventional commits format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add password reset functionality
fix(transactions): resolve duplicate transaction bug
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow the style guidelines
   - Test your changes thoroughly

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description of changes"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Use a clear, descriptive title
   - Provide detailed description of changes
   - Reference any related issues
   - Add screenshots for UI changes

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

## 🧪 Testing

### Running Tests
```bash
npm run test
```

### Writing Tests
- Write unit tests for utility functions
- Test component behavior, not implementation
- Use descriptive test names
- Mock external dependencies

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex logic with inline comments
- Keep README.md updated with new features

### Component Documentation
```jsx
/**
 * UserProfile component displays user information and settings
 * @param {Object} user - User object containing profile data
 * @param {Function} onUpdate - Callback function when profile is updated
 * @param {boolean} isEditable - Whether the profile can be edited
 */
function UserProfile({ user, onUpdate, isEditable = false }) {
    // Component implementation
}
```

## 🐛 Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots or error messages
- Code snippets (if applicable)

## 💡 Feature Requests

For feature requests, please provide:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach
- Mockups or examples (if applicable)

## 🎨 Design Guidelines

### Colors
Use CSS custom properties from `src/styles/variables.css`:
- `--color-primary`: Main brand color
- `--color-secondary`: Secondary brand color
- `--color-success`: Success states
- `--color-warning`: Warning states
- `--color-danger`: Error states

### Spacing
Use consistent spacing variables:
- `--space-xs`: 4px
- `--space-sm`: 8px
- `--space-md`: 16px
- `--space-lg`: 24px
- `--space-xl`: 32px

### Typography
- Use Inter font family
- Follow the established font size scale
- Maintain proper line heights

## 📞 Getting Help

- Check existing issues and discussions
- Join our community discussions
- Ask questions in pull request comments
- Contact maintainers for complex issues

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special mentions for outstanding contributions

Thank you for contributing to FinTrack! 🎉