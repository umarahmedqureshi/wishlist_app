import {
  Box,
  Card,
  Page,
  Text,
  BlockStack,
  InlineGrid,
  TextField,
  Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { json } from "@remix-run/node";
import { useState } from "react";
import { useLoaderData, Form } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export async function loader({ request}) {
  const { session } = await authenticate.admin(request);
  // get data from database if it exists. If not return empty object
  let settings = await db.settings.findFirst({
    where: {
      shop: session.shop,
    },
  });

  if (!settings) {
    settings = {};
  }
  return json(settings);
}

export async function action({ request }) {
  // updates persistent data
  let settings = await request.formData();
  settings = Object.fromEntries(settings);
  const { session } = await authenticate.admin(request);

  // update database
  await db.settings.upsert({
    where: { shop: session.shop },
    update: {
      name: settings.name,
      description: settings.description,
      shop: session.shop
    },
    create: {
      id: 1,
      name: settings.name,
      description: settings.description,
      shop: session.shop
    }
  })

  // return json({message: "Settings Upadtaea"});
  return json(settings);
}

export default function SettingsPage() {
  const settings = useLoaderData();
  const [formState, setFormState] = useState(settings);

  return (
    <Page>
      <TitleBar title="Settings" />
      <BlockStack gap={{ xs: "800", sm: "400" }}>
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: 400, sm: 0 }}
            paddingInlineEnd={{ xs: 400, sm: 0 }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Settings
              </Text>
              <Text as="p" variant="bodyMd">
                Upadte app settings and preferences.
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            <Form method="POST">
              <BlockStack gap="400">
                <TextField label="App name" name="name" value={formState?.name} onChange={(value) => setFormState({ ...formState, name: value })}/>
                <TextField label="Description" name="description" value={formState?.description} onChange={(value) => setFormState({ ...formState, description: value })}/>
                <Button submit={true}>Save</Button>
              </BlockStack>
            </Form>
          </Card>
        </InlineGrid>
        {/* {smUp ? <Divider /> : null} */}
        {/* <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: 400, sm: 0 }}
            paddingInlineEnd={{ xs: 400, sm: 0 }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Dimensions
              </Text>
              <Text as="p" variant="bodyMd">
                Interjambs are the rounded protruding bits of your puzzlie piece
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <TextField label="Horizontal" />
              <TextField label="Interjamb ratio" />
            </BlockStack>
          </Card>
        </InlineGrid> */}
      </BlockStack>
    </Page>
  );
}

function Code({ children }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="100"
      paddingInlineEnd="100"
      background="bg-surface-active"
      borderWidth="025"
      borderColor="border"
      borderRadius="100"
    >
      <code>{children}</code>
    </Box>
  );
}
