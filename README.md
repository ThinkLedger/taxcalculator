# Ghana Tax Calculator 🇬🇭

A modern, responsive web application for calculating PAYE income tax and SSNIT deductions in Ghana. Calculate your monthly net income, income tax, and SSNIT contributions instantly with accurate tax rates effective from January 2024.

## Features

- ✨ **Real-time Calculations** - Instant tax calculations as you type
- 📊 **Tax Breakdown** - Detailed breakdown of tax brackets and rates
- ⚙️ **Configurable Options** - Toggle SSNIT deductions, select year, and country
- 🌓 **Dark Mode Support** - Beautiful light and dark themes
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- ⚡ **Fast Performance** - Built with Next.js 16 and React 19

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Form Validation**: Zod
- **State Management**: React Hooks
- **Precision Math**: decimal.js
- **Theme Management**: next-themes

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd taxcalculatorgh
```

2. Install dependencies:
```bash
bun install
# or
npm install
# or
yarn install
# or
pnpm install
```

3. Configure Finance Oracle proxy access:
```bash
cp .env.example .env.local
```

Set these values in `.env.local`:
- `NEXT_PUBLIC_FINANCE_ORACLE_PROXY_URL`

Use a deployed proxy URL (for example a Cloudflare Worker). Do not expose Oracle API keys in frontend env vars.

4. Run the development server:
```bash
bun dev
# or
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter your **Monthly Basic Income** in Ghana Cedis (GH₵)
2. Optionally enter **Monthly Allowances** (if applicable)
3. Optionally enter **Tax Relief** amount
4. View your calculated:
   - Net Income (take home)
   - Income Tax
   - SSNIT Deductions
5. Click "Show tax breakdown" to see detailed tax bracket calculations
6. Use the Config panel to:
   - Select country (currently Ghana)
   - Select tax year
   - Toggle SSNIT deductions on/off

## Tax Rates

The calculator uses tax rates effective from **January 1st, 2024**:

- First GH¢ 490: 0%
- Next GH¢ 110: 5%
- Next GH¢ 130: 10%
- Next GH¢ 3,166.67: 17.5%
- Next GH¢ 16,000: 25%
- Next GH¢ 30,520: 30%
- Above GH¢ 50,000: 35%

**SSNIT Rate**: 5.5%

## Project Structure

```
taxcalculatorgh/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Main calculator page
│   └── globals.css         # Global styles and theme variables
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── theme-provider.tsx  # Theme context provider
│   └── theme-toggle.tsx    # Dark/light mode toggle
├── lib/
│   ├── calculator.ts       # Tax calculation logic
│   ├── rates.ts            # Tax rates and SSNIT rate
│   └── utils.ts            # Utility functions
└── public/                 # Static assets
```

## Building for Production

```bash
bun build
# or
npm run build
# or
yarn build
# or
pnpm build
```

The static files will be generated in the `out` directory.

## Deploying to GitHub Pages

This project is configured to deploy automatically to GitHub Pages using GitHub Actions.

### Setup

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Click on **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**
   - Save the settings

2. **Push to main branch:**
   - The GitHub Actions workflow will automatically build and deploy your site
   - Your site will be available at: `https://thinkledger.github.io/taxcalculator/`

### Manual Deployment

If you want to build and test locally:

```bash
bun run build
# or
npm run build
```

The static site will be in the `out` directory, ready to be deployed.

## Disclaimer

We do our best to ensure the accuracy of this tool, but we cannot be held responsible for any errors. This calculator is for informational purposes only and should not be considered as professional tax advice. Please consult with a qualified tax professional for official tax calculations.

## Credits

Inspired by [Kessir](https://kessir.com)

## License

This project is open source and available under the MIT License.
