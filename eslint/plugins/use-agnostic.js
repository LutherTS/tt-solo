import {
  // previous
  // forUseServerRuleName,
  // forUseClientRuleName,
  // forUseAgnosticRuleName,
  // next
  forUseServerLogicsRuleName,
  forUseServerComponentsRuleName,
  forUseServerFunctionsRuleName,
  forUseClientLogicsRuleName,
  forUseClientComponentsRuleName,
  forUseAgnosticLogicsRuleName,
  forUseAgnosticComponentsRuleName,
} from "../helpers/agnostic20.js";

// previous
// import serverFunctionsNoImportClient from "../rules/for-use-server.js";
// import clientNoImportServer from "../rules/for-use-client.js";
// import agnosticImportAgnosticOnly from "../rules/for-use-agnostic.js";
// next
import serverLogicsModulesImportRules from "../rules/for-use-server-logics.js";
import serverComponentsModulesImportRules from "../rules/for-use-server-components.js";
import serverFunctionsModulesImportRules from "../rules/for-use-server-functions.js";
import clientLogicsModulesImportRules from "../rules/for-use-client-logics.js";
import clientComponentsModulesImportRules from "../rules/for-use-client-components.js";
import agnosticLogicsModulesImportRules from "../rules/for-use-agnostic-logics.js";
import agnosticComponentsModulesImportRules from "../rules/for-use-agnostic-components.js";

const plugin = {
  rules: {
    // previous
    // [forUseServerRuleName]: serverFunctionsNoImportClient,
    // [forUseClientRuleName]: clientNoImportServer,
    // [forUseAgnosticRuleName]: agnosticImportAgnosticOnly,
    // next
    [forUseServerLogicsRuleName]: serverLogicsModulesImportRules,
    [forUseServerComponentsRuleName]: serverComponentsModulesImportRules,
    [forUseServerFunctionsRuleName]: serverFunctionsModulesImportRules,
    [forUseClientLogicsRuleName]: clientLogicsModulesImportRules,
    [forUseClientComponentsRuleName]: clientComponentsModulesImportRules,
    [forUseAgnosticLogicsRuleName]: agnosticLogicsModulesImportRules,
    [forUseAgnosticComponentsRuleName]: agnosticComponentsModulesImportRules,
  },
};

export default plugin;
