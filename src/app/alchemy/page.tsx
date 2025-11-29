import AlchemyCalculator from "@/components/AlchemyCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Alchemy Calculator - GE Flip",
    description: "Calculate high alchemy profits for Old School RuneScape items. Find the most profitable items to alch.",
};

export const revalidate = 3600; // Revalidate hourly (prices don't need to be super fresh for alch lookup, but good to have)

export default async function AlchemyPage() {
    return (
        <main>
            <AlchemyCalculator />
        </main>
    );
}
