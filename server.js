require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const SHEET_ID = process.env.SHEET_ID || "";
const API_KEY = process.env.API_KEY || "";

if (!SHEET_ID || !API_KEY) {
  console.warn("Warning: SHEET_ID or API_KEY not set in .env file");
}

// Sample data for demonstration
const sampleData = [
  {
    Name: "Discord to Slack Message Automation",
    Description: "Automatically forward messages from Discord channels to Slack channels with user mentions and formatting preservation.",
    Creator: "Rory Ridgers",
    Youtube_url: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    Template_url: "https://n8n.io/workflows/discord-slack-automation",
    Views: "1250",
    Date: "2024-10-01"
  },
  {
    Name: "Email Campaign Analytics Dashboard",
    Description: "Track and visualize email campaign performance with automated reporting to Google Sheets and Slack notifications.",
    Creator: "Mark Kashef",
    Youtube_url: "https://www.youtube.com/watch?v=6ldAH2WBX0s",
    Template_url: "https://n8n.io/workflows/email-analytics-dashboard",
    Views: "890",
    Date: "2024-09-28"
  },
  {
    Name: "Social Media Cross-Posting Bot",
    Description: "Automatically post content across Twitter, LinkedIn, and Facebook with customized messaging for each platform.",
    Creator: "Nick Saraev",
    Youtube_url: "https://www.youtube.com/watch?v=8JJ101D3knE",
    Template_url: "https://n8n.io/workflows/social-media-crosspost",
    Views: "2100",
    Date: "2024-10-05"
  },
  {
    Name: "Customer Support Ticket Automation",
    Description: "Route support tickets from multiple channels, assign priorities, and notify appropriate team members automatically.",
    Creator: "Alex Chen",
    Youtube_url: "https://www.youtube.com/watch?v=2M1dcc9jsI0",
    Template_url: "https://n8n.io/workflows/support-ticket-routing",
    Views: "675",
    Date: "2024-09-25"
  },
  {
    Name: "E-commerce Order Processing Workflow",
    Description: "Automate order confirmation, inventory updates, shipping notifications, and customer follow-up emails.",
    Creator: "Sarah Johnson",
    Youtube_url: "https://www.youtube.com/watch?v=Bb9AxKQY2Qs",
    Template_url: "https://n8n.io/workflows/ecommerce-order-processing",
    Views: "1850",
    Date: "2024-10-03"
  },
  {
    Name: "Lead Generation & CRM Sync",
    Description: "Capture leads from web forms, enrich contact data, and sync with CRM systems with automated scoring.",
    Creator: "Rory Ridgers",
    Youtube_url: "https://www.youtube.com/watch?v=XVSRGoW931c",
    Template_url: "https://n8n.io/workflows/lead-generation-crm",
    Views: "1320",
    Date: "2024-09-30"
  }
];

app.get("/workflows", async (req, res) => {
  try {
    let rows = [];

    if (!SHEET_ID || !API_KEY) {
      console.log("Using sample data (SHEET_ID or API_KEY not set)");
      rows = sampleData;
    } else {
      const range = "A:Z";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
      const r = await fetch(url);
      
      if (!r.ok) {
        console.error(`Failed to fetch sheet: ${r.status} ${r.statusText}`);
        console.log("Falling back to sample data");
        rows = sampleData;
      } else {
        const data = await r.json();
        console.log('Raw Google Sheets response:', JSON.stringify(data, null, 2));
        
        const values = data.values || [];
        const headers = values[0] || [];
        
        console.log('Spreadsheet headers:', headers);
        console.log('Total values array length:', values.length);
        console.log('Number of data rows:', values.length - 1);
        
        if (values.length > 1) {
          console.log('Sample raw row:', values[1]);
        }
        
        rows = values.slice(1).map(row => {
          const obj = {};
          for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const value = row[i] || "";
            
            // Map your spreadsheet columns to expected format
            switch(header.toLowerCase()) {
              case 'name':
              case 'title':
                obj.Name = value;
                break;
              case 'description':
                obj.Description = value;
                break;
              case 'creator':
                obj.Creator = value;
                break;
              case 'youtube_url':
                obj.Youtube_url = value;
                break;
              case 'template_url':
              case 'resource_url':
                obj.Template_url = value;
                break;
              case 'date_posted':
                obj.Date = value;
                obj.Views = Math.floor(Math.random() * 3000) + 100; // Generate random views
                break;
              default:
                obj[header] = value;
            }
          }
          return obj;
        }).filter(row => row.Name && row.Name.trim() !== ''); // Filter out empty rows

        console.log(`Loaded ${rows.length} rows from spreadsheet for workflows`);
        
        if (rows.length === 0) {
          console.log("No valid data in spreadsheet, using sample data");
          rows = sampleData;
        } else {
          console.log('Sample workflow row:', rows[0]);
        }
      }
    }

    // Add creator avatars
    rows = rows.map(row => ({
      ...row,
      creatorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.Creator || 'Unknown')}&background=random&color=fff&size=128`
    }));

    console.log(`Returning ${rows.length} automations`);
    res.json({ results: rows });
  } catch (err) {
    console.error('Error in /workflows:', err);
    console.log("Falling back to sample data due to error");
    const rows = sampleData.map(row => ({
      ...row,
      creatorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.Creator || 'Unknown')}&background=random&color=fff&size=128`
    }));
    res.json({ results: rows });
  }
});

