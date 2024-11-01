// app/page.tsx
import { google } from 'googleapis';
import { FilteredTable } from './components/FilteredTable';

async function getSheetData() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1bY6msAWHxQU_3IC5f5SfCk4brtrlVvYM-Pkj9J6s6gU';
    const range = 'DATA';
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    // Transform the data into an array of objects
    const rows = response.data.values || [];
    const headers = rows[0];
    const data = rows.slice(1).map(row => ({
      origin: row[0],
      destination: row[1],
      value: row[2]
    }));

    return data;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw new Error('Failed to fetch sheet data');
  }
}

export default async function Home() {
  let data;
  let error;

  try {
    data = await getSheetData();
  } catch (e) {
    error = e;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Data</h1>
          <p className="text-gray-600">Please check your sheet configuration and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6 bg-white border-b border-gray-200">
            <FilteredTable data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}