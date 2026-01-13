import { RFQRequest, Offer, Product, Supplier, ProductSupplier } from './types';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.warn('Airtable API credentials not configured');
}

const headers = {
  'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

// Helper function to handle Airtable API calls
async function airtableRequest(endpoint: string, options: RequestInit = {}) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable API credentials not configured');
  }

  const response = await fetch(`${AIRTABLE_API_URL}/${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Airtable API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// RFQ Requests
export async function createRFQRequest(data: RFQRequest): Promise<RFQRequest> {
  const response = await airtableRequest('RFQ Requests', {
    method: 'POST',
    body: JSON.stringify({
      fields: {
        'Request Number': data.request_number,
        'Customer Email': data.customer_email,
        'Customer Name': data.customer_name || '',
        'Product ID': data.product_id,
        'Product Name': data.product_name,
        'Quantity': data.quantity,
        'Delivery ZIP': data.delivery_zip,
        'Required Date': data.required_date,
        'Status': data.status,
        'Created At': new Date().toISOString(),
      },
    }),
  });

  return {
    id: response.id,
    ...data,
  };
}

export async function getRFQRequest(id: string): Promise<RFQRequest | null> {
  try {
    const response = await airtableRequest(`RFQ Requests/${id}`);
    return mapAirtableRecordToRFQRequest(response);
  } catch (error) {
    console.error('Error fetching RFQ request:', error);
    return null;
  }
}

export async function getRFQRequestsByEmail(email: string): Promise<RFQRequest[]> {
  try {
    const response = await airtableRequest(
      `RFQ Requests?filterByFormula={Customer Email}="${email}"&sort[0][field]=Created At&sort[0][direction]=desc`
    );
    return response.records.map(mapAirtableRecordToRFQRequest);
  } catch (error) {
    console.error('Error fetching RFQ requests:', error);
    return [];
  }
}

// Offers
export async function createOffer(data: Offer): Promise<Offer> {
  const response = await airtableRequest('Offers', {
    method: 'POST',
    body: JSON.stringify({
      fields: {
        'RFQ ID': [data.rfq_id],
        'Supplier ID': [data.supplier_id],
        'Price': data.price,
        'Notes': data.notes || '',
        'Delivery Date': data.delivery_date || '',
        'Status': data.status,
        'Created At': new Date().toISOString(),
        'Updated At': new Date().toISOString(),
        'Magic Link Token': data.magic_link_token || '',
        'Magic Link Expires': data.magic_link_expires || '',
      },
    }),
  });

  return {
    id: response.id,
    ...data,
  };
}

export async function getOfferByToken(token: string): Promise<Offer | null> {
  try {
    const response = await airtableRequest(
      `Offers?filterByFormula={Magic Link Token}="${token}"`
    );
    if (response.records.length === 0) return null;
    return mapAirtableRecordToOffer(response.records[0]);
  } catch (error) {
    console.error('Error fetching offer:', error);
    return null;
  }
}

export async function getOffersByRFQ(rfqId: string): Promise<Offer[]> {
  try {
    const response = await airtableRequest(
      `Offers?filterByFormula={RFQ ID}="${rfqId}"`
    );
    return response.records.map(mapAirtableRecordToOffer);
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
}

export async function updateOffer(id: string, data: Partial<Offer>): Promise<Offer> {
  const fields: Record<string, any> = {};
  
  if (data.price !== undefined) fields['Price'] = data.price;
  if (data.notes !== undefined) fields['Notes'] = data.notes;
  if (data.delivery_date !== undefined) fields['Delivery Date'] = data.delivery_date;
  if (data.status !== undefined) fields['Status'] = data.status;
  fields['Updated At'] = new Date().toISOString();

  const response = await airtableRequest(`Offers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields }),
  });

  return mapAirtableRecordToOffer(response);
}

// Products
export async function getProduct(productId: string): Promise<Product | null> {
  try {
    const response = await airtableRequest(
      `Products?filterByFormula={Product ID}="${productId}"`
    );
    if (response.records.length === 0) return null;
    return mapAirtableRecordToProduct(response.records[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Suppliers
export async function getSuppliersByProduct(productId: string): Promise<Supplier[]> {
  try {
    // First get product-supplier assignments
    const assignments = await airtableRequest(
      `Product Suppliers?filterByFormula={Product ID}="${productId}"`
    );
    
    if (assignments.records.length === 0) return [];

    // Get supplier IDs
    const supplierIds = assignments.records
      .map((record: any) => record.fields['Supplier ID'])
      .filter(Boolean);

    if (supplierIds.length === 0) return [];

    // Get suppliers
    const formula = supplierIds.map((id: string) => `RECORD_ID()="${id}"`).join(',');
    const response = await airtableRequest(
      `Suppliers?filterByFormula=OR(${formula})`
    );

    return response.records.map(mapAirtableRecordToSupplier);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return [];
  }
}

// Helper functions to map Airtable records to our types
function mapAirtableRecordToRFQRequest(record: any): RFQRequest {
  return {
    id: record.id,
    request_number: record.fields['Request Number'] || '',
    customer_email: record.fields['Customer Email'] || '',
    customer_name: record.fields['Customer Name'] || '',
    product_id: record.fields['Product ID'] || '',
    product_name: record.fields['Product Name'] || '',
    quantity: record.fields['Quantity'] || 0,
    delivery_zip: record.fields['Delivery ZIP'] || '',
    required_date: record.fields['Required Date'] || '',
    status: record.fields['Status'] || 'pending',
    created_at: record.fields['Created At'] || '',
    closed_at: record.fields['Closed At'] || '',
    winning_offer_id: record.fields['Winning Offer ID'] || '',
  };
}

function mapAirtableRecordToOffer(record: any): Offer {
  return {
    id: record.id,
    rfq_id: Array.isArray(record.fields['RFQ ID']) ? record.fields['RFQ ID'][0] : record.fields['RFQ ID'] || '',
    supplier_id: Array.isArray(record.fields['Supplier ID']) ? record.fields['Supplier ID'][0] : record.fields['Supplier ID'] || '',
    price: record.fields['Price'] || 0,
    notes: record.fields['Notes'] || '',
    delivery_date: record.fields['Delivery Date'] || '',
    status: record.fields['Status'] || 'pending',
    created_at: record.fields['Created At'] || '',
    updated_at: record.fields['Updated At'] || '',
    magic_link_token: record.fields['Magic Link Token'] || '',
    magic_link_expires: record.fields['Magic Link Expires'] || '',
  };
}

function mapAirtableRecordToProduct(record: any): Product {
  return {
    id: record.id,
    product_id: record.fields['Product ID'] || '',
    name: record.fields['Name'] || '',
    description: record.fields['Description'] || '',
  };
}

function mapAirtableRecordToSupplier(record: any): Supplier {
  return {
    id: record.id,
    name: record.fields['Name'] || '',
    email: record.fields['Email'] || '',
    phone: record.fields['Phone'] || '',
    notes: record.fields['Notes'] || '',
  };
}
