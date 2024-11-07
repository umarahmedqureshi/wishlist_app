import { json } from "@remix-run/node";
import db from "../db.server";
import { cors } from 'remix-utils/cors';

// GET request: fetch all wishlisted products for a given customer and store.
export async function loader({ request }) {
    const url = new URL(request.url);
    const customerId = url.searchParams.get("customerId");
    const shop = url.searchParams.get("shop");

    // Ensure customerId and shop parameters are provided
    if (!customerId || !shop) {
        return json({
            message: "Missing data. Required data: customerId, shop",
            method: "GET"
        });
    }

    try {
        // Query to fetch all wishlisted products for the customer in the specified shop
        const wishlist = await db.wishlist.findMany({
            where: {
                customerId: customerId,
                shop: shop,
            },
        });

        const response = json({
            ok: true,
            message: "Success",
            data: wishlist,
        });

        return cors(request, response);
    } catch (error) {
        // Handle database or other errors
        return json({
            ok: false,
            message: "Error fetching wishlist",
            error: error.message,
        });
    }
}
