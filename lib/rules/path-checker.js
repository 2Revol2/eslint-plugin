/**
 * @fileoverview feature sliced design relative path checker
 * @author maksym
 */
"use strict";
const path = require("path");
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "feature sliced design relative path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [{
        type: "object",
        properties: {
            alias: {
                type: "string",
            }
        }
    }], // Add a schema if the rule has options
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

    return {
      // visitor functions for different types of nodes

      ImportDeclaration(node) {
        const value = node.source.value
        const importTo = alias ? value.replace(`${alias}/`, "") : value;
        const fromFilename = context.getFilename();

        if (shouldBeRelative(fromFilename, importTo)) {
          context.report(node, "path should be relative");
        }
      },
    };
  },
};

function isPathRelative(path) {
  return path === "." || path.startsWith("./") || path.startsWith("../");
}

const layers = {
  pages: "pages",
  widgets: "widgets",
  shared: "shared",
  features: "features",
  entities: "entities",
};

function shouldBeRelative(from, to) {
  if (isPathRelative(to)) {
    return false;
  }

  const toArray = to.split("/");
  const toLayer = toArray[0];
  const toSlice = toArray[1];

  if (!toLayer || !toSlice || !layers[toLayer]) {
    return false;
  }

  const normalizedPath = path.toNamespacedPath(from);
  const projectFrom = normalizedPath.split("src")[1];
  const fromArray = projectFrom.split("\\");
  const fromLayer = fromArray[1];
  const fromSlice = fromArray[2];

  if (!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  return fromSlice === toSlice && fromLayer === toLayer;
}
