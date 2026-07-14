import { defineContentConfig, defineCollection, z } from "@nuxt/content";
import { createOpenApiContentSource } from "./modules/openapi/build/openapi-content";
import { getOpenApiSource, hasOpenApiSource } from "./modules/openapi/build/openapi";

import { useNuxt } from "@nuxt/kit";
import { joinURL } from "ufo";

const { options } = useNuxt();
const cwd = joinURL(options.rootDir, "content");

/**
 * Since we want to do various customization on the content collections, we are
 * recreating the collection config from docus. We are mostly following their
 * implementation (while dropping some unnecessary parts), and overriding
 * some parts.
 *
 * Whats dropped
 * - locales
 * - docs prefix
 *
 * For original @see https://github.com/nuxt-content/docus/blob/main/layer/content.config.ts
 */

const createDocsSchema = () =>
  z.object({
    links: z
      .array(
        z.object({
          label: z.string(),
          icon: z.string(),
          to: z.string(),
          target: z.string().optional(),
        }),
      )
      .optional(),
  });

const createEnum = (options: [string, ...string[]]) => z.enum(options);

const createLinkSchema = () =>
  z.object({
    label: z.string().nonempty(),
    to: z.string().nonempty(),
    icon: z.string().optional().editor({ input: "icon" }),
    trailingIcon: z.string().optional().editor({ input: "icon" }),
    size: createEnum(["xs", "sm", "md", "lg", "xl"]).optional(),
    trailing: z.boolean().optional(),
    target: createEnum(["_blank", "_self"]).optional(),
    color: createEnum([
      "primary",
      "secondary",
      "neutral",
      "error",
      "warning",
      "success",
      "info",
    ]).optional(),
    variant: createEnum([
      "solid",
      "outline",
      "subtle",
      "soft",
      "ghost",
      "link",
    ]).optional(),
  });

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: "page",
      source: {
        cwd,
        include: "docs/**",
        prefix: "/",
        exclude: ["index.md"],
      },
      schema: createDocsSchema(),
    }),

    landing: defineCollection({
      source: {
        cwd,
        include: "index.yml",
      },
      type: "page",
      schema: z.object({
        seo: z.object({
          title: z.string(),
          description: z.string(),
          ogImage: z.string(),
        }),
        hero: z.object({
          headline: z.string().optional(),
          title: z.string().nonempty(),
          title_as_html: z.boolean().optional().default(false),
          description: z.string().nonempty(),
          links: z.array(createLinkSchema()),
        }),
        features: z.object({
          headline: z.string().optional(),
          title: z.string().nonempty(),
          description: z.string().nonempty(),
          items: z.array(
            z.object({
              icon: z.string(),
              title: z.string().nonempty(),
              description: z.string().nonempty(),
            }),
          ),
        }),
        cta: z.object({
          title: z.string().nonempty(),
          description: z.string().nonempty(),
          links: z.array(createLinkSchema()),
        }),
      }),
    }),
    api: defineCollection({
      type: "page",
      source: hasOpenApiSource()
        ? createOpenApiContentSource(getOpenApiSource())
        : undefined,
      schema: z.object({
        kind: z.enum(["info", "tag", "operation", "schema"]),
        scalarTarget: z.string(),
        method: z.string().optional(),
        path: z.string().optional(),
        operationId: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    }),
  },
});
