# Contributing to Event Planner

Thank you for considering contributing to Event Planner! This document outlines the process for contributing to the project.

## Code of Conduct

In the interest of fostering an open and welcoming environment, we expect all contributors to be respectful and considerate of others. Please help create a positive experience for everyone involved.

## Development Workflow

We follow a feature branch workflow:

1. **Fork the repository** (if you're an external contributor)
2. **Create a feature branch** from `main`:
   ```
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our coding standards
4. **Commit your changes** with clear, descriptive commit messages:
   ```
   git commit -m "Add feature: brief description of the change"
   ```
5. **Push your branch** to your fork or the main repository:
   ```
   git push origin feature/your-feature-name
   ```
6. **Submit a pull request** to the `main` branch

## Pull Request Process

1. Use the provided PR template
2. Ensure your code follows the project's coding standards
3. Include tests for new functionality
4. Update documentation as necessary
5. Link to any related issues
6. Wait for review and address any feedback

## Coding Standards

- Follow the existing code style in the project
- Write clear, descriptive variable and function names
- Include comments for complex logic
- Ensure all tests pass before submitting a PR
- Keep functions small and focused on a single responsibility
- Use TypeScript types appropriately

## Implementation Phases

Please reference the [Implementation Plan](../docs/IMPLEMENTATION_PLAN.md) to understand the phased approach we're taking. When working on a specific phase:

1. Check if all prerequisites from previous phases are complete
2. Focus on completing all tasks within the phase
3. Update documentation to reflect the changes

## Commit Message Guidelines

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Consider prefixing your commits with:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for formatting changes
  - `refactor:` for code refactoring
  - `test:` for adding or modifying tests
  - `chore:` for maintenance tasks

## Questions or Issues?

If you have questions or encounter issues, please open an issue in the repository describing the problem or question in detail. 