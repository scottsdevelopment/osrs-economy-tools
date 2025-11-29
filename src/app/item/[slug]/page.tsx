import ItemPageClient from "./ItemPageClient";
import { fetchAllMappings } from "@/lib/api";
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

export default async function ItemPage({ params }: PageProps) {
    const { slug } = await params;
    return <ItemPageClient slug={slug} />;
}
