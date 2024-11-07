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

export async function action({ request }) {
    // const method = request.method;
    let data = await request.formData();
    data = Object.fromEntries(data);
    const customerId = data.customerId;
    const productId = data.productId;
    const shop = data.shop;
    const _action = data._action;

    if(!customerId || !productId || !shop || !_action){
        return json({
            message: "Missing data. Required data: CustomerId, productId, shop, _action",
            method: _action
        })
    }

    let response;

    switch (_action) {
        case "CREATE":

            // Handle POST request logic here
            // For example, adding a nrew item to the wishlist
            const wishlist = await db.wishlist.create({
                data: {
                    customerId,
                    productId,
                    shop,
                },
            });

            response = json({ message: "Product added to wishlist", method: _action, wishlisted: true });
            return cors(request, response);
        case "PATCH":
            // Handle PATCH request logic here
            // For example, updating an existing item in the wishlist  
            return json({ message: "Success", method: "PATCH"});

        case "DELETE":
            // Handle DELETE request logic here (Not tested)
            // For example, removing an item from the wishlist
            await db.wishlist.deleteMany({
                where: {
                    customerId: customerId,
                    productId: productId,
                    shop: shop,
                },
            });
            response = json({ message: "Product removed from your wishlist", method: _action, wishlisted: false });
            return cors(request, response);

        default:
            // Optional: handle other methods or return a method not allowed response
            return new Response("Method Not Allowed", { status: 405 });
    }
}