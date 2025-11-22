import { fetchFlippingData } from "@/lib/api";
import FlippingFinder from "@/components/FlippingFinder";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const data = await fetchFlippingData();

  return (
    <main>
      <FlippingFinder initialData={data} />
    </main>
  );
}
