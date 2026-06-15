# FHFO Café & Crepes Reservations
A lightweight, serverless reservation system built for a one-time Parisian café pop-up event hosted by the **French House and Friends Organization (FHFO)** at the College of Charleston. The event featured made-to-order French crepes (savory and sweet) and café drinks (lattes, espresso, tea, etc.).
🔗 **[Live Demo](https://ava33333.github.io/FHFO_Cafe/)**
> Note: Reservations are closed. The site is in demo-only mode.
---
## Overview
Guests could visit the site, view real-time table availability across four time slots, and submit a reservation for their party. The backend was handled entirely through a **Google Apps Script** web app connected to a **Google Sheet**, with no traditional server required.
---
## Features
- **Real-time availability display** — seats remaining per table are fetched live from Google Sheets on page load
- **Time slot selection** — four sittings available (4:00 PM, 4:45 PM, 5:30 PM, 6:15 PM), each with four tables of up to 4 seats
- **Smart table assignment** — automatically finds an available table that fits the party size; supports community seating (smaller parties sharing a table)
- **Duplicate booking prevention** — rejects reservations from an email address that has already been used
- **Automated confirmation email** — sends a styled HTML confirmation email with event details upon successful booking
- **Day-of reminder emails** — automatically sends reminder emails to all guests on the day of the event; handles edge cases where a guest submitted two reservations, combining them into a single notification with the correct total party size
- **Graceful edge cases** — redirects to dedicated pages when a time slot is fully booked (`reservation_unavailable.html`) or reservations are closed (`reservations_closed.html`)
---
## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript |
| Backend / API | Google Apps Script (deployed as a web app) |
| Database | Google Sheets (two sheets: reservations log + table availability) |
| Hosting | GitHub Pages |
| Email | Gmail via `MailApp` (Google Apps Script) |
