# Take-Home Assignment: Dynamic Data Visualization Component

## Task

Design and implement a dynamic data visualization component.

## Overview

The goal is to create a **reusable dashboard widget component** that displays dynamic data in an interactive and visually appealing manner. This component is intended for integration into a larger dashboard application.

## Requirements

### Frontend
**Tech Stack**: Next.js, TypeScript, Tailwind CSS

- **Single Page**: Create a single page that showcases your visualization component.
- **Dashboard Widget**: Implement a dashboard widget that presents data in a chart or graph format.
- **Responsiveness**: Ensure the widget performs well on both desktop and mobile devices.
- **Interactivity**: Add interactivity elements such as hover effects, tooltips, or click events.
- **Styling**: Use Tailwind CSS for styling with a focus on clean, intuitive design.

### Backend
**Tech Stack**: Next.js API Routes, MongoDB

- **API Route**: Implement an API route to serve mock data for your visualization.
- **Data Fetching**: Fetch data from the API within your component.
- **Data Storage**: Use MongoDB to store and retrieve your mock data.
- **Mock Data**: Use the provided mock dataset in the implementation.

---

## Tech Stack References

- **Frontend**
    - Framework: [Next.js](https://nextjs.org/)
    - Styling: [Tailwind CSS](https://tailwindcss.com/)
    - Programming Language: [TypeScript](https://www.typescriptlang.org/)

- **Backend**
    - API: [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
    - Database: [MongoDB](https://www.mongodb.com/)

---

## Development Setup

Below are the instructions to help set up the development environment.

### Prerequisites

Ensure you have the following installed:
- **Node.js 16+** ([Download here](https://nodejs.org/en/download/))
- **npm** ([Included with Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))
- **Docker and Docker-Compose** ([Docker Desktop](https://www.docker.com/products/docker-desktop/))

Validate installations:
```bash
docker run hello-world
node -v
```

Expected output for Node.js:
```bash
v16.x.x or higher
```

### Environment Setup

1. Install dependencies and set up environment variables:
    ```bash
    npm run first-time-setup
    ```

2. Start the development server:
    ```bash
    npm run start:test-env
    ```

3. Apply database migrations and seed mock data:
    ```bash
    npm run prisma:migrate-dev
    npm run prisma:seed
    ```

---

## Usage

To view the dashboard widget, navigate to the following routes in your browser:

- **Frontend**:  
  [http://localhost:3000](http://localhost:3000)
- **Backend API**:  
  [http://localhost:3000/api](http://localhost:3000/api)
- **Mock Data (MailHog)**:  
  [http://localhost:8025](http://localhost:8025)

---

## Getting Started with the Application

1. Open the frontend at [http://localhost:3000](http://localhost:3000).
2. Create an account by signing in with an email.
3. Verify your account in the MailHog inbox at [http://localhost:8025](http://localhost:8025).

---

## Building the Application

For a production build:
```bash
npm run next:build
```

The build artifacts will be located in the `.next` directory.

---

## Notes

Feel free to reference the following resources for additional guidance:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

Happy Coding!
