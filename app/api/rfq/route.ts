import { NextRequest, NextResponse } from 'next/server';
import { createRFQRequest, getSuppliersByProduct } from '@/lib/airtable';
import { triggerMakeWebhook, generateMagicLinkToken, calculateExpirationDate } from '@/lib/make-webhook';
import { RequestQuoteFormData } from '@/lib/types';

/**
 * Generates a unique request number
 */
function generateRequestNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `RFQ-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const data: RequestQuoteFormData = await request.json();

    // Validate required fields
    if (!data.product_id || !data.quantity || !data.delivery_zip || !data.required_date || !data.customer_email) {
      return NextResponse.json(
        { error: 'Chybí povinné údaje' },
        { status: 400 }
      );
    }

    // Generate request number
    const requestNumber = generateRequestNumber();

    // Create RFQ request in Airtable
    const rfqRequest = await createRFQRequest({
      request_number: requestNumber,
      customer_email: data.customer_email,
      customer_name: data.customer_name,
      product_id: data.product_id,
      product_name: data.product_name,
      quantity: data.quantity,
      delivery_zip: data.delivery_zip,
      required_date: data.required_date,
      status: 'open',
    });

    // Get suppliers for this product
    const suppliers = await getSuppliersByProduct(data.product_id);

    // Trigger Make.com webhook to send emails to suppliers
    if (suppliers.length > 0) {
      // Generate magic links for each supplier
      const supplierLinks = suppliers.map(supplier => ({
        supplier_id: supplier.id!,
        supplier_email: supplier.email,
        supplier_name: supplier.name,
        magic_link_token: generateMagicLinkToken(),
        expires_at: calculateExpirationDate(7),
      }));

      await triggerMakeWebhook('rfq_created', {
        rfq_id: rfqRequest.id,
        request_number: requestNumber,
        product_name: data.product_name,
        quantity: data.quantity,
        delivery_zip: data.delivery_zip,
        required_date: data.required_date,
        customer_email: data.customer_email,
        customer_name: data.customer_name,
        suppliers: supplierLinks,
      });
    }

    // Send confirmation email to customer via Make.com
    await triggerMakeWebhook('rfq_confirmation', {
      request_number: requestNumber,
      customer_email: data.customer_email,
      customer_name: data.customer_name,
      product_name: data.product_name,
      quantity: data.quantity,
      delivery_zip: data.delivery_zip,
      required_date: data.required_date,
    });

    return NextResponse.json({
      success: true,
      request_number: requestNumber,
      rfq_id: rfqRequest.id,
    });
  } catch (error) {
    console.error('Error creating RFQ request:', error);
    return NextResponse.json(
      { error: 'Chyba při vytváření poptávky' },
      { status: 500 }
    );
  }
}
