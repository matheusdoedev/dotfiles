(function () {
    'use strict';

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
    acquireVsCodeApi();

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFyaWFibGVHcmlkLmpzIiwic291cmNlcyI6WyIuLi9zcmMvd2Vidmlldy92YXJpYWJsZUdyaWQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmFyaWFibGVHcmlkUm93IH0gZnJvbSAnLi92YXJpYWJsZUdyaWRJbnRlcmZhY2VzJztcclxuXHJcbmludGVyZmFjZSBEaXNwbGF5ZWRWYXJpYWJsZUdyaWRSb3cge1xyXG4gICAgcm93OiBWYXJpYWJsZUdyaWRSb3c7XHJcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudDtcclxufVxyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XHJcbiAgICBjb25zdCBmaWx0ZXJFbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlcicpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBjb25zdCBjb250ZW50RWxlbWVudDogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGVudCcpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAgbGV0IHRhYmxlUm93czogRGlzcGxheWVkVmFyaWFibGVHcmlkUm93W10gPSBbXTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZXZlbnQgPT4ge1xyXG4gICAgICAgIHN3aXRjaCAoZXZlbnQuZGF0YS5jb21tYW5kKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NldC1yb3dzJzpcclxuICAgICAgICAgICAgICAgIHRhYmxlUm93cyA9IHNldERhdGFSb3dzKGNvbnRlbnRFbGVtZW50LCBldmVudC5kYXRhLnJvd3MpO1xyXG4gICAgICAgICAgICAgICAgZG9GaWx0ZXIoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGRvRmlsdGVyKCkge1xyXG4gICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHRhYmxlUm93cykge1xyXG4gICAgICAgICAgICByb3cuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICBpZiAoY29udGFpbnMocm93LnJvdy5uYW1lLCBmaWx0ZXJFbGVtZW50LnZhbHVlKSB8fFxyXG4gICAgICAgICAgICAgICAgY29udGFpbnMocm93LnJvdy52YWx1ZSwgZmlsdGVyRWxlbWVudC52YWx1ZSkgfHxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5zKHJvdy5yb3cua2VybmVsLCBmaWx0ZXJFbGVtZW50LnZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgcm93LmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNsZWFyRmlsdGVyKCkge1xyXG4gICAgICAgIGZpbHRlckVsZW1lbnQudmFsdWUgPSAnJztcclxuICAgICAgICBkb0ZpbHRlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGZpbHRlckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XHJcbiAgICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xyXG4gICAgICAgICAgICBjbGVhckZpbHRlcigpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgZmlsdGVyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGRvRmlsdGVyKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGVhcicpIS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsZWFyRmlsdGVyKTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBjb250YWlucyh0ZXh0OiBzdHJpbmcsIHNlYXJjaDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGV4dC50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoLnRvTG9jYWxlTG93ZXJDYXNlKCkpID4gLTE7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldERhdGFSb3dzKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHJvd3M6IFZhcmlhYmxlR3JpZFJvd1tdKTogRGlzcGxheWVkVmFyaWFibGVHcmlkUm93W10ge1xyXG4gICAgY29uc3QgZGlzcGxheWVkUm93czogRGlzcGxheWVkVmFyaWFibGVHcmlkUm93W10gPSBbXTtcclxuXHJcbiAgICBjb25zdCB0YWJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgICBjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xyXG4gICAgdGFibGUuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgaGVhZGVyc1xyXG4gICAgY29uc3QgbmFtZUhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XHJcbiAgICBuYW1lSGVhZGVyLmNsYXNzTGlzdC5hZGQoJ25hbWUtY29sdW1uJyk7XHJcbiAgICBuYW1lSGVhZGVyLmlubmVyVGV4dCA9ICdOYW1lJztcclxuICAgIGhlYWRlci5hcHBlbmRDaGlsZChuYW1lSGVhZGVyKTtcclxuXHJcbiAgICBjb25zdCB2YWx1ZUhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XHJcbiAgICB2YWx1ZUhlYWRlci5jbGFzc0xpc3QuYWRkKCd2YWx1ZS1jb2x1bW4nKTtcclxuICAgIHZhbHVlSGVhZGVyLmlubmVyVGV4dCA9ICdWYWx1ZSc7XHJcbiAgICBoZWFkZXIuYXBwZW5kQ2hpbGQodmFsdWVIZWFkZXIpO1xyXG5cclxuICAgIGNvbnN0IGtlcm5lbEhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XHJcbiAgICBrZXJuZWxIZWFkZXIuY2xhc3NMaXN0LmFkZCgna2VybmVsLWNvbHVtbicpO1xyXG4gICAga2VybmVsSGVhZGVyLmlubmVyVGV4dCA9ICdLZXJuZWwnO1xyXG4gICAgaGVhZGVyLmFwcGVuZENoaWxkKGtlcm5lbEhlYWRlcik7XHJcblxyXG4gICAgY29uc3Qgc2hhcmVIZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aCcpO1xyXG4gICAgc2hhcmVIZWFkZXIuY2xhc3NMaXN0LmFkZCgnc2hhcmUtY29sdW1uJyk7XHJcbiAgICBzaGFyZUhlYWRlci5pbm5lclRleHQgPSAnU2hhcmUnO1xyXG4gICAgaGVhZGVyLmFwcGVuZENoaWxkKHNoYXJlSGVhZGVyKTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YVJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XHJcbiAgICAgICAgdGFibGUuYXBwZW5kQ2hpbGQoZGF0YVJvdyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGFOYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuICAgICAgICBkYXRhTmFtZS5pbm5lclRleHQgPSB0cnVuY2F0ZVZhbHVlKHJvdy5uYW1lKTtcclxuICAgICAgICBkYXRhUm93LmFwcGVuZENoaWxkKGRhdGFOYW1lKTtcclxuXHJcbiAgICAgICAgY29uc3QgZGF0YVZhbHVlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuICAgICAgICBkYXRhVmFsdWUuaW5uZXJUZXh0ID0gdHJ1bmNhdGVWYWx1ZShyb3cudmFsdWUpO1xyXG4gICAgICAgIGRhdGFSb3cuYXBwZW5kQ2hpbGQoZGF0YVZhbHVlKTtcclxuXHJcbiAgICAgICAgY29uc3QgZGF0YUtlcm5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcbiAgICAgICAgZGF0YUtlcm5lbC5pbm5lclRleHQgPSB0cnVuY2F0ZVZhbHVlKHJvdy5rZXJuZWwpO1xyXG4gICAgICAgIGRhdGFSb3cuYXBwZW5kQ2hpbGQoZGF0YUtlcm5lbCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGFTaGFyZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcbiAgICAgICAgZGF0YVNoYXJlLmNsYXNzTGlzdC5hZGQoJ3NoYXJlLWRhdGEnKTtcclxuICAgICAgICBkYXRhU2hhcmUuaW5uZXJIVE1MID0gYDxhIGhyZWY9XCIke3Jvdy5saW5rfVwiPjxzdmcgY2xhc3M9XCJzaGFyZS1zeW1ib2xcIj48dXNlIHhsaW5rOmhyZWY9XCIjc2hhcmUtaWNvblwiPjwvdXNlPjwvc3ZnPjwvYT5gO1xyXG4gICAgICAgIGRhdGFSb3cuYXBwZW5kQ2hpbGQoZGF0YVNoYXJlKTtcclxuXHJcbiAgICAgICAgZGlzcGxheWVkUm93cy5wdXNoKHtcclxuICAgICAgICAgICAgcm93LFxyXG4gICAgICAgICAgICBlbGVtZW50OiBkYXRhUm93LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0YWJsZSk7XHJcblxyXG4gICAgcmV0dXJuIGRpc3BsYXllZFJvd3M7XHJcbn1cclxuXHJcbmNvbnN0IG1heERpc3BsYXlMZW5ndGggPSAxMDA7XHJcblxyXG5mdW5jdGlvbiB0cnVuY2F0ZVZhbHVlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgaWYgKHZhbHVlLmxlbmd0aCA+IG1heERpc3BsYXlMZW5ndGgpIHtcclxuICAgICAgICByZXR1cm4gdmFsdWUuc3Vic3RyaW5nKDAsIG1heERpc3BsYXlMZW5ndGggLSAzKSArICcuLi4nO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB2YWx1ZTtcclxufVxyXG5cclxuLy8gQHRzLWlnbm9yZVxyXG5jb25zdCB2c2NvZGUgPSBhY3F1aXJlVnNDb2RlQXBpKCk7XHJcblxyXG5mdW5jdGlvbiBkb1RoZVRoaW5nKGtlcm5lbE5hbWU6IHN0cmluZywgdmFsdWVOYW1lOiBzdHJpbmcpIHtcclxuICAgIHZzY29kZS5wb3N0TWVzc2FnZSh7IGtlcm5lbE5hbWUsIHZhbHVl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
