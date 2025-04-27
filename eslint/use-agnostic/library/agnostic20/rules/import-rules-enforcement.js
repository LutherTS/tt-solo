import path from "path";

import { EXTENSIONS } from "../../_commons/constants/bases.js";
import {
  useServerJSXMessageId,
  importBreaksImportRulesMessageId,
  reExportNotSameMessageId,
} from "../constants/bases.js";

import {
  getDirectiveFromCurrentModule,
  getEffectiveDirective,
} from "../utilities/helpers.js";
import {
  currentFileFlow,
  importFlow,
  reExportFlow,
} from "../utilities/flows.js";

// TEST START
// import {
//   getCommentedDirectiveFromCurrentModule,
//   getVerifiedCommentedDirective,
// } from "../../directive21/utilities/core/helpers.js";
import {
  currentFileFlow as testCurrentFileFlow,
  importFlow as testImportFlow,
} from "../../directive21/utilities/flows.js";
// TEST END

/** @type {import('@typescript-eslint/utils').TSESLint.RuleModule<typeof useServerJSXMessageId | typeof importBreaksImportRulesMessageId | typeof reExportNotSameMessageId, []>} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforces import rules based on the file's effective directive. ",
    },
    schema: [],
    messages: {
      [useServerJSXMessageId]: `Modules marked with the 'use server' directive are not allowed to have JSX file extensions.  
Indeed, Server Functions Modules have no business exporting JSX. `,
      [importBreaksImportRulesMessageId]: `{{ effectiveDirectiveMessage }} 
In this case, {{ specificViolationMessage }} `,
      [reExportNotSameMessageId]: `The effective directives of this file and this re-export are dissimilar.
Here, "{{ currentFileEffectiveDirective }}" and "{{ importedFileEffectiveDirective }}" are not the same. Please re-export only from modules that have the same effective directive as the current module. `,
    },
  },
  create: (context) => {
    // const result = currentFileFlow(context);

    // if (result.skip) return {};
    // const { currentFileEffectiveDirective } = result;

    // TEST START
    // Now I can plugin direct21's currentFileFlow and get the commented directive for my tests.
    const result = testCurrentFileFlow(context);

    if (result.skip) return {};
    const { verifiedCommentedDirective } = result;
    console.log({ verifiedCommentedDirective });

    // return {};
    // TEST END

    return {
      ImportDeclaration: (node) =>
        testImportFlow(context, node, verifiedCommentedDirective),
      // importFlow(context, node, currentFileEffectiveDirective),
      // ExportNamedDeclaration: (node) =>
      //   reExportFlow(context, node, currentFileEffectiveDirective),
      // ExportAllDeclaration: (node) =>
      //   reExportFlow(context, node, currentFileEffectiveDirective),
    };
  },
};

export default rule; // enforce-effective-directives-import-rules
