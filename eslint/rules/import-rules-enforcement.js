import path from "path";

import {
  effectiveDirectiveMessageId,
  specificViolationMessageId,
  useServerJSXMessageId,
  getDirectiveFromCurrentModule,
  getEffectiveDirective,
  resolveImportPath,
  EXTENSIONS,
  getDirectiveFromImportedModule,
  isImportBlocked,
  makeMessageFromEffectiveDirective,
  findSpecificViolationMessage,
  isPascalCase,
} from "../helpers/agnostic20.js";

/** @type {import('@typescript-eslint/utils').TSESLint.RuleModule<typeof effectiveDirectiveMessageId | typeof specificViolationMessageId | typeof useServerJSXMessageId, []>} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforces import rules based on the file's effective directive.",
    },
    schema: [],
    messages: {
      [effectiveDirectiveMessageId]: "{{ effectiveDirectiveMessage }}",
      [specificViolationMessageId]: "{{ specificViolationMessage }}",
      [useServerJSXMessageId]:
        "Modules marked with the 'use server' directive are not allowed to have JSX file extensions. ",
    },
  },
  create: (context) => {
    // console.log({ currentFilename: context.filename });

    // GETTING THE EXTENSION OF THE CURRENT FILE
    const currentFileExtension = path.extname(context.filename);

    // fail if the file is not JavaScript (TypeScript)
    const iscurrentFileJS = EXTENSIONS.some(
      (ext) => currentFileExtension === ext,
    );
    if (!iscurrentFileJS) {
      console.error(
        "ERROR. Linted files for this rule should only be in JavaScript (TypeScript).",
      );
      return {};
    }

    /* GETTING THE DIRECTIVE (or lack thereof) OF THE CURRENT FILE */
    const currentFileDirective = getDirectiveFromCurrentModule(context);

    // report if a file marked "use server" has a JSX extension
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

    // fail if one of the seven effective directives has not been obtained
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
      ImportDeclaration: (node) => {
        // does not operate on `import type`
        if (node.importKind === "type") return;

        // finds the full path of the import
        const resolvedImportPath = resolveImportPath(
          path.dirname(context.filename),
          node.source.value,
          context.cwd,
        );

        // does not operates on paths it did not resolve
        if (resolvedImportPath === null) return;
        // does not operate on non-JS files
        const isImportedFileJS = EXTENSIONS.some((ext) =>
          resolvedImportPath.endsWith(ext),
        );
        if (!isImportedFileJS) return;

        /* GETTING THE DIRECTIVE (or lack thereof) OF THE IMPORTED FILE */
        const importedFileDirective =
          getDirectiveFromImportedModule(resolvedImportPath);
        // GETTING THE EXTENSION OF THE IMPORTED FILE
        const importedFileFileExtension = path.extname(resolvedImportPath);
        // GETTING THE EFFECTIVE DIRECTIVE OF THE IMPORTED FILE
        const importedFileEffectiveDirective = getEffectiveDirective(
          importedFileDirective,
          importedFileFileExtension,
        );

        // also fail if one of the seven effective directives has not been obtained
        if (importedFileEffectiveDirective === null) {
          console.error("ERROR. Effective directive should never be null.");
          return;
        }

        // console.log({
        //   importedFileDirective,
        //   importedFileFileExtension,
        //   importedFileEffectiveDirective,
        // });

        if (
          isImportBlocked(
            currentFileEffectiveDirective,
            importedFileEffectiveDirective,
          )
        ) {
          // for the imports rules
          context.report({
            node,
            messageId: effectiveDirectiveMessageId,
            data: {
              effectiveDirectiveMessage: makeMessageFromEffectiveDirective(
                currentFileEffectiveDirective,
              ),
            },
          });
          // for the specific violation at hand
          context.report({
            node,
            messageId: specificViolationMessageId,
            data: {
              specificViolationMessage: findSpecificViolationMessage(
                currentFileEffectiveDirective,
                importedFileEffectiveDirective,
              ),
            },
          });
        }
      },

      /* Because I already have the file extension here (currentFileExtension), this is where I can make sure that ...
      - if it ends with "x" for JSX, it only exports React Components
      - if it doesn't end with "x", it does not export React Components
      - if it ends with "x" for JSX, it only re-exports from JS/TS files that also end with "x" for JSX
      - if it doesn't end with "x", it only re-exports from JS/TS files that also do not end with "x" for JSX
      ... so that I don't need to gather this intel one more time.

      Indeed, I've been securing imports. Now I shall secure exports too. Both globally as detailed above, and per effective directive to ensure that re-exports are only from the same effective directive. (This is for the Agnostic-Included Architecture. Agnostic Strategies Modules do it differently in the Directive-First Architecture.)
      */

      ExportNamedDeclaration: (node) => {
        // does not operate on `export type`
        if (node.exportKind === "type") return;

        // if (node.specifiers.length > 0)
        //   console.log({ ExportNamedDeclaration: node.specifiers });
        // else if (node.source === null) console.log(node.body);

        // export const/function x (source is null)
        // export { x } (source is null)
        // export { x } from "y"; (including x as default) (has source)
        // console.log({ currentFilename: context.filename });
        // console.log({ ExportNamedDeclaration: node.specifiers });
      },
      ExportDefaultDeclaration: (node) => {
        // does not operate on `export type`
        if (node.exportKind === "type") return;

        if (currentFileExtension.endsWith("x")) {
          console.log("ends with x", {
            currentFileExtension,
          });
          console.log({ currentFilename: context.filename });
          if (node.declaration.type === "Identifier")
            console.log(node.declaration.name);
          else console.log(node.declaration.id.name);
        } else {
          console.log("does not end with x", {
            currentFileExtension,
          });
          console.log({ currentFilename: context.filename });
          if (node.declaration.type === "Identifier")
            console.log(node.declaration.name);
          else console.log(node.declaration.id.name);
        }

        // export default /* const/function */ x (only from own file)
        // ! need make sure that it is only PascalCase on ... currentFileExtension.endsWith("x").
        // console.log({ currentFilename: context.filename });
        // console.log({ ExportDefaultDeclaration: node. });
      },
      ExportAllDeclaration: (node) => {
        // does not operate on `export type`
        if (node.exportKind === "type") return;

        // export * from "y"; (only from other file)
        // console.log({ currentFilename: context.filename });
        // console.log({ ExportAllDeclaration: node.source });
      },

      // ExportSpecifier: (node) => {
      //   // does not operate on `export type`
      //   if (node.exportKind === "type") return;

      //   // console.log({ currentFileExtension });

      // if (currentFileExtension.endsWith("x")) {
      //   console.log("ends with x", {
      //     currentFileExtension,
      //     name: node.exported.name,
      //   });
      // } else {
      //   console.log("does not end with x", {
      //     currentFileExtension,
      //     name: node.exported.name,
      //   });
      // }

      //   // export { x } from "y"; (the actual x as the specifier)
      //   console.log({ currentFilename: context.filename });
      //   console.log({ ExportSpecifier: node.exportKind });
      // },
      // All take node.exportKind so on ExportSpecifier:
      // - if node.exportKind !== "type" && isPascalCase(node.exported.name), only on ends with "x".
      // `export *` and `export default` don't have specifiers
      // ExportSpecifier only on ExportNamedDeclaration then, safe to be the only one where I check for isPascalCase.
    };
  },
};

export default rule; // enforce-effective-directives-import-rules
