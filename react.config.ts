// Mocking a proposed reactConfig for a proposed react/framework.
type ReactConfig = any; // import { ReactConfig } from "react";

const reactConfig: ReactConfig = {
  // gives react/framework a default understanding of modules under its agency that aren't (yet) marked with any directive
  default: undefined, // or "server" or "client" or "agnostic"
  // gives react/framework agency over JavaScript folders and files such as utility modules beyond the react folder
  javaScriptModules: {
    serverModules: {
      folders: [], // array of Server Module folders
      files: [], // array of Server Module files
      serverFunctionsModules: {
        folders: [], // array of Server Functions Module folders
        files: [], // array of Server Functions Module files
      },
    },
    clientModules: {
      folders: [], // array of Client Module folders
      files: [], // array of Client Module files
    },
    agnosticModules: {
      folders: [], // array of Agnostic Module folders
      files: [], // array of Agnostic Module files
    },
  },
  // gives react/framework permission over non-JavaScript folders and files to be perceived by react/framework as relevant JavaScript modules during imports
  nonJavaScriptModules: {
    serverModules: {
      folders: [], // array of Server Module folders
      files: [], // array of Server Module files
      serverFunctionsModules: {
        folders: [], // array of Server Functions Module folders
        files: [], // array of Server Functions Module files
      },
    },
    clientModules: {
      folders: [], // array of Client Module folders
      files: [], // array of Client Module files
    },
    agnosticModules: {
      folders: [], // array of Agnostic Module folders
      files: [], // array of Agnostic Module files
    },
  },
};

export default reactConfig;
