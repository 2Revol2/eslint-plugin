/**
 * @fileoverview Enforces correct import direction between layers in Feature-Sliced Design architecture
 * @author maksym
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
const {isPathRelative} = require("../helpers/index")
const path = require("path");
const micromatch = require("micromatch")

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "Enforces correct import direction between layers in Feature-Sliced Design architecture",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string',
          },
          ignoreImportPatterns: {
            type: 'array',
          }
        },
      }
    ], // Add a schema if the rule has options
    messages: {}, // Add messageId and message
  },

  create(context) {

    const layers = {
      'app': ['pages', 'widgets', 'features', 'shared', 'entities'],
      'pages': ['widgets', 'features', 'shared', 'entities'],
      'widgets': ['features', 'shared', 'entities'],
      'features': ['shared', 'entities'],
      'entities': ['shared', 'entities'],
      'shared': ['shared'],
    }

    const availableLayers = {
      'app': 'app',
      'entities': 'entities',
      'features': 'features',
      'shared': 'shared',
      'pages': 'pages',
      'widgets': 'widgets',
    }


    const {alias = '', ignoreImportPatterns = []} = context.options[0] ?? {};


    const getCurrentFileLayer = () => {
      const currentFilePath = context.getFilename();

      const normalizedPath = path.toNamespacedPath(currentFilePath);
      const projectPath = normalizedPath?.split('src')[1];
      const segments = projectPath?.split('\\')

      return segments?.[1];
    }

    const getImportLayer = (value) => {
      const importPath = alias ? value.replace(`${alias}/`, '') : value;
      const segments = importPath?.split('/')

      return segments?.[0]
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value
        const currentFileLayer = getCurrentFileLayer()
        const importLayer = getImportLayer(importPath)

        if(isPathRelative(importPath)) {
          return;
        }

        if(!availableLayers[importLayer] || !availableLayers[currentFileLayer]) {
          return;
        }

        const isIgnored = ignoreImportPatterns.some(pattern => {
          return micromatch.isMatch(importPath, pattern)
        });

        if(isIgnored) {
          return;
        }

        if(!layers[currentFileLayer]?.includes(importLayer)) {
          context.report(node, 'the layer can only import from lower layers (shared, entities, features, widgets, pages, app)');
        }
      }
    };
  },
};