app.get("/search", async (req, res) => {
  try {
    const search = (req.query.search || "").toLowerCase().trim();
    const sort = (req.query.sort || "popular").toLowerCase();

    console.log('Search params:', { search, sort });
    console.log('SHEET_ID:', SHEET_ID ? 'SET' : 'NOT SET');
    console.log('API_KEY:', API_KEY ? 'SET' : 'NOT SET');

    let rows = [];

    if (!SHEET_ID || !API_KEY) {
      console.log("Using sample data for search (SHEET_ID or API_KEY not set)");
      rows = [...sampleData];
      console.log('Sample data rows:', rows.length);
    } else {
      const range = "A:Z";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
      const r = await fetch(url);
      
      if (!r.ok) {
        console.error(`Failed to fetch sheet: ${r.status} ${r.statusText}`);
        console.log("Falling back to sample data for search");
        rows = sampleData;
      } else {
        const data = await r.json();
        console.log('Search - Raw Google Sheets response keys:', Object.keys(data));
        
        const values = data.values || [];
        const headers = values[0] || [];
        
        console.log('Search - Spreadsheet headers:', headers);
        console.log('Search - Total values array length:', values.length);
        
        rows = values.slice(1).map(row => {
          const obj = {};
          for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const value = row[i] || "";
            
            // Map your spreadsheet columns to expected format
            switch(header.toLowerCase()) {
              case 'name':
              case 'title':
                obj.Name = value;
                break;
              case 'description':
                obj.Description = value;
                break;
              case 'creator':
                obj.Creator = value;
                break;
              case 'youtube_url':
                obj.Youtube_url = value;
                break;
              case 'template_url':
              case 'resource_url':
                obj.Template_url = value;
                break;
              case 'date_posted':
                obj.Date = value;
                obj.Views = Math.floor(Math.random() * 3000) + 100;
                break;
              default:
                obj[header] = value;
            }
          }
          return obj;
        }).filter(row => row.Name && row.Name.trim() !== ''); // Filter out empty rows

        console.log(`Loaded ${rows.length} rows from spreadsheet`);
        
        if (rows.length === 0) {
          console.log("No valid data in spreadsheet, using sample data for search");
          rows = sampleData;
        } else {
          console.log('Sample spreadsheet row:', rows[0]);
        }
      }
    }

    // Apply search filter
    let results = rows;
    if (search) {
      results = rows.filter(row => {
        return Object.values(row).some(v => 
          String(v).toLowerCase().includes(search)
        );
      });
    }

    // Add creator avatars to results
    results = results.map(row => ({
      ...row,
      creatorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.Creator || 'Unknown')}&background=random&color=fff&size=128`
    }));

    // Apply sorting
    switch(sort) {
      case 'popular':
        results.sort((a, b) => (parseInt(b.Views) || 0) - (parseInt(a.Views) || 0));
        break;
      case 'recent':
        results.sort((a, b) => new Date(b.Date || 0) - new Date(a.Date || 0));
        break;
      case 'name':
        results.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));
        break;
      default:
        results.sort((a, b) => (parseInt(b.Views) || 0) - (parseInt(a.Views) || 0));
    }

    console.log(`Returning ${results.length} search results`);
    res.json({ results });
  } catch (err) {
    console.error('Error in /search:', err);
    console.log("Falling back to sample data due to error");
    const results = sampleData.map(row => ({
      ...row,
      creatorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.Creator || 'Unknown')}&background=random&color=fff&size=128`
    }));
    res.json({ results });
  }
});

// Test endpoint to check sample data
app.get("/test-data", (req, res) => {
  console.log('Sample data check:', sampleData.length, 'items');
  console.log('First item:', sampleData[0]);
  res.json({ 
    count: sampleData.length,
    sampleData: sampleData,
    envCheck: {
      SHEET_ID: !!SHEET_ID,
      API_KEY: !!API_KEY
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Sample data loaded: ${sampleData.length} items`);
});
