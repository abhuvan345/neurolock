# NeuroLock - Adaptive Behavioral Authentication Frontend

A modern, responsive React frontend for adaptive behavioral authentication with AI-powered trust scoring.

## Features

- **Trust Score Visualization**: Real-time circular gauge showing trust percentage (0-100%)
- **Behavioral Tracking**: Captures keystrokes, mouse movement, clicks, and scrolls
- **Live Telemetry**: Displays key metrics including typing patterns, mouse speed, and interaction rates
- **Trust Trend Chart**: Visual representation of trust score changes over time
- **Activity Log**: Records session events and status changes
- **Adaptive Responses**: 
  - Warning status triggers re-authentication prompt
  - Locked status enforces non-dismissable re-authentication modal
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Accessibility**: Keyboard navigation and screen reader support
- **Dark Theme**: Professional cybersecurity aesthetic with neon accents

## Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Configure environment variables:
   \`\`\`bash
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:8080
   \`\`\`

   Replace `http://localhost:8080` with your backend API URL.

### Running Locally

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

For testing without a backend:
- **Email**: `user@demo.com`
- **Password**: `neuro123`

The frontend will operate in demo mode, simulating trust score changes.

## API Integration

### Expected Endpoints

#### 1. Login
\`\`\`
POST /api/login
Body: { email: string, password: string }
Response: { userId: string }
\`\`\`

#### 2. Behavior Tracking
\`\`\`
POST /api/behavior
Body: { userId: string, features: { ... } }
Response: { 
  trust_score: number,
  status: "active" | "warning" | "locked",
  summary: string 
}
\`\`\`

Features object includes:
- `avg_key_interval`: Average milliseconds between keystrokes
- `avg_key_hold`: Average milliseconds key is held
- `mouse_speed`: Pixels per second
- `click_rate`: Clicks per second
- `scroll_rate`: Scrolls per second
- `time_on_page`: Seconds on current page

#### 3. Re-authentication
\`\`\`
POST /api/re_auth
Body: { userId: string, password: string }
Response: { success: boolean }
\`\`\`

## Project Structure

\`\`\`
src/
├── app/
│   ├── page.tsx              # Home/Login page
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── auth/
│   │   └── login-form.tsx    # Login form component
│   ├── dashboard/
│   │   ├── dashboard-header.tsx
│   │   ├── trust-meter.tsx
│   │   ├── trust-trend.tsx
│   │   ├── telemetry-cards.tsx
│   │   ├── activity-log.tsx
│   │   ├── warning-banner.tsx
│   │   ├── locked-modal.tsx
│   │   └── connection-banner.tsx
│   ├── pages/
│   │   ├── login-page.tsx
│   │   └── dashboard-page.tsx
│   └── ui/
│       ├── button.tsx
│       └── input.tsx
├── hooks/
│   ├── use-behavior-tracking.tsx
│   └── use-api-polling.tsx
└── lib/
    └── utils.ts
\`\`\`

## Customization

### Theme Colors

Edit `app/globals.css` to customize the color scheme:
- Primary (Neon Cyan): `#00d9ff`
- Accent (Neon Green): `#00ff88`
- Warning: `#ffa500`
- Danger: `#ff0055`
- Background: `#0b1020`

### Polling Interval

Modify the polling interval in `hooks/use-api-polling.tsx`:
\`\`\`tsx
// Currently 5000ms (5 seconds)
pollingRef.current = setInterval(() => {
  submitBehavior(features)
}, 5000) // Change this value
\`\`\`

## Design Guidelines

- **Font**: Inter (body), Poppins (headings)
- **Spacing**: Uses Tailwind spacing scale (4px increments)
- **Border Radius**: 0.75rem default
- **Animations**: Smooth 300ms transitions with cubic-bezier easing
- **Contrast**: WCAG AA compliant for all text

## Performance Tips

- Behavior tracking runs client-side with low overhead
- Features are aggregated every 5 seconds (configurable)
- Trend data keeps only last 20 data points in memory
- Activity log limits to 20 entries
- Canvas rendering for trust meter is optimized

## Troubleshooting

### Backend Not Responding
- Check that `NEXT_PUBLIC_API_URL` matches your backend server
- Frontend automatically falls back to demo mode showing "Connection issue" banner
- Check browser console for detailed error messages

### Styling Issues
- Ensure `app/globals.css` is imported in layout.tsx
- Dark mode is enforced via the `.dark` class on the `<html>` element
- Tailwind CSS v4 is required for proper color token support

## License

MIT

## Support

For issues, questions, or feature requests, please open an issue in the repository.

---

**Built for NeuroLock Hackathon Demo** - Professional, secure, and scalable.
