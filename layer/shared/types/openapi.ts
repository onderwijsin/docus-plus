/**
 * The OpenAPI input shared by Scalar and the build-time Content generator.
 *
 * Local files must live below `public/` so Scalar can request the same file in
 * the browser that the generator reads during the Nuxt build.
 */
export type OpenApiSource =
  | {
      type: "remote";
      url: string;
    }
  | {
      type: "local";
      publicPath: string;
    }
  | {
      type: "inline";
      content: unknown;
    };
