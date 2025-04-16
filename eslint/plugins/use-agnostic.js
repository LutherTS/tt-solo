import {
  forUseServerRuleName,
  forUseClientRuleName,
  forUseAgnosticRuleName,
} from "../helpers/agnostic20.js";

import serverFunctionsNoImportClient from "../rules/for-use-server.js";
import clientNoImportServer from "../rules/for-use-client.js";
import agnosticImportAgnosticOnly from "../rules/for-use-agnostic.js";

const plugin = {
  rules: {
    [forUseServerRuleName]: serverFunctionsNoImportClient,
    [forUseClientRuleName]: clientNoImportServer,
    [forUseAgnosticRuleName]: agnosticImportAgnosticOnly,
  },
};

export default plugin;
