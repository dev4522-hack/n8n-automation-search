# n8n Automation Templates Search

A modern web application to search and browse n8n automation templates from a Google Spreadsheet. Features a sleek dark interface with real-time search, creator profiles, and YouTube integration.

## Features

- 🔍 **Real-time Search** - Search automation templates by name, description, or creator
- 👥 **Creator Profiles** - View automation creators with profile avatars
- 📺 **YouTube Integration** - Watch tutorial videos directly from template cards
- 📥 **Template Downloads** - Direct links to download automation templates
- 🎨 **Modern UI** - Clean, responsive dark theme with glowing effects
- ⚡ **Fast Performance** - Debounced search with optimized API calls

## Setup

### Prerequisites

- Node.js installed on your system
- Google API key with Sheets API enabled
- Google Spreadsheet with automation templates

### Installation

1. **Clone or download this repository**

1. **Install dependencies:**

   ```powershell
   npm install express node-fetch cors dotenv
   ```

1. **Create environment file:**

   Create a `.env` file in the project root:

   ```env
   SHEET_ID=your_google_spreadsheet_id_here
   API_KEY=your_google_api_key_here
   ```

1. **Configure your Google Sheet:**

   - Make sure your spreadsheet has columns like: Name, Description, Creator, Youtube_url, Template_url
   - Ensure the sheet is publicly accessible or properly shared
   - Enable Google Sheets API in Google Cloud Console

1. **Start the server:**

   ```powershell
   node server.js
   ```

1. **Open the application:**

   Navigate to <http://localhost:3000> in your browser

## Usage

- **Search**: Type in the search box to find automation templates
- **Sort**: Use the dropdown to sort by popularity, date, or name
- **Watch**: Click "Watch Tutorial" to view YouTube videos
- **Download**: Click "Download Template" to get the automation file

## Technical Details

- **Backend**: Express.js server with Google Sheets API integration
- **Frontend**: Vanilla JavaScript with Tailwind CSS
- **Data**: Reads range A:Z from Google Sheets, assumes first row contains headers
- **Caching**: Optimized API calls with debounced search (300ms delay)

## Troubleshooting

- **Port 3000 in use**: Kill existing processes with `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`
- **API errors**: Verify SHEET_ID and API_KEY in `.env` file
- **No results**: Check that your Google Sheet is accessible and has the expected column headers

## Notes

- For private sheets, consider using a service account and Google APIs client library
- Template cards automatically generate creator avatars using initials
- YouTube thumbnails are automatically extracted from video URLs
