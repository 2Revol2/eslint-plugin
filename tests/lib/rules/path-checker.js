/**
 * @fileoverview feature sliced design relative path checker
 * @author maksym
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/path-checker"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run("path-checker", rule, {
    valid: [
        {
            filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\Article',
            code: "import { addCommentFormActions, addCommentFormReducer } from '../../model/slices/addCommentFormSlice'",
            errors: [],
        },
    ],

    invalid: [
        {
            filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\Article',
            code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/slices/addCommentFormSlice'",
            errors: [{ message: "path should be relative"}],

        },
        {
            filename: 'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\Article',
            code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/slices/addCommentFormSlice'",
            errors: [{ message: "path should be relative"}],
            options: [{alias: "@"}]
        },
    ],
});
