You are a Senior Staff Software Engineer, AI Architect, Product Designer, and SaaS UX Expert.

Before writing any code, fully analyze the entire FocusPilot codebase and understand the platform architecture.

About FocusPilot

FocusPilot is an Interior Design Project Management Platform.

The platform helps interior designers manage:

Clients
Projects
Design Tasks
Contractors
Deliverables
Documents
Invoices
Team Collaboration
Project Progress
Reports
Communication

The application contains:

1. Marketing Website

Purpose:

Lead generation
Product information
SEO
Pricing
Features
Contact

Examples:

Home
About
Pricing
Blog
Features
Contact
2. Client Portal

Used by design clients.

Examples:

Dashboard
My Projects
Files
Approvals
Payments
Messages
Timeline
3. Contractor Portal

Used by contractors and vendors.

Examples:

Assigned Tasks
Work Orders
Deliverables
Schedule
Documents
Messages
4. Internal Team Portal

Used by designers, project managers, and administrators.

Examples:

Project Management
Resource Planning
Team Management
Reporting
Client Communication
First Task

Analyze the entire application.

Discover:

Routes
Layouts
Authentication structure
User roles
Shared components
Sidebar navigation
Dashboard pages
Project-related screens

Generate a report before implementation.

AI Assistant Objective

Create a production-grade AI Assistant called:

FocusPilot AI

Purpose:

Help users use the platform more effectively.

The assistant should behave like:

Project coordinator
Design operations assistant
Platform guide
Productivity assistant
Placement Rules
DO NOT SHOW AI ASSISTANT

Marketing pages:

Home
Pricing
Blog
Features
Careers
Contact

Authentication pages:

Login
Register
Forgot Password
Reset Password

Reason:

These pages are marketing-focused and do not require workflow assistance.

SHOW AI ASSISTANT

Authenticated areas only.

Client Portal

Show on:

Dashboard
Project Pages
Documents
Files
Payments
Messages
Timeline
Settings
Contractor Portal

Show on:

Dashboard
Assigned Tasks
Deliverables
Work Orders
Documents
Messages
Team Portal

Show on:

Projects
Tasks
Resource Planning
Reports
Team Management
Client Management
Context-Aware AI

The assistant must understand where the user currently is.

Examples:

Project Page

User asks:

"How do I update project status?"

AI understands current page is Project Details.

Contractor Page

User asks:

"How do I submit completed work?"

AI understands contractor workflow.

Invoice Page

User asks:

"Why is this invoice unpaid?"

AI explains invoice statuses and workflow.

Future Context Integration

Design architecture for future support of:

Project-aware AI
Document-aware AI
Contractor-aware AI
Client-aware AI
Knowledge Base Search
RAG
Vector Search
Meeting Notes Search
Design File Search
UI Requirements

Build a premium SaaS experience.

Inspired by:

Notion AI
Linear
ClickUp AI
Intercom
Asana AI
Floating Button

Desktop:

Bottom right
Above notifications

Mobile:

Responsive
Safe-area aware
Chat Panel

Features:

Open/Close
Minimize
Drag support
Resize support
Message history
Typing indicators
Suggested actions
Suggested Actions

Examples:

Client:

View Project Status
Upload Files
Approve Design
Contact Designer

Contractor:

View Assigned Tasks
Submit Deliverable
Update Progress

Internal Team:

Create Project
Assign Contractor
Generate Report
Schedule Meeting