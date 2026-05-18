# Holidaze — Project Exam 2

A modern accommodation booking platform built for the Noroff Front-End Development course. Holidaze lets visitors browse venues, customers make bookings, and venue managers create and manage their own listings.

## Links

| Resource                      | URL                        |
| ----------------------------- | -------------------------- |
| Live site                     | _Netlify/Vercel URL here_  |
| GitHub repository             | _GitHub repo URL here_     |
| Figma style guide & prototype | _Figma URL here_           |
| Kanban board                  | _GitHub Projects URL here_ |

## Built with

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool and dev server
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [React Router v7](https://reactrouter.com/) — client-side routing

## Features

**All users**

- Browse all venues with search and sort
- View individual venue pages with image carousel, amenities, and availability calendar
- Register as a customer or venue manager (requires a `stud.noroff.no` email)

**Customers**

- Log in and out
- Book a venue by selecting dates and number of guests
- View upcoming bookings with a personal booking calendar on the profile page
- Update profile picture

**Venue managers**

- Create, edit, and delete venues (including multiple images)
- View upcoming bookings for each managed venue
- Switch between customer and venue manager roles
- Update profile picture

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (included with Node.js)

### Installation

1. Clone the repository:

   ```bash
   git clone <your-github-repo-url>
   cd Project-Exam-2
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the project:

   ```
   VITE_API_BASE_URL=https://v2.api.noroff.dev
   VITE_API_KEY=your_noroff_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be running at `http://localhost:5173`.

### Other commands

```bash
npm run build      # Production build
npm run preview    # Preview the production build locally
npm run lint       # Run ESLint
```

## Environment variables

| Variable            | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `VITE_API_BASE_URL` | Base URL for the Noroff API (`https://v2.api.noroff.dev`) |
| `VITE_API_KEY`      | Your personal Noroff API key                              |

> **Note:** Never commit your `.env` file to version control. It is already listed in `.gitignore`.
