// app/page.tsx
import { google } from 'googleapis';
import { FilteredTable } from './components/FilteredTable';

interface RowData {
  origin: string;
  destination: string;
  value: string;
}

async function getSheetData(): Promise<RowData[]> {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Missing Google Sheets credentials in environment variables');
  }

  try {
    // Format the private key correctly
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    
    console.log('Initializing Google Auth...'); // Debug log
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    console.log('Auth initialized, creating sheets client...'); // Debug log

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1bY6msAWHxQU_3IC5f5SfCk4brtrlVvYM-Pkj9J6s6gU';
    const range = 'DATA';

    console.log('Fetching sheet data...'); // Debug log
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    if (!response.data.values) {
      console.log('No data received from sheet'); // Debug log
      return [];
    }

    console.log(`Received ${response.data.values.length} rows`); // Debug log

    // Transform the data into an array of objects
    const rows = response.data.values;
    // Skip the header row (index 0) and map the data rows
    const data = rows.slice(1).map(row => ({
      origin: String(row[0] || ''),
      destination: String(row[1] || ''),
      value: String(row[2] || '')
    }));

    return data;
  } catch (error) {
    // More detailed error logging
    console.error('Detailed error in getSheetData:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      googleEmail: process.env.GOOGLE_CLIENT_EMAIL ? 'Present' : 'Missing',
      googleKey: process.env.GOOGLE_PRIVATE_KEY ? 'Present' : 'Missing'
    });
    
    throw new Error(
      error instanceof Error 
        ? `Failed to fetch sheet data: ${error.message}`
        : 'Failed to fetch sheet data: Unknown error'
    );
  }
}

export default async function Home() {
  let data: RowData[] = [];
  let error: Error | null = null;
  let errorDetails = '';

  try {
    const fetchedData = await getSheetData();
    data = fetchedData;
  } catch (e) {
    error = e as Error;
    errorDetails = e instanceof Error ? e.message : 'Unknown error occurred';
    console.error('Error in page render:', {
      error: e,
      message: errorDetails
    });
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-lg px-4">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Data</h1>
          <p className="text-gray-600 mb-4">Please check your sheet configuration and try again.</p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="text-left text-xs bg-gray-100 p-4 rounded-md overflow-auto">
              {errorDetails}
            </pre>
          )}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No Data Available</h1>
          <p className="text-gray-600">The sheet appears to be empty.</p>
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