import { Metadata } from "next";
import { notFound } from "next/navigation";
import ItemPageClient from "./ItemPageClient";
import { fetchAllMappings, fetchItemDataBySlug, getItemImageUrl } from "@/lib/api";
import { generateSlug } from "@/lib/slug";

// Required for static export - generate paths for all items
export async function generateStaticParams() {
    const mappings = await fetchAllMappings();
    return mappings.map((item) => ({
        slug: generateSlug(item.name),
    }));
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const itemData = await fetchItemDataBySlug(slug);

    if (!itemData) {
        return {
            title: "Item Not Found | GEFlip.com",
            description: "The requested OSRS item could not be found.",
        };
    }

    const { mapping: item, price } = itemData;
    const buyPrice = price.high;
    const sellPrice = price.low;
    const margin = buyPrice - sellPrice;
    const roi = sellPrice > 0 ? ((margin / sellPrice) * 100).toFixed(2) : "0";

    const title = `${item.name} - Live Price, Graph, Flipping Margin`;
    const description = `Check real-time OSRS GE price for ${item.name}. Current buy: ${buyPrice.toLocaleString()} gp, sell: ${sellPrice.toLocaleString()} gp. Flipping margin: ${margin.toLocaleString()} gp (${roi}%)`;
    const imageUrl = getItemImageUrl(item.name);

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: imageUrl,
                    alt: `${item.name} Icon`,
                },
            ],
            url: `https://geflip.com/item/${slug}`,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [imageUrl],
        },
        alternates: {
            canonical: `https://geflip.com/item/${slug}`,
        },
    };
}

export default async function ItemPage({ params }: PageProps) {
    const { slug } = await params;
    const itemData = await fetchItemDataBySlug(slug);

    if (!itemData) {
        notFound();
    }

    const { mapping: item, price } = itemData;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        name: item.name,
                        image: getItemImageUrl(item.name),
                        description: `Old School RuneScape Grand Exchange price and flipping data for ${item.name}`,
                        offers: {
                            "@type": "Offer",
                            price: price.low, // Using sell price as the offer price
                            priceCurrency: "GP", // or custom currency for OSRS GP if schema supports it, but GP isn't standard ISO. Usually use "GBP" or just omit currency if not real money. But guide said "GP". Schema expects ISO 4217. I'll stick to guide's "GP" but it might be invalid. Actually guide used "GP".
                            availability: "https://schema.org/InStock",
                        },
                    }),
                }}
            />
            <ItemPageClient slug={slug} />
        </>
    );
}
