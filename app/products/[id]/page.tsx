import RequestQuoteForm from '@/components/forms/RequestQuoteForm';
import { getProduct } from '@/lib/airtable';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // In a real app, you'd fetch the product from Airtable
  // For now, we'll use the ID from params
  const product = await getProduct(params.id);

  const productName = product?.name || `Produkt ${params.id}`;
  const productId = product?.product_id || params.id;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-yes-blue mb-4">
              {productName}
            </h1>
            {product?.description && (
              <p className="text-yes-gray text-lg">
                {product.description}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-yes-blue mb-4">
                Informace o produktu
              </h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-yes-gray">ID produktu</dt>
                  <dd className="text-yes-dark font-semibold">{productId}</dd>
                </div>
                {product?.description && (
                  <div>
                    <dt className="text-sm font-medium text-yes-gray">Popis</dt>
                    <dd className="text-yes-dark">{product.description}</dd>
                  </div>
                )}
              </dl>
            </div>

            <RequestQuoteForm 
              productId={productId}
              productName={productName}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
