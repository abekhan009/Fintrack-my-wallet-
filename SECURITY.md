# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The FinTrack team and community take security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

To report a security issue, please use the GitHub Security Advisory ["Report a Vulnerability"](https://github.com/abekhan009/Fintrack-my-wallet-/security/advisories/new) tab.

The FinTrack team will send a response indicating the next steps in handling your report. After the initial reply to your report, the security team will keep you informed of the progress towards a fix and full announcement, and may ask for additional information or guidance.

### What to Include

Please include the following information along with your report:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Preferred Languages

We prefer all communications to be in English.

## Policy

- We will respond to your report within 72 hours with our evaluation of the report and an expected resolution date.
- If you have followed the instructions above, we will not take any legal action against you in regard to the report.
- We will handle your report with strict confidentiality, and not pass on your personal details to third parties without your permission.
- We will keep you informed of the progress towards resolving the problem.
- In the public information concerning the problem reported, we will give your name as the discoverer of the problem (unless you desire otherwise).

## Security Measures

### Frontend Security
- All user inputs are validated and sanitized
- JWT tokens are stored securely in localStorage with automatic expiration
- HTTPS is enforced in production
- Content Security Policy (CSP) headers are implemented
- Cross-Origin Resource Sharing (CORS) is properly configured

### Data Protection
- No sensitive data is stored in localStorage beyond authentication tokens
- All API communications use HTTPS
- User sessions expire automatically
- Proper error handling prevents information leakage

### Dependencies
- Regular dependency updates and security audits
- Automated vulnerability scanning
- Use of trusted, well-maintained packages only

## Security Best Practices for Contributors

When contributing to FinTrack, please follow these security guidelines:

### Input Validation
```jsx
// Always validate and sanitize user inputs
const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
};
```

### Authentication
```jsx
// Check authentication status before sensitive operations
if (!user || !authToken) {
    redirect('/login');
    return;
}
```

### Error Handling
```jsx
// Don't expose sensitive information in error messages
try {
    // API call
} catch (error) {
    console.error('Operation failed:', error);
    showUserMessage('An error occurred. Please try again.');
}
```

### Environment Variables
```jsx
// Never commit sensitive data
const API_URL = import.meta.env.VITE_API_URL; // ✅ Good
const API_KEY = 'hardcoded-key'; // ❌ Bad
```

## Vulnerability Disclosure Timeline

- **Day 0**: Security report received
- **Day 1-3**: Initial assessment and acknowledgment
- **Day 4-14**: Investigation and fix development
- **Day 15-30**: Testing and validation
- **Day 31**: Public disclosure (if applicable)

## Contact

For any security-related questions or concerns, please contact:
- Security Team: security@fintrack.com
- Project Maintainer: maintainer@fintrack.com

## Hall of Fame

We recognize security researchers who help keep FinTrack secure:

<!-- Security researchers will be listed here -->

Thank you for helping keep FinTrack and our users safe!