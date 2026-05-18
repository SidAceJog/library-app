# Requirements Verification Questions

## Library Web App for Housing Society

Please answer the following questions by filling in the letter choice after each [Answer]: tag.
If none of the options match, choose the last option (Other) and describe your preference.

---

## Question 1
How should the 488 flat logins be set up initially?

A) Pre-generated credentials (flat number + default password) that users change on first login
B) Admin creates accounts manually and shares credentials
C) Self-registration with flat number verification (e.g., admin approves)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
What information should be stored per flat/user?

A) Just flat number and login credentials (minimal)
B) Flat number, resident name, phone number, and credentials
C) Flat number, resident name, phone number, email, WhatsApp number, and credentials
D) Other (please describe after [Answer]: tag below)

[Answer]: flat, name, whatsapp number, email and credential

## Question 3
For ISBN barcode scanning, what devices will be used?

A) Smartphone camera only (mobile web app)
B) Desktop webcam + smartphone camera
C) Dedicated barcode scanner hardware
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
When you say "due date in 1/2 from time of borrowing" — do you mean?

A) 2 weeks (14 days) from borrowing date
B) 1 month from borrowing date
C) The admin/volunteer sets the due date manually at time of checkout (choosing 1 week or 2 weeks etc.)
D) Other (please describe after [Answer]: tag below)

[Answer]: 1 or 2 weeks. admin sets 

## Question 5
For WhatsApp reminders, which approach do you prefer?

A) Free WhatsApp Business API via Meta Cloud API (requires business verification, limited free tier of 1000 conversations/month)
B) Simple WhatsApp click-to-chat links (no automation, just generates a pre-filled message link the user can send)
C) Twilio WhatsApp sandbox (free for testing, paid for production)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
When should WhatsApp reminders be sent?

A) 2 days before due date only
B) 1 day before due date only
C) Both 3 days before and on the due date
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
What should happen when a book is returned?

A) Admin/volunteer scans ISBN again and marks as returned
B) Admin/volunteer searches by borrower name/flat and marks as returned
C) Both options (scan or search)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 8
What admin capabilities are needed beyond managing book checkouts/returns?

A) Just checkout/return management and viewing overdue books
B) A + manage user accounts (reset passwords, disable accounts)
C) B + view analytics (most borrowed books, active borrowers, overdue stats)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 9
How should the volunteer/admin role work?

A) Any resident can request volunteer access, admin approves
B) Admin manually promotes residents to volunteer role
C) There's a single super-admin who can promote others to admin/volunteer
D) Other (please describe after [Answer]: tag below)

[Answer]: volunteer is not an access, they are volunteering to sit in the library and the acceptance will lead to admin access for them for that day only.

## Question 10
For the "zero cost GitHub free stack" deployment, which approach do you prefer?

A) GitHub Pages (frontend) + Supabase free tier (backend/database/auth) + GitHub Actions (cron for reminders)
B) GitHub Pages (frontend) + Firebase free tier (backend/database/auth) + GitHub Actions (cron)
C) Fully static site with GitHub Pages + a JSON-based flat-file database in the repo (very limited but truly zero dependencies)
D) Other (please describe after [Answer]: tag below)

[Answer]: you suggest

## Question 11
Should the book photo captured during checkout be stored?

A) Yes, store the photo as part of the book catalog entry (for identification)
B) Yes, store photo temporarily until book is returned (proof of condition)
C) Store both a catalog photo and a condition photo per checkout
D) Other (please describe after [Answer]: tag below)

[Answer]: this could be expensive? if so no.

## Question 12
Should there be any limit on how many books a resident can borrow at once?

A) No limit
B) Maximum 2 books at a time
C) Maximum 3 books at a time
D) Admin-configurable limit
E) Other (please describe after [Answer]: tag below)

[Answer]: 1 book at a time to start with. keep it configurabe for admin

## Question 13
What should happen with overdue books?

A) Just send reminders, no penalties
B) Block further borrowing until overdue book is returned
C) Both reminders and borrowing block
D) Other (please describe after [Answer]: tag below)

[Answer]: send message to admins. Admin will handle.

## Question 14: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

---

**Instructions**: Please fill in your answers after each [Answer]: tag and let me know when you're done.


[Note]: lets not make this elaborate. want to get quickly to code gen and be done with it.