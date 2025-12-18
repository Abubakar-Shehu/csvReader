// Main application logic for CSV Number Extractor SPA

document.addEventListener('DOMContentLoaded', () => {
    const csvFile1Input = document.getElementById('csvFile1');
    const csvFile2Input = document.getElementById('csvFile2');
    const fileName1 = document.getElementById('fileName1');
    const fileName2 = document.getElementById('fileName2');
    const lines1Input = document.getElementById('lines1');
    const lines2Input = document.getElementById('lines2');
    const delimiterSelect = document.getElementById('delimiter');
    const hasHeadersCheckbox = document.getElementById('hasHeaders');
    const processBtn = document.getElementById('processBtn');
    const resultsSection = document.getElementById('results');
    const resultsContent = document.getElementById('resultsContent');
    const errorDiv = document.getElementById('error');

    let file1 = null;
    let file2 = null;

    // Update file name display
    csvFile1Input.addEventListener('change', (e) => {
        file1 = e.target.files[0];
        fileName1.textContent = file1 ? file1.name : 'No file selected';
        updateProcessButton();
    });

    csvFile2Input.addEventListener('change', (e) => {
        file2 = e.target.files[0];
        fileName2.textContent = file2 ? file2.name : 'No file selected';
        updateProcessButton();
    });

    // Update process button state
    function updateProcessButton() {
        const hasFiles = file1 && file2;
        const hasLineNumbers = lines1Input.value.trim() && lines2Input.value.trim();
        processBtn.disabled = !(hasFiles && hasLineNumbers);
    }

    lines1Input.addEventListener('input', updateProcessButton);
    lines2Input.addEventListener('input', updateProcessButton);

    // Parse line numbers from input
    function parseLineNumbers(input) {
        return input
            .split(',')
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n) && n > 0);
    }

    // Process CSV files
    processBtn.addEventListener('click', async () => {
        // Hide previous results and errors
        resultsSection.style.display = 'none';
        errorDiv.style.display = 'none';
        resultsContent.innerHTML = '';

        try {
            const delimiter = delimiterSelect.value;
            const hasHeaders = hasHeadersCheckbox.checked;
            const lines1 = parseLineNumbers(lines1Input.value);
            const lines2 = parseLineNumbers(lines2Input.value);

            if (lines1.length === 0 || lines2.length === 0) {
                throw new Error('Please enter valid line numbers for both files');
            }

            // Read both CSV files
            const [csvData1, csvData2] = await Promise.all([
                window.CSVReader.readCSVFile(file1, { delimiter, hasHeaders }),
                window.CSVReader.readCSVFile(file2, { delimiter, hasHeaders })
            ]);

            // Extract numbers from specified lines
            const numbers1 = window.CSVReader.extractNumbersFromLines(csvData1, lines1);
            const numbers2 = window.CSVReader.extractNumbersFromLines(csvData2, lines2);

            // Display results
            displayResults(csvData1, csvData2, numbers1, numbers2, lines1, lines2);

        } catch (error) {
            showError(error.message);
        }
    });

    // Display results
    function displayResults(csvData1, csvData2, numbers1, numbers2, lines1, lines2) {
        let html = '';

        // File 1 Results
        html += '<div class="result-group">';
        html += '<h3>CSV File 1 Results</h3>';
        html += `<p class="file-info">Total rows: ${csvData1.rows.length}</p>`;
        html += '<div class="numbers-display">';
        
        lines1.forEach(lineNum => {
            const nums = numbers1[lineNum] || [];
            html += `<div class="line-result">`;
            html += `<strong>Line ${lineNum}:</strong> `;
            if (nums.length > 0) {
                html += `<span class="numbers">${nums.join(', ')}</span>`;
                html += ` <span class="sum">(Sum: ${nums.reduce((a, b) => a + b, 0).toFixed(2)})</span>`;
            } else {
                html += '<span class="no-numbers">No numbers found</span>';
            }
            html += `</div>`;
        });
        
        html += '</div>';
        html += '</div>';

        // File 2 Results
        html += '<div class="result-group">';
        html += '<h3>CSV File 2 Results</h3>';
        html += `<p class="file-info">Total rows: ${csvData2.rows.length}</p>`;
        html += '<div class="numbers-display">';
        
        lines2.forEach(lineNum => {
            const nums = numbers2[lineNum] || [];
            html += `<div class="line-result">`;
            html += `<strong>Line ${lineNum}:</strong> `;
            if (nums.length > 0) {
                html += `<span class="numbers">${nums.join(', ')}</span>`;
                html += ` <span class="sum">(Sum: ${nums.reduce((a, b) => a + b, 0).toFixed(2)})</span>`;
            } else {
                html += '<span class="no-numbers">No numbers found</span>';
            }
            html += `</div>`;
        });
        
        html += '</div>';
        html += '</div>';

        // Combined comparison (if same number of lines)
        if (lines1.length === lines2.length) {
            html += '<div class="result-group comparison">';
            html += '<h3>Comparison</h3>';
            html += '<div class="comparison-table">';
            
            for (let i = 0; i < lines1.length; i++) {
                const nums1 = numbers1[lines1[i]] || [];
                const nums2 = numbers2[lines2[i]] || [];
                const sum1 = nums1.reduce((a, b) => a + b, 0);
                const sum2 = nums2.reduce((a, b) => a + b, 0);
                const diff = sum1 - sum2;
                
                html += '<div class="comparison-row">';
                html += `<div class="comparison-cell">File 1 Line ${lines1[i]}: ${sum1.toFixed(2)}</div>`;
                html += `<div class="comparison-cell">File 2 Line ${lines2[i]}: ${sum2.toFixed(2)}</div>`;
                html += `<div class="comparison-cell difference">Difference: ${diff.toFixed(2)}</div>`;
                html += '</div>';
            }
            
            html += '</div>';
            html += '</div>';
        }

        resultsContent.innerHTML = html;
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Show error message
    function showError(message) {
        errorDiv.textContent = `Error: ${message}`;
        errorDiv.style.display = 'block';
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

