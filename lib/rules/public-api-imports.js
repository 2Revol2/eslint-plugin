/**
 * @fileoverview imports only from public api
 * @author maksym
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
const {isPathRelative} = require("../helpers/index")
/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "imports only from public api",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [
        {type: "object",
          properties: {
              alias: {
                  type: "string",
              }
          }
      }],// Add a schema if the rule has options
    messages: {}, // Add messageId and message
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
    const alias = context.options[0]?.alias || "";

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

        if(!checkingLayers[layer]) {
          return
        }

        const isImportFromNotPublicApi = segments.length > 2

        if(isImportFromNotPublicApi) {
          return  context.report(node, "absolute path should be imported from public api");
        }
      },
    };
  },
};
