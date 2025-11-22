import { fetchItemData } from "@/lib/api";
import ItemDetails from "@/components/ItemDetails";

export const revalidate = 60;

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ItemPage({ params }: PageProps) {
    const { id } = await params;
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
        return <div>Invalid Item ID</div>;
    }

    const data = await fetchItemData(itemId);

    if (!data) {
        return <div>Item not found</div>;
    }

    return (
        <main>
            <ItemDetails item={data.mapping} price={data.price} volume={data.volume} />
        </main>
    );
}
