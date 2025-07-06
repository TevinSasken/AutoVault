# Contributing to AutoVault

Thank you for your interest in contributing to AutoVault! This document provides guidelines and information for contributors to help maintain code quality and project consistency.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [Contribution Guidelines](#contribution-guidelines)
4. [Code Standards](#code-standards)
5. [Testing Requirements](#testing-requirements)
6. [Pull Request Process](#pull-request-process)
7. [Issue Reporting](#issue-reporting)
8. [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites
- Node.js 18.0 or higher
- Git 2.30 or higher
- Basic understanding of DeFi concepts
- Familiarity with JavaScript/TypeScript
- Knowledge of smart contract development (for contract contributions)

### First-Time Contributors
1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/autovault-prototype.git
   cd autovault-prototype
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Explore the Codebase**
   - Review the project structure
   - Read existing documentation
   - Run the demo functions in the console

## Development Setup

### Environment Configuration
Create a `.env.local` file for development:
```bash
# Development Environment
NODE_ENV=development
MASSA_NETWORK=testnet
MASSA_RPC_URL=https://testnet.massa.net/api/v2

# API Configuration
API_BASE_URL=http://localhost:3001
WEBSOCKET_URL=ws://localhost:3001/ws

# Feature Flags
ENABLE_DEBUG_MODE=true
ENABLE_MOCK_DATA=true
```

### Development Tools
```bash
# Install development tools
npm install -g eslint prettier husky lint-staged

# Set up pre-commit hooks
npx husky install
npx husky add .husky/pre-commit "lint-staged"
```

### IDE Configuration
Recommended VS Code extensions:
- ESLint
- Prettier
- GitLens
- JavaScript (ES6) code snippets
- Auto Rename Tag

## Contribution Guidelines

### Types of Contributions
We welcome various types of contributions:

1. **Bug Fixes**
   - Fix existing issues
   - Improve error handling
   - Performance optimizations

2. **Feature Development**
   - New DeFi strategies
   - UI/UX improvements
   - Analytics enhancements

3. **Documentation**
   - Code documentation
   - User guides
   - API documentation

4. **Testing**
   - Unit tests
   - Integration tests
   - Security testing

### Contribution Workflow
1. **Check Existing Issues**
   - Look for existing issues or feature requests
   - Comment on issues you'd like to work on
   - Ask questions if requirements are unclear

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number-description
   ```

3. **Make Changes**
   - Follow coding standards
   - Write tests for new functionality
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new yield strategy for MASSA-ETH pair"
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Standards

### JavaScript/TypeScript Style Guide
We follow the Airbnb JavaScript Style Guide with some modifications:

```javascript
// Use const for immutable values
const API_BASE_URL = 'https://api.autovault.massa.net';

// Use let for mutable values
let portfolioValue = 0;

// Use descriptive function names
function calculateOptimalAllocation(riskProfile, marketData) {
  // Implementation
}

// Use async/await for promises
async function fetchPortfolioData(address) {
  try {
    const response = await fetch(`/api/portfolio/${address}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch portfolio data:', error);
    throw error;
  }
}

// Use JSDoc for function documentation
/**
 * Calculate the optimal asset allocation based on risk profile
 * @param {string} riskProfile - User's risk preference (conservative, balanced, aggressive)
 * @param {Object} marketData - Current market conditions
 * @param {number} marketData.volatility - Market volatility index
 * @param {Array} marketData.strategies - Available strategies
 * @returns {Object} Optimal allocation percentages
 */
function calculateOptimalAllocation(riskProfile, marketData) {
  // Implementation
}
```

### CSS/SCSS Guidelines
```css
/* Use BEM methodology for class naming */
.portfolio-card {
  /* Block */
}

.portfolio-card__header {
  /* Element */
}

.portfolio-card--highlighted {
  /* Modifier */
}

/* Use CSS custom properties for theming */
:root {
  --primary-color: #6366f1;
  --secondary-color: #10b981;
  --text-primary: #0f172a;
}

/* Use consistent spacing units */
.component {
  padding: var(--space-4); /* 1rem */
  margin-bottom: var(--space-6); /* 1.5rem */
}

/* Mobile-first responsive design */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }
}
```

### File Organization
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components
│   ├── dashboard/       # Dashboard-specific components
│   └── governance/      # Governance-specific components
├── services/            # API and business logic
│   ├── api/            # API communication
│   ├── contracts/      # Smart contract interactions
│   └── utils/          # Utility functions
├── styles/             # CSS/SCSS files
│   ├── base/           # Base styles and resets
│   ├── components/     # Component-specific styles
│   └── utilities/      # Utility classes
├── assets/             # Static assets
│   ├── images/         # Image files
│   └── icons/          # Icon files
└── tests/              # Test files
    ├── unit/           # Unit tests
    ├── integration/    # Integration tests
    └── e2e/            # End-to-end tests
```

### Naming Conventions
- **Files**: Use kebab-case (`portfolio-manager.js`)
- **Functions**: Use camelCase (`calculateReturns`)
- **Classes**: Use PascalCase (`PortfolioManager`)
- **Constants**: Use SCREAMING_SNAKE_CASE (`MAX_DEPOSIT_AMOUNT`)
- **CSS Classes**: Use kebab-case (`portfolio-card`)

## Testing Requirements

### Unit Testing
```javascript
// Example unit test
import { calculateOptimalAllocation } from '../services/portfolio-manager';

describe('Portfolio Manager', () => {
  describe('calculateOptimalAllocation', () => {
    test('should return conservative allocation for conservative profile', () => {
      const riskProfile = 'conservative';
      const marketData = {
        volatility: 0.15,
        strategies: [
          { id: 'staking', apy: 8.2, risk: 2 },
          { id: 'lending', apy: 12.5, risk: 4 }
        ]
      };

      const allocation = calculateOptimalAllocation(riskProfile, marketData);

      expect(allocation.staking).toBeGreaterThan(0.6);
      expect(allocation.lending).toBeLessThan(0.4);
    });

    test('should handle empty strategies array', () => {
      const riskProfile = 'balanced';
      const marketData = { volatility: 0.2, strategies: [] };

      expect(() => {
        calculateOptimalAllocation(riskProfile, marketData);
      }).toThrow('No strategies available');
    });
  });
});
```

### Integration Testing
```javascript
// Example integration test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DepositForm from '../components/DepositForm';

describe('DepositForm Integration', () => {
  test('should handle deposit flow', async () => {
    const mockOnDeposit = jest.fn();
    
    render(<DepositForm onDeposit={mockOnDeposit} />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '100' }
    });
    
    fireEvent.change(screen.getByLabelText('Asset'), {
      target: { value: 'MASSA' }
    });
    
    fireEvent.click(screen.getByText('Conservative'));
    fireEvent.click(screen.getByText('Deposit & Optimize'));
    
    await waitFor(() => {
      expect(mockOnDeposit).toHaveBeenCalledWith({
        amount: 100,
        asset: 'MASSA',
        riskProfile: 'conservative'
      });
    });
  });
});
```

### Test Coverage Requirements
- Minimum 80% code coverage for new features
- 100% coverage for critical functions (deposit, withdraw, calculations)
- All edge cases must be tested
- Error handling must be tested

## Pull Request Process

### PR Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if UI changes)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] No console.log statements in production code

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Closes #[issue number]
```

### Review Process
1. **Automated Checks**
   - All tests must pass
   - Linting must pass
   - Build must succeed
   - Security scan must pass

2. **Code Review**
   - At least one maintainer approval required
   - Address all review comments
   - Ensure code quality standards

3. **Final Checks**
   - Rebase on latest main branch
   - Squash commits if necessary
   - Update documentation

### Merge Requirements
- All CI checks passing
- At least one approved review
- No merge conflicts
- Up-to-date with main branch

## Issue Reporting

### Bug Reports
Use the bug report template:
```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

**Additional Context**
Any other context about the problem.
```

### Feature Requests
Use the feature request template:
```markdown
**Feature Description**
A clear description of the feature.

**Problem Statement**
What problem does this feature solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Any other context or screenshots.
```

### Security Issues
For security vulnerabilities:
1. **DO NOT** create a public issue
2. Email security@autovault.massa.net
3. Include detailed description
4. Provide proof of concept if possible
5. Allow time for fix before disclosure

## Community Guidelines

### Code of Conduct
We are committed to providing a welcoming and inclusive environment:

1. **Be Respectful**
   - Use welcoming and inclusive language
   - Respect differing viewpoints
   - Accept constructive criticism gracefully

2. **Be Collaborative**
   - Help others learn and grow
   - Share knowledge and resources
   - Work together towards common goals

3. **Be Professional**
   - Focus on technical merit
   - Avoid personal attacks
   - Maintain professional communication

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Discord**: Real-time community chat
- **Email**: security@autovault.massa.net for security issues

### Recognition
Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Annual contributor appreciation posts

### Getting Help
If you need help:
1. Check existing documentation
2. Search closed issues
3. Ask in GitHub Discussions
4. Join our Discord community

## Development Resources

### Useful Links
- [Massa Network Documentation](https://docs.massa.net/)
- [DeFi Development Guide](https://ethereum.org/en/defi/)
- [JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

### Learning Resources
- [Smart Contract Security](https://consensys.github.io/smart-contract-best-practices/)
- [Web3 Development](https://web3.university/)
- [DeFi Protocols](https://defipulse.com/)

Thank you for contributing to AutoVault! Your contributions help make DeFi more accessible and secure for everyone.