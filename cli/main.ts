#!/usr/bin/env node
import { createCLI } from "./src/cli";

const cli = createCLI({
  name: "create-docus-plus",
  description: "Create a new Docus Plus documentation project"
});

cli.runMain();
