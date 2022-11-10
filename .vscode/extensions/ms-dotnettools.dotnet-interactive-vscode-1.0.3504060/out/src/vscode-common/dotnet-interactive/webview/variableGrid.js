"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
window.addEventListener('DOMContentLoaded', () => {
    const filterElement = document.getElementById('filter');
    const contentElement = document.getElementById('content');
    let tableRows = [];
    window.addEventListener('message', event => {
        switch (event.data.command) {
            case 'set-rows':
                tableRows = setDataRows(contentElement, event.data.rows);
                doFilter();
                break;
        }
    });
    function doFilter() {
        for (const row of tableRows) {
            row.element.style.display = 'none';
            if (contains(row.row.name, filterElement.value) ||
                contains(row.row.value, filterElement.value) ||
                contains(row.row.kernel, filterElement.value)) {
                row.element.style.display = '';
            }
        }
    }
    function clearFilter() {
        filterElement.value = '';
        doFilter();
    }
    filterElement.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            clearFilter();
        }
    });
    filterElement.addEventListener('input', doFilter);
    document.getElementById('clear').addEventListener('click', clearFilter);
});
function contains(text, search) {
    return text.toLowerCase().indexOf(search.toLocaleLowerCase()) > -1;
}
function setDataRows(container, rows) {
    const displayedRows = [];
    const table = document.createElement('table');
    const header = document.createElement('tr');
    table.appendChild(header);
    // create headers
    const nameHeader = document.createElement('th');
    nameHeader.classList.add('name-column');
    nameHeader.innerText = 'Name';
    header.appendChild(nameHeader);
    const valueHeader = document.createElement('th');
    valueHeader.classList.add('value-column');
    valueHeader.innerText = 'Value';
    header.appendChild(valueHeader);
    const kernelHeader = document.createElement('th');
    kernelHeader.classList.add('kernel-column');
    kernelHeader.innerText = 'Kernel';
    header.appendChild(kernelHeader);
    const shareHeader = document.createElement('th');
    shareHeader.classList.add('share-column');
    shareHeader.innerText = 'Share';
    header.appendChild(shareHeader);
    for (const row of rows) {
        const dataRow = document.createElement('tr');
        table.appendChild(dataRow);
        const dataName = document.createElement('td');
        dataName.innerText = truncateValue(row.name);
        dataRow.appendChild(dataName);
        const dataValue = document.createElement('td');
        dataValue.innerText = truncateValue(row.value);
        dataRow.appendChild(dataValue);
        const dataKernel = document.createElement('td');
        dataKernel.innerText = truncateValue(row.kernel);
        dataRow.appendChild(dataKernel);
        const dataShare = document.createElement('td');
        dataShare.classList.add('share-data');
        dataShare.innerHTML = `<a href="${row.link}"><svg class="share-symbol"><use xlink:href="#share-icon"></use></svg></a>`;
        dataRow.appendChild(dataShare);
        displayedRows.push({
            row,
            element: dataRow,
        });
    }
    container.innerHTML = '';
    container.appendChild(table);
    return displayedRows;
}
const maxDisplayLength = 100;
function truncateValue(value) {
    if (value.length > maxDisplayLength) {
        return value.substring(0, maxDisplayLength - 3) + '...';
    }
    return value;
}
// @ts-ignore
const vscode = acquireVsCodeApi();
function doTheThing(kernelName, valueName) {
    vscode.postMessage({ kernelName, valueName });
}
//# sourceMappingURL=variableGrid.js.map