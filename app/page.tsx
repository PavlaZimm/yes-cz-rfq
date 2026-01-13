export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-yes-blue mb-4">
          RFQ Systém - Yes.cz
        </h1>
        <p className="text-yes-gray text-lg mb-8">
          Aukce nejnižší ceny pro fotovoltaické komponenty
        </p>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-yes-blue mb-4">
            Vítejte v RFQ systému
          </h2>
          <p className="text-yes-gray mb-4">
            Systém je ve vývoji. Brzy zde bude formulář pro poptávku ceny.
          </p>
          <a href="/products" className="btn-primary inline-block">
            Prohlédnout produkty
          </a>
        </div>
      </div>
    </main>
  );
}
