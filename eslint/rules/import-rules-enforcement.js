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
        "A Server Functions Module is not allowed to have a JSX file extension. ",
    },
  },
  create: (context) => {
    // console.log({ currentFilename: context.filename });

    /* GETTING THE DIRECTIVE (or lack thereof) OF THE CURRENT FILE */
    const currentFileDirective = getDirectiveFromCurrentModule(context);
    // GETTING THE EXTENSION OF THE CURRENT FILE
    const currentFileExtension = path.extname(context.filename);

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
        const isJS = EXTENSIONS.some((ext) => resolvedImportPath.endsWith(ext));
        if (!isJS) return;

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
    };
  },
};

export default rule; // enforce-effective-directives-import-rules
