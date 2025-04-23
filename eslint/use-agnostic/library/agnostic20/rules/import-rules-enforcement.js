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
import { importFlow, exportFlow } from "../utilities/flows.js";

// // TEST START
// import {
//   getCommentedDirectiveFromCurrentModule,
//   getVerifiedCommentedDirective,
// } from "../../directive21/utilities/core/helpers.js";
// // TEST END

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
    // console.log({ currentFilename: context.filename });

    // GETTING THE EXTENSION OF THE CURRENT FILE
    const currentFileExtension = path.extname(context.filename);

    // fails if the file is not JavaScript (TypeScript)
    const iscurrentFileJS = EXTENSIONS.some(
      (ext) => currentFileExtension === ext,
    );
    if (!iscurrentFileJS) {
      console.error(
        "ERROR. Linted files for this rule should only be in JavaScript (TypeScript).",
      );
      return {};
    }

    // // TEST START
    // const commentedDirective = getCommentedDirectiveFromCurrentModule(context);
    // console.log({ commentedDirective });
    // const verifiedCommentedDirective = getVerifiedCommentedDirective(
    //   commentedDirective,
    //   currentFileExtension,
    // );
    // console.log({ verifiedCommentedDirective });
    // // TEST END

    /* GETTING THE DIRECTIVE (or lack thereof) OF THE CURRENT FILE */
    const currentFileDirective = getDirectiveFromCurrentModule(context);

    // reports if a file marked "use server" has a JSX extension
    if (
      currentFileDirective === "use server" &&
      currentFileExtension.endsWith("x")
    ) {
      context.report({
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: context.sourceCode.lines[0].length },
        },
        messageId: useServerJSXMessageId,
      });
      return {};
    }

    // GETTING THE EFFECTIVE DIRECTIVE OF THE CURRENT FILE
    const currentFileEffectiveDirective = getEffectiveDirective(
      currentFileDirective,
      currentFileExtension,
    );

    // fails if one of the seven effective directives has not been obtained
    if (currentFileEffectiveDirective === null) {
      console.error("ERROR. Effective directive should never be null.");
      return {};
    }

    // console.log({
    //   currentFileDirective,
    //   currentFileExtension,
    //   currentFileEffectiveDirective,
    // });

    return {
      ImportDeclaration: (node) =>
        importFlow(context, node, currentFileEffectiveDirective),
      ExportNamedDeclaration: (node) =>
        exportFlow(context, node, currentFileEffectiveDirective),
      ExportAllDeclaration: (node) =>
        exportFlow(context, node, currentFileEffectiveDirective),
    };
  },
};

export default rule; // enforce-effective-directives-import-rules
