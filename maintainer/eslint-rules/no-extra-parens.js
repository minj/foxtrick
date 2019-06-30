const ruleComposer = require('eslint-rule-composer');
const eslint = require('eslint');
const { isCommentToken: isComment } = require('eslint-utils');

const noParensRule = new eslint.Linter().getRules().get('no-extra-parens');

const COMMENT_RE = /^\*\s*?@type/;

module.exports = ruleComposer.filterReports(
	noParensRule,
	({ node: n }, { sourceCode: code }) => {
		let token = code.getTokenBefore(n, { includeComments: true, skip: 1 });

		let cast = token && isComment(token) &&
			token.type == 'Block' && COMMENT_RE.test(token.value);

		return !cast;
	},
);
