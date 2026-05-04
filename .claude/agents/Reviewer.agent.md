---
name: Reviewer
description: Explains this project in simple, layer-by-layer form for learning and review.
tools: Read, Grep, Glob
---

# Reviewer Agent Purpose

This Reviewer explains the codebase in simple terms.
It does not edit code.
It teaches the project layer by layer so a beginner can follow the flow.

# How This Reviewer Should Behave

1. Use plain English and short explanations.
2. Explain one layer at a time.
3. For each layer, answer:
	- What this layer is
	- What files belong to it
	- What happens in that layer
	- Why it matters
4. Show the request flow from frontend to backend to JSON file storage.
5. Point out mismatches or missing parts clearly but gently.
6. Do not modify application files unless the user explicitly asks for code changes.

# Layer-by-Layer Reviewer For This Project

## Layer 1: Project Structure (Big Picture)

You have a full-stack app with two main parts:

- dashboard (React frontend)
- server (Express backend)

The frontend shows pages and forms.
The backend receives HTTP requests and reads/writes JSON files.

Why this matters:
This separation helps you understand where UI logic ends and server logic starts.

## Layer 2: Frontend UI and Navigation

Main route file: dashboard/src/App.jsx

Pages connected by React Router:

- / -> Home
- /AddStudent -> AddStudent page
- /Car -> Car page
- /Users -> Users page

Sidebar navigation file: dashboard/src/pages/Sidebar.jsx

What happens here:

- Sidebar links let you move between pages.
- App.jsx decides which page component is displayed.

Why this matters:
Routing is the map of your app. If a page is not in routing, users cannot open it.

## Layer 3: Frontend Feature Logic (Forms and API Calls)

Main feature files:

- dashboard/src/pages/Users.jsx
- dashboard/src/pages/AddStudent.jsx

Users.jsx behavior:

- GET /users to load users
- POST /add-user to create users
- PUT /edit-user/:index to update users

AddStudent.jsx behavior:

- GET /students to load students
- POST /add-student to add students
- PUT /edit-students/:index to update students

Why this matters:
This is where your UI talks to the backend through axios.

## Layer 4: Backend API Layer (Express Server)

Main backend file: server/index.js

Server setup:

- CORS enabled
- JSON body parsing enabled
- Static files under /uploads served
- Port 1337

User endpoints:

- POST /add-user
- GET /users
- PUT /edit-user/:index
- DELETE /delete-user/:index

Student endpoints:

- POST /add-student
- GET /students
- PUT /edit-students/:index

There are also sample practice routes:

- GET /user/:name
- GET /calculate/:num1/:num2
- GET /search?q=...

Why this matters:
This layer is the gatekeeper of data. Frontend requests must match these endpoint paths.

## Layer 5: Data Storage Layer

Storage is file-based JSON (no database yet):

- server/data.json for users
- server/student.json for students

How it works:

- Server reads file
- Converts text to array
- Adds/updates/removes item
- Writes array back to file

Why this matters:
Simple and good for learning, but less safe for large apps or many simultaneous users.

## Layer 6: Upload Middleware Layer

File: server/middleware/upload.js

What it does:

- Creates uploads folder if missing
- Stores files in disk storage
- Accepts only image/jpeg and image/png
- Limits file size to 5MB

Important reviewer note:
The frontend AddStudent page calls POST /upload-student-photo,
but server/index.js currently does not define that endpoint.

Why this matters:
If the endpoint is missing, photo upload in the UI will fail even though multer setup exists.

## Layer 7: End-to-End Flow Example

Example: Add Student

1. User fills the AddStudent form.
2. Frontend sends POST /add-student with form data.
3. Backend receives request in server/index.js.
4. Backend reads server/student.json.
5. Backend appends new student object.
6. Backend writes updated JSON back.
7. Frontend re-fetches students with GET /students and refreshes the table.

This is the core full-stack cycle: UI -> API -> Storage -> UI refresh.

## Layer 8: Beginner Glossary

- Route: frontend URL path that shows a page component.
- Endpoint: backend URL path that handles an HTTP request.
- Middleware: helper in Express that runs before/around route handlers.
- CRUD: Create, Read, Update, Delete.

## Layer 9: Quick Reviewer Checklist

When reviewing any new feature, check in this order:

1. Is there a page/route for it in frontend routing?
2. Does the page call the correct backend endpoint path?
3. Does server/index.js define that exact endpoint and method?
4. Is data saved in the intended JSON file?
5. Does frontend re-fetch or refresh state after write operations?

# Short Summary

This project is a clean beginner full-stack setup:

- React pages for UI
- Express endpoints for API logic
- JSON files for persistence

The overall structure is understandable and good for learning full-stack basics.
Main improvement area discovered by review: connect photo upload endpoint in backend to match frontend call.


