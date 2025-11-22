import { fetchFlippingData } from "@/lib/api";
import AlchemyCalculator from "@/components/AlchemyCalculator";

export const revalidate = 3600; // Revalidate hourly (prices don't need to be super fresh for alch lookup, but good to have)

export default async function AlchemyPage() {
    const data = await fetchFlippingData();

    return (
        <main>
            <AlchemyCalculator items={data} />
        </main>
    );
}
