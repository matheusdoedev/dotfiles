"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComponentInstance = exports.getComponentText = exports.getSpecText = void 0;
const change_case_1 = require("change-case");
function getSpecText(componentName) {
    return `import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ${change_case_1.pascalCase(componentName)}Component } from './${componentName}.component';

describe('${change_case_1.pascalCase(componentName)}Component', () => {
    let component: ${change_case_1.pascalCase(componentName)}Component;
    let fixture: ComponentFixture<${change_case_1.pascalCase(componentName)}Component>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ ${change_case_1.pascalCase(componentName)}Component ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(${change_case_1.pascalCase(componentName)}Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});`;
}
exports.getSpecText = getSpecText;
function getComponentText(componentName, targets, sourceComponentConfig) {
    return `import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-${componentName}',
    templateUrl: './${componentName}.component.html',
    styleUrls: ['./${componentName}.component.${sourceComponentConfig.styleExt}']
})
export class ${change_case_1.pascalCase(componentName)}Component {
    ${targets.map((target) => `@Input() ${target}`).join('\n    ')}
    constructor () {}
}`;
}
exports.getComponentText = getComponentText;
function getComponentInstance(componentName, targets) {
    return `<app-${componentName} ${targets
        .map((target) => `[${target}]="${target}"`)
        .join(' ')}></app-${componentName}>`;
}
exports.getComponentInstance = getComponentInstance;
//# sourceMappingURL=extract-to-folder-template.js.map