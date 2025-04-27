import {
  reExportNotSameMessageId,
  importBreaksCommentedImportRulesMessageId,
  importNotStrategized,
  exportNotStrategized,
} from "../../_commons/constants/bases.js";

import {
  currentFileFlow,
  importsFlow,
  allExportsFlow,
} from "../utilities/flows.js";

/** @type {import('@typescript-eslint/utils').TSESLint.RuleModule<typeof importBreaksCommentedImportRulesMessageId | typeof reExportNotSameMessageId, []>} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforces import rules based on the file's commented directive. ",
    },
    schema: [],
    messages: {
      [reExportNotSameMessageId]: `The effective directives of this file and this re-export are dissimilar.
    Here, "{{ currentFileCommentedDirective }}" and "{{ importedFileCommentedDirective }}" are not the same. Please re-export only from modules that have the same effective directive as the current module. `,
      [importBreaksCommentedImportRulesMessageId]: `{{ commentedDirectiveMessage }} 
In this case, {{ specificViolationMessage }} `,
      [importNotStrategized]: `Imports from Agnostic Strategies Modules must be strategized (\`/* @serverLogics */\`, etc.).  
Please include a Strategy that corresponds to the kind of module this import would be mapped to. `,
      [exportNotStrategized]: `Exports from Agnostic Strategies Modules must be strategized (\`/* @serverLogics */\`, etc.).  
Please include a Strategy that corresponds to the kind of module this export would be mapped to. `,
    },
  },
  create: (context) => {
    const result = currentFileFlow(context);

    if (result.skip) return {};
    const { verifiedCommentedDirective } = result;
    // console.log({ verifiedCommentedDirective });

    return {
      ImportDeclaration: (node) =>
        importsFlow(context, node, verifiedCommentedDirective),
      ExportNamedDeclaration: (node) =>
        allExportsFlow(context, node, verifiedCommentedDirective),
      ExportAllDeclaration: (node) =>
        allExportsFlow(context, node, verifiedCommentedDirective),
      ExportDefaultDeclaration: (node) =>
        allExportsFlow(context, node, verifiedCommentedDirective),
    };
  },
};

export default rule; // enforce-commented-directives-import-rules
