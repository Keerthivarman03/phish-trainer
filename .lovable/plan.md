

# Phishing Simulation & Awareness Training Platform

## Overview
A cybersecurity training tool that creates realistic phishing login pages, captures attempt data, and displays results in a secure admin dashboard — all designed to raise awareness, not exploit.

---

## Page 1: Simulated Phishing Login Page
- **Generic login form** with email/username and password fields, styled to look professional and authentic
- On submit, captures: entered credentials, timestamp, browser/OS/device info (via User-Agent parsing), screen resolution
- **IP & geolocation** captured server-side via a Supabase Edge Function (using a free IP geolocation API)
- After submission, displays a **cybersecurity awareness message** explaining this was a simulated phishing test with tips on spotting phishing attacks
- Each phishing page is tied to a **campaign** via a URL parameter (e.g., `/login?c=abc123`)

## Page 2: Admin Login
- Secure login page for admin users using Supabase Auth (email/password)
- Only authenticated admins can access the dashboard

## Page 3: Admin Dashboard — Campaigns
- Create, view, and manage phishing campaigns
- Each campaign has: name, description, creation date, unique link
- Campaign card shows quick stats: total attempts, last attempt date
- Click into a campaign to see its detailed results

## Page 4: Campaign Detail / Attempt Logs
- Data table of all login attempts for that campaign
- Columns: timestamp, entered email/username, entered password, IP address, city/country, browser, OS, device type, screen resolution
- Sorting, filtering, and search functionality
- CSV export button for reports

## Page 5: Analytics Overview
- Simple charts (using Recharts, already installed):
  - Attempts over time (line/bar chart)
  - Browser breakdown (pie chart)
  - OS breakdown (pie chart)
  - Top geographic locations (bar chart)
- Filter by campaign or view all campaigns combined

---

## Backend (Supabase / Lovable Cloud)
- **Database tables**: `campaigns`, `login_attempts`, admin users via Supabase Auth
- **Edge Function**: receives phishing form submissions, logs IP/geolocation, stores attempt data
- **Row Level Security**: only authenticated admin users can read captured data
- **Encrypted storage**: passwords stored but access restricted to admin dashboard only

## Design
- Clean, professional UI with dark/light mode toggle
- Responsive layout for desktop and mobile
- Dashboard uses a sidebar for navigation between Campaigns, Logs, and Analytics

