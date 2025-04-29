const typescriptEslintPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
    {
        ignores: ["coverage/**"],
    },
    {
        files: ["**/*.ts"],
        plugins: {
            "@typescript-eslint": typescriptEslintPlugin,
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        rules: {
            "no-unused-vars": "off",
            "no-console": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    "argsIgnorePattern": "^_",
                    "varsIgnorePattern": "^_"
                }
            ],
        }
    }
];