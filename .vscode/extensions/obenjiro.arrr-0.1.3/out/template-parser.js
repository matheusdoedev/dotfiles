"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTargets = exports.visitTarget = exports.KEEP_VISIT = exports.getNodeCtor = exports.templateParser = void 0;
const ng = require("@angular/compiler");
exports.templateParser = {
    locationProps: new Set([
        'span',
        'sourceSpan',
        'startSourceSpan',
        'endSourceSpan',
    ]),
    typeProps: new Set(['name']),
    parse(code, options) {
        const ast = ng.parseTemplate(code, 'astexplorer.html', options);
        fixSpan(ast, code);
        return ast;
    },
    nodeToRange(node) {
        if (node.startSourceSpan) {
            if (node.endSourceSpan) {
                return [
                    node.startSourceSpan.start.offset,
                    node.endSourceSpan.end.offset,
                ];
            }
            return [
                node.startSourceSpan.start.offset,
                node.startSourceSpan.end.offset,
            ];
        }
        if (node.sourceSpan) {
            return [node.sourceSpan.start.offset, node.sourceSpan.end.offset];
        }
        if (node.span) {
            return [node.span.start, node.span.end];
        }
    },
    getNodeName(node) {
        let name = getNodeCtor(node);
        if (node.name) {
            name += `(${node.name})`;
        }
        return name;
    },
    getDefaultOptions() {
        return {
            preserveWhitespaces: false,
        };
    },
};
function getNodeCtor(node) {
    return node.constructor && node.constructor.name;
}
exports.getNodeCtor = getNodeCtor;
/**
 * Locations from sub AST are counted from that part of string,
 * we need to fix them to make autofocus work.
 *
 * Before:
 *
 *     <tag [attr]="expression">
 *                  ^^^^^^^^^^ sub AST { start: 0, end: 10 }
 *
 * After:
 *
 *     <tag [attr]="expression">
 *                  ^^^^^^^^^^ sub AST { start: 13, end: 23 }
 */
function fixSpan(ast, code) {
    function getBaseStart(parent) {
        const nodeName = getNodeCtor(parent);
        switch (nodeName) {
            case 'BoundAttribute':
            case 'BoundEvent': {
                let offset = parent.sourceSpan.start.offset;
                while (code[offset++] !== '=') { }
                if (code[offset] === "'" || code[offset] === '"') {
                    offset++;
                }
                return offset;
            }
            case 'BoundText':
                return parent.sourceSpan.start.offset;
            default:
                throw new Error(`Unexpected node ${nodeName}`);
        }
    }
    visitTarget(ast, (value) => getNodeCtor(value) === 'ASTWithSource', (node, parent) => {
        const baseStart = getBaseStart(parent);
        visitTarget(node, (value) => value.span, (node) => {
            node.span.start += baseStart;
            node.span.end += baseStart;
            return exports.KEEP_VISIT;
        });
    });
}
exports.KEEP_VISIT = 1;
function visitTarget(value, isTarget, fn, parent) {
    if (value !== null && typeof value === 'object') {
        if (isTarget(value)) {
            if (fn(value, parent) !== exports.KEEP_VISIT) {
                return;
            }
        }
        if (Array.isArray(value)) {
            value.forEach((subValue) => visitTarget(subValue, isTarget, fn, value));
        }
        else {
            for (const key in value) {
                visitTarget(value[key], isTarget, fn, value);
            }
        }
    }
}
exports.visitTarget = visitTarget;
function getAllTargets(text) {
    const output = exports.templateParser.parse(text);
    const ast = output.nodes;
    const targets = [];
    visitTarget(ast, (value) => {
        return ((getNodeCtor(value) === "PropertyRead" &&
            getNodeCtor(value.receiver) === "ImplicitReceiver") ||
            (getNodeCtor(value) === "MethodCall" &&
                getNodeCtor(value.receiver) === "ImplicitReceiver"));
    }, (node, parent) => {
        targets.push(node.name);
        return exports.KEEP_VISIT;
    });
    // removing variables refrences
    visitTarget(ast, (value) => {
        return getNodeCtor(value) === "Variable" || getNodeCtor(value) === "Reference";
    }, (node, parent) => {
        if (targets.indexOf(node.name) > -1) {
            targets.splice(targets.indexOf(node.name));
        }
        return exports.KEEP_VISIT;
    });
    return [...new Set(targets)];
}
exports.getAllTargets = getAllTargets;
//# sourceMappingURL=template-parser.js.map