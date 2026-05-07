# Security Policy

## Reporting a Vulnerability

We take the security of Basaeer School Management System seriously. If you believe you have found a security vulnerability, please report it to us by emailing security@basaeer.com.

Please do not open a public issue for security-related reports.

### What to include in your report:
- A description of the vulnerability.
- Steps to reproduce the issue.
- Potential impact.
- Any suggested fixes or mitigations.

## Security Practices

This project follows several security best practices, including:
- **No Hardcoded Secrets**: All sensitive configuration is handled via environment variables.
- **Tenant Isolation**: Data is strictly isolated between branches/tenants.
- **RBAC**: Role-Based Access Control is enforced on all sensitive endpoints.
- **Hashed Passwords**: User passwords are encrypted using bcrypt.
- **Secure JWT**: JSON Web Tokens are used for authentication with secure, environment-defined secrets.
- **Input Validation**: All incoming data is validated using Class-Validator.
- **Security Headers**: Standard security headers are enabled via Helmet.
- **Rate Limiting**: Critical endpoints are protected against brute-force attacks.

## Environment Security

Ensure that you never commit your `.env` files to version control. Use the provided `.env.example` as a template for your environment configuration.
