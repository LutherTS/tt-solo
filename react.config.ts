// Mocking a proposed reactConfig for a proposed react/framework.
type ReactConfig = any; // import { ReactConfig } from "react";

const reactConfig: ReactConfig = {
  // gives agency to project teams over where the react folder is positioned in the project and what its name is. By default, the react folder is positioned at the root of the project and named "react"
  reactDirectory: "/react",

  // gives react/framework a default understanding of modules under its agency that aren't (yet) marked with any directive, enforcing said modules to adhere to this default directive. undefined by default, meaning that files without directives within the agency of react/framework will throw an error.
  defaultDirective: undefined, // or "server" or "client" or "agnostic"

  // gives react/framework a default explicit direction over how it should perceive non-JavaScript folders and files as relevant JavaScript modules during imports in JavaScript modules react/framework has agency over, without strictly enforcing said files to be so (since such a feature is unexpected in non-JavaScript files). "agnostic" by default, meaning that since 'agnosticism' will not be enforced, react/framework will allow by default all external files to be imported in any environment at the discretion of the project itself. Cannot be undefined.
  externalDefaultDirective: "agnostic", // or "server" or "client"

  // gives react/framework agency over JavaScript folders and files such as utility modules beyond the react folder
  // Arrays or regexes could be used identify to folders and files, like "all folders named 'agnostic' should be considered as housing exclusively Agnostic Modules when it comes to their JavaScript and TypeScript files," or aliases or glob patterns (e.g., **/*.server.ts)
  javaScriptModules: {
    serverModules: {
      folders: [], // array of Server Module folders or regex
      files: [], // array of Server Module files or regex
      serverFunctionsModules: {
        folders: [], // array of Server Functions Module folders or regex
        files: [], // array of Server Functions Module files or regex
      },
    },
    agnosticModules: {
      folders: [], // array of Agnostic Module folders or regex
      files: [], // array of Agnostic Module files or regex
      agnosticAdaptiveModules: {
        folders: [], // array of Agnostic Adaptive Module folders or regex
        files: [], // array of Agnostic Adaptive Module files or regex
      },
    },
    clientModules: {
      folders: [], // array of Client Module folders or regex
      files: [], // array of Client Module files or regex
      clientComponentsModules: {
        folders: [], // array of Client Components Module folders or regex
        files: [], // array of Client Components Module files or regex
      },
    },
  },

  // gives react/framework explicit direction over how it should perceive non-JavaScript folders and files as relevant JavaScript modules during imports in JavaScript modules react/framework has agency over
  nonJavaScriptModules: {
    serverModules: {
      folders: [], // array of Server Module folders or regex
      files: [], // array of Server Module files or regex
      // serverFunctionsModules feels overkill here but we never know
      serverFunctionsModules: {
        folders: [], // array of Server Functions Module folders or regex
        files: [], // array of Server Functions Module files or regex
      },
    },
    agnosticModules: {
      folders: [], // array of Agnostic Module folders or regex
      files: [], // array of Agnostic Module files or regex
      agnosticAdaptiveModules: {
        folders: [], // array of Agnostic Adaptive Module folders or regex
        files: [], // array of Agnostic Adaptive Module files or regex
      },
    },
    clientModules: {
      folders: [], // array of Client Module folders or regex
      files: [], // array of Client Module files or regex
      clientComponentsModules: {
        folders: [], // array of Client Components Module folders or regex
        files: [], // array of Client Components Module files or regex
      },
    },
  },
};

export default reactConfig;

/* Notes
react/framework could/should implement defaults such that: 

- all files within folders inside the react folder named "server" are Server Modules by defaults
- all files within folders inside "server"-named folders named "functions" are Server Functions Modules by defaults
- all files within folders inside the react folder named "agnostic" are Agnostic Modules by defaults
- all files within folders inside "agnostic"-named folders named "adaptive" are Agnostic Adaptive Modules by defaults
- all files within folders inside the react folder named "client" are Client Modules by defaults
- all files within folders inside "client"-named folders named "components" are Client Components Modules by defaults

These defaults could obviously be overridden by the ReactConfig (though I haven't implemented this feature above yet), but explicitly written directives within modules ALWAYS SUPERCEDE CONFIG.

In an out of itself, by diligently applying directives within the react folder, and by positioning all utility files that interact with react files within the react folder along with their relevant directives, the React config is meant to be entirely optional.
*/
