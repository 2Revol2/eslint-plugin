/**
 * @fileoverview imports only from public api
 * @author maksym
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
const {isPathRelative} = require("../helpers/index")
const path = require("path");
const micromatch = require("micromatch")

const PUBLIC_ERROR = "PUBLIC_ERROR"
const TESTING_PUBLIC_ERROR = "TESTING_PUBLIC_ERROR"

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "imports only from public api",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: "code", // Or `code` or `whitespace`
    schema: [
        {
          type: "object",
          properties: {
            alias: {
              type: "string",
            },
            testFilesPatterns: {
                type: "array",
            }
          }
      }],// Add a schema if the rule has options
    messages: {
      [PUBLIC_ERROR]: "absolute path should be imported from public api",
      [TESTING_PUBLIC_ERROR]: "testing data should be imported from the public testing API"
    }, // Add messageId and message
  },
  create(context) {
    // variables should be defined here

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    // any helper functions should go here or else delete this section

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    const {alias = "", testFilesPatterns = []} = context.options[0] ?? {};

    const checkingLayers ={
      pages: "pages",
      widgets: "widgets",
      features: "features",
      entities: "entities",
    };

    return {
      // visitor functions for different types of nodes

      ImportDeclaration(node) {
        const value = node.source.value
        const importTo = alias ? value.replace(`${alias}/`, "") : value;

        if(isPathRelative(importTo)){
          return
        }

        const segments = importTo.split("/")
        const layer = segments[0];
        const slice = segments[1];

        if(!checkingLayers[layer]) {
          return
        }

        const isImportFromNotPublicApi = segments.length > 2
        const isTestingPublicApi = segments[2] === "testing" && segments.length < 4;
        if(isImportFromNotPublicApi && !isTestingPublicApi) {
          return  context.report({node, messageId: PUBLIC_ERROR, fix: (fixer) => {
              return fixer.replaceText(node.source, `"${alias}/${layer}/${slice}";` );
            }
          }
          );
        }

        if(isTestingPublicApi) {
          const currentFilePath = context.getFilename();
          const isCurrentFileTesting = testFilesPatterns.some((pattern)=> micromatch.isMatch(currentFilePath, pattern));

          if(!isCurrentFileTesting) {
            return  context.report({node, messageId: TESTING_PUBLIC_ERROR});
          }
        }
      },
    };
  },
};
