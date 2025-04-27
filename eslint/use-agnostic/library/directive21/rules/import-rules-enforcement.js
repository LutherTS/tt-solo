import { importBreaksImportRulesMessageId } from "../constants/bases.js";

import { currentFileFlow, importFlow } from "../utilities/flows.js";

/** @type {import('@typescript-eslint/utils').TSESLint.RuleModule<typeof useServerJSXMessageId | typeof importBreaksImportRulesMessageId | typeof reExportNotSameMessageId, []>} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforces import rules based on the file's commented directive. ",
    },
    schema: [],
    messages: {
      [importBreaksImportRulesMessageId]: `{{ effectiveDirectiveMessage }} 
In this case, {{ specificViolationMessage }} `,
    },
  },
  create: (context) => {
    const result = currentFileFlow(context);

    if (result.skip) return {};
    const { verifiedCommentedDirective } = result;
    console.log({ verifiedCommentedDirective });

    return {
      ImportDeclaration: (node) =>
        importFlow(context, node, verifiedCommentedDirective),
      // ExportNamedDeclaration: (node) =>
      // !! TWO ROUTES (if (node.source === null); else;)
      //   reExportFlow(context, node, verifiedCommentedDirective),
      // ExportAllDeclaration: (node) =>
      //   reExportFlow(context, node, verifiedCommentedDirective),
    };
  },
};

export default rule; // enforce-commented-directives-import-rules
