import { fetchFlippingData } from "@/lib/api";
import DecantingCalculator from "@/components/DecantingCalculator";

export const revalidate = 300; // Revalidate every 5 minutes

export default async function DecantingPage() {
    const data = await fetchFlippingData();

    return (
        <main>
            <DecantingCalculator items={data} />
        </main>
    );
}
