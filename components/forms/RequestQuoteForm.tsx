'use client';

import { useState } from 'react';
import { RequestQuoteFormData } from '@/lib/types';

interface RequestQuoteFormProps {
  productId: string;
  productName: string;
  onSubmit?: (data: RequestQuoteFormData) => void;
}

export default function RequestQuoteForm({ 
  productId, 
  productName,
  onSubmit 
}: RequestQuoteFormProps) {
  const [formData, setFormData] = useState<RequestQuoteFormData>({
    product_id: productId,
    product_name: productName,
    quantity: 1,
    delivery_zip: '',
    required_date: '',
    customer_email: '',
    customer_name: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Chyba při odesílání poptávky');
      }

      setSubmitStatus('success');
      if (onSubmit) {
        onSubmit(formData);
      }

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          product_id: productId,
          product_name: productName,
          quantity: 1,
          delivery_zip: '',
          required_date: '',
          customer_email: '',
          customer_name: '',
        });
        setSubmitStatus('idle');
      }, 3000);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Neznámá chyba');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-2xl font-bold text-yes-blue mb-4">
        Poptat cenu
      </h3>
      <p className="text-yes-gray mb-6">
        Vyplňte formulář a my vám zašleme nejlepší nabídku od našich dodavatelů.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="product_name" className="block text-sm font-medium text-yes-dark mb-1">
            Produkt
          </label>
          <input
            type="text"
            id="product_name"
            name="product_name"
            value={formData.product_name}
            disabled
            className="input-field bg-gray-50 cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-yes-dark mb-1">
            Množství *
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            required
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="delivery_zip" className="block text-sm font-medium text-yes-dark mb-1">
            PSČ místa dodání *
          </label>
          <input
            type="text"
            id="delivery_zip"
            name="delivery_zip"
            value={formData.delivery_zip}
            onChange={handleChange}
            pattern="[0-9]{5}"
            placeholder="12345"
            required
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="required_date" className="block text-sm font-medium text-yes-dark mb-1">
            Termín dodání *
          </label>
          <input
            type="date"
            id="required_date"
            name="required_date"
            value={formData.required_date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="customer_email" className="block text-sm font-medium text-yes-dark mb-1">
            E-mail *
          </label>
          <input
            type="email"
            id="customer_email"
            name="customer_email"
            value={formData.customer_email}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="customer_name" className="block text-sm font-medium text-yes-dark mb-1">
            Jméno (volitelné)
          </label>
          <input
            type="text"
            id="customer_name"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        {submitStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            <p className="font-semibold">Poptávka byla úspěšně odeslána!</p>
            <p className="text-sm mt-1">Brzy vám přijde potvrzovací e-mail s číslem poptávky.</p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-semibold">Chyba při odesílání</p>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Odesílám...' : 'Odeslat poptávku'}
        </button>
      </form>
    </div>
  );
}
