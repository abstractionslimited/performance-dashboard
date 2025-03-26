// Global variables to store processed data
let jiraData = [];
let statusCounts = {};
let issueTypeCounts = {};
let priorityCounts = {};
let assigneeCounts = {};
let sprintVelocity = {};
let cycleTimeData = {};
let leadTimeData = {};
let workflowStages = {};
let issueAging = {};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadJiraData();
    updateLastUpdated();
    initializeExportButtons();
    initializeDateFilter();
});

// Load and process Jira CSV data
function loadJiraData() {
    const csvFilePath = "Jira Export CSV (all fields) 20250326114301.csv";
    
    fetch(csvFilePath)
        .then(response => response.text())
        .then(data => {
            processCSVData(data);
            updateDashboard();
        })
        .catch(error => {
            console.error("Error loading Jira data:", error);
            document.getElementById('root').innerHTML = `
                <div class="error-message">
                    <h2>Error Loading Data</h2>
                    <p>Failed to load Jira data. Please check that the CSV file exists and is accessible.</p>
                    <p>Error details: ${error.message}</p>
                </div>
            `;
        });
}

// Process the CSV data
function processCSVData(csvText) {
    // Parse CSV
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    // Map important column indices
    const columnMap = {
        summary: headers.indexOf('Summary'),
        key: headers.indexOf('Issue key'),
        issueType: headers.indexOf('Issue Type'),
        status: headers.indexOf('Status'),
        projectName: headers.indexOf('Project name'),
        resolution: headers.indexOf('Resolution'),
        created: headers.indexOf('Created'),
        updated: headers.indexOf('Updated'),
        resolved: headers.indexOf('Resolved'),
        logWork: headers.indexOf('Log Work')
    };
    
    // Process each line
    for (let i = 1; i < lines.length; i++) {
        // Skip empty lines
        if (!lines[i].trim()) continue;
        
        // Handle commas within quoted fields
        let row = parseCSVLine(lines[i]);
        
        if (row.length < Object.values(columnMap).filter(idx => idx !== -1).length) {
            continue; // Skip malformed rows
        }
        
        // Create issue object
        const issue = {
            summary: columnMap.summary !== -1 ? row[columnMap.summary] : '',
            key: columnMap.key !== -1 ? row[columnMap.key] : '',
            issueType: columnMap.issueType !== -1 ? row[columnMap.issueType] : '',
            status: columnMap.status !== -1 ? row[columnMap.status] : '',
            projectName: columnMap.projectName !== -1 ? row[columnMap.projectName] : '',
            priority: 'Medium', // Default priority since it's not in the simplified CSV
            assignee: 'Khanya Kupelo', // Default assignee 
            created: columnMap.created !== -1 ? parseDate(row[columnMap.created]) : null,
            updated: columnMap.updated !== -1 ? parseDate(row[columnMap.updated]) : null,
            resolved: columnMap.resolved !== -1 ? parseDate(row[columnMap.resolved]) : null,
            epicLink: '',
            sprint: '',
            storyPoints: 0,
            // Extract time spent from log work data if available
            timeSpent: columnMap.logWork !== -1 ? extractTimeSpent(row[columnMap.logWork]) : 0
        };
        
        // Only include valid issues
        if (issue.key) {
            jiraData.push(issue);
        }
    }
    
    // Process the data for visualization
    calculateMetrics();
}

// Extract time spent from log work data
function extractTimeSpent(logWorkData) {
    if (!logWorkData) return 0;
    
    // Try to extract time spent from log work entries
    const timeSpentMatch = logWorkData.match(/(\d+)$/);
    if (timeSpentMatch && timeSpentMatch[1]) {
        return parseInt(timeSpentMatch[1]) / 3600; // Convert seconds to hours
    }
    
    return 0;
}

// Helper function to parse a CSV line handling quoted fields
function parseCSVLine(line) {
    const result = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(currentValue);
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    
    // Add the last value
    result.push(currentValue);
    
    return result;
}

// Parse date string to Date object
function parseDate(dateString) {
    if (!dateString) return null;
    
    // Handle common date formats
    const formats = [
        /(\d{1,2})\/(\w{3})\/(\d{2}) (\d{1,2}):(\d{2}) (AM|PM)/,  // 17/Mar/25 10:10 AM
        /(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2})/,              // 2025/03/17 10:10
        /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/         // ISO format
    ];
    
    // Try each format
    for (const format of formats) {
        if (format.test(dateString)) {
            // For the first format (17/Mar/25 10:10 AM)
            if (format === formats[0]) {
                const match = dateString.match(format);
                if (match) {
                    const [_, day, monthStr, year, hours, minutes, ampm] = match;
                    const months = {'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 
                                   'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11};
                    
                    let hour = parseInt(hours);
                    if (ampm === 'PM' && hour < 12) hour += 12;
                    if (ampm === 'AM' && hour === 12) hour = 0;
                    
                    return new Date(2000 + parseInt(year), months[monthStr], parseInt(day), hour, parseInt(minutes));
                }
            } else if (format === formats[1]) {
                // For YYYY/MM/DD HH:MM format
                const match = dateString.match(format);
                if (match) {
                    const [_, year, month, day, hours, minutes] = match;
                    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
                }
            } else {
                // For ISO format
                return new Date(dateString);
            }
        }
    }
    
    // Fallback to direct parsing
    return new Date(dateString);
}

// Calculate all metrics from parsed data
function calculateMetrics() {
    // Count issues by status
    statusCounts = countByProperty(jiraData, 'status');
    
    // Count issues by type
    issueTypeCounts = countByProperty(jiraData, 'issueType');
    
    // Count issues by priority
    priorityCounts = countByProperty(jiraData, 'priority');
    
    // Count issues by assignee
    assigneeCounts = countByProperty(jiraData, 'assignee');
    
    // Calculate sprint velocity
    calculateSprintVelocity();
    
    // Calculate cycle and lead times
    calculateCycleAndLeadTimes();
    
    // Calculate workflow stage times
    calculateWorkflowStages();
    
    // Calculate issue aging
    calculateIssueAging();
}

// Count items by a specific property
function countByProperty(items, property) {
    return items.reduce((counts, item) => {
        const value = item[property] || 'Unknown';
        counts[value] = (counts[value] || 0) + 1;
        return counts;
    }, {});
}

// Calculate sprint velocity (story points completed per sprint)
function calculateSprintVelocity() {
    // Group by sprint
    const sprintData = {};
    
    jiraData.forEach(issue => {
        // Skip issues without sprint information
        if (!issue.sprint) return;
        
        // Extract sprint names (could be multiple)
        const sprints = issue.sprint.split(',').map(s => s.trim());
        
        sprints.forEach(sprint => {
            if (!sprint) return;
            
            // Initialize sprint data if not exists
            if (!sprintData[sprint]) {
                sprintData[sprint] = {
                    totalPoints: 0,
                    completedPoints: 0
                };
            }
            
            // Add story points
            sprintData[sprint].totalPoints += issue.storyPoints;
            
            // Count completed points
            if (issue.status === 'Done' || issue.status === 'Closed' || issue.status === 'Resolved') {
                sprintData[sprint].completedPoints += issue.storyPoints;
            }
        });
    });
    
    // Convert to array sorted by sprint name
    sprintVelocity = Object.entries(sprintData).map(([name, data]) => ({
        name,
        totalPoints: data.totalPoints,
        completedPoints: data.completedPoints
    })).sort((a, b) => a.name.localeCompare(b.name));
    
    // Take the most recent 6 sprints
    sprintVelocity = sprintVelocity.slice(-6);
}

// Calculate cycle times (in progress to done) and lead times (created to done)
function calculateCycleAndLeadTimes() {
    // Group by issue type
    cycleTimeData = {};
    leadTimeData = {};
    
    jiraData.forEach(issue => {
        // Skip issues that aren't done or don't have required dates
        if (!issue.resolved || !issue.created) return;
        
        const type = issue.issueType || 'Unknown';
        
        // Calculate lead time (created to resolved)
        const leadTime = (issue.resolved - issue.created) / (1000 * 60 * 60 * 24); // in days
        
        // Initialize arrays if needed
        if (!leadTimeData[type]) leadTimeData[type] = [];
        
        // Add to arrays
        leadTimeData[type].push(leadTime);
    });
    
    // Calculate averages
    for (const type in leadTimeData) {
        const times = leadTimeData[type];
        leadTimeData[type] = times.reduce((sum, time) => sum + time, 0) / times.length;
    }
}

// Calculate time spent in each workflow stage
function calculateWorkflowStages() {
    // This is a simplified version, as we don't have transition data
    // In a real scenario, you'd use Jira's transition history data
    
    // Simple distribution based on status counts
    const totalIssues = jiraData.length;
    
    workflowStages = Object.entries(statusCounts).map(([status, count]) => ({
        stage: status,
        count,
        percentage: (count / totalIssues) * 100,
        avgDays: 0 // Placeholder - would need transition data
    }));
}

// Calculate issue aging (how long issues have been in current status)
function calculateIssueAging() {
    // Group by status
    issueAging = {};
    
    // Define age buckets
    const buckets = {
        'lt7days': 0,
        '7to14days': 0,
        '15to30days': 0,
        'gt30days': 0
    };
    
    // Reset issue aging object
    Object.keys(statusCounts).forEach(status => {
        if (status === 'Done' || status === 'Closed' || status === 'Resolved') return;
        issueAging[status] = { ...buckets };
    });
    
    // Calculate for current date
    const now = new Date();
    
    jiraData.forEach(issue => {
        // Skip resolved issues
        if (issue.status === 'Done' || issue.status === 'Closed' || issue.status === 'Resolved') return;
        
        // Skip issues without updated date
        if (!issue.updated) return;
        
        const daysInStatus = (now - issue.updated) / (1000 * 60 * 60 * 24);
        
        // Assign to appropriate bucket
        if (daysInStatus < 7) {
            issueAging[issue.status].lt7days++;
        } else if (daysInStatus < 14) {
            issueAging[issue.status]['7to14days']++;
        } else if (daysInStatus < 30) {
            issueAging[issue.status]['15to30days']++;
        } else {
            issueAging[issue.status].gt30days++;
        }
    });
}

// Update all dashboard components
function updateDashboard() {
    // Update KPIs
    updateKPIs();
    
    // Update charts
    updateStatusChart();
    updateIssueTypeChart();
    updateVelocityChart();
    updatePriorityChart();
    updateProductivityChart();
    updateCycleTimeChart();
    
    // Update tables
    updateEfficiencyTable();
    updateAgingTable();
    
    // Generate and update executive summary
    generateExecutiveSummary();
}

// Update Key Performance Indicators
function updateKPIs() {
    // Total Issues
    document.getElementById('total-issues').innerText = jiraData.length;
    
    // Completion Rate
    const doneIssues = jiraData.filter(issue => 
        issue.status === 'Done' || issue.status === 'Closed' || issue.status === 'Resolved'
    ).length;
    
    const completionRate = (doneIssues / jiraData.length * 100).toFixed(1);
    document.getElementById('completion-rate').innerText = `${completionRate}%`;
    
    // Average Resolution Time (Lead Time)
    const allLeadTimes = Object.values(leadTimeData);
    let avgResolutionTime = 0;
    
    if (allLeadTimes.length > 0) {
        avgResolutionTime = allLeadTimes.reduce((sum, time) => sum + time, 0) / allLeadTimes.length;
    }
    
    document.getElementById('avg-resolution-time').innerText = `${avgResolutionTime.toFixed(1)} days`;
    
    // Average Lead Time (overall)
    document.getElementById('avg-lead-time').innerText = `${avgResolutionTime.toFixed(1)} days`;
}

// Update Status Chart
function updateStatusChart() {
    const ctx = document.getElementById('status-chart').getContext('2d');
    
    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    
    // Define colors for status
    const statusColors = {
        'Done': 'rgba(75, 192, 192, 0.8)',
        'In Progress': 'rgba(54, 162, 235, 0.8)',
        'To Do': 'rgba(255, 206, 86, 0.8)',
        'Doing': 'rgba(54, 162, 235, 0.8)',
        'Not Applicable': 'rgba(201, 203, 207, 0.8)',
        'Blocked': 'rgba(255, 99, 132, 0.8)',
        'Rejected': 'rgba(255, 99, 132, 0.8)',
        'Cancelled': 'rgba(201, 203, 207, 0.8)'
    };
    
    // Default color for undefined statuses
    const defaultColor = 'rgba(153, 102, 255, 0.8)';
    
    // Create background colors array
    const backgroundColors = labels.map(label => statusColors[label] || defaultColor);
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'Issue Status Distribution'
                },
                datalabels: {
                    formatter: (value, ctx) => {
                        const label = ctx.chart.data.labels[ctx.dataIndex];
                        const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = (value / total * 100).toFixed(1);
                        return `${percentage}%`;
                    },
                    color: '#fff',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// Update Issue Type Chart
function updateIssueTypeChart() {
    const ctx = document.getElementById('issue-type-chart').getContext('2d');
    
    const labels = Object.keys(issueTypeCounts);
    const data = Object.values(issueTypeCounts);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Issues',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Issues'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Issue Type'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Issue Type Distribution'
                }
            }
        }
    });
}

// Update Sprint Velocity Chart
function updateVelocityChart() {
    const ctx = document.getElementById('velocity-chart').getContext('2d');
    
    // Extract data for chart
    const labels = sprintVelocity.map(sprint => sprint.name);
    const completedPoints = sprintVelocity.map(sprint => sprint.completedPoints);
    const totalPoints = sprintVelocity.map(sprint => sprint.totalPoints);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Completed Story Points',
                data: completedPoints,
                backgroundColor: 'rgba(75, 192, 192, 0.4)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            }, {
                label: 'Total Story Points',
                data: totalPoints,
                backgroundColor: 'rgba(153, 102, 255, 0.4)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Story Points'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Sprint'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Sprint Velocity'
                }
            }
        }
    });
}

// Update Priority Chart
function updatePriorityChart() {
    const ctx = document.getElementById('priority-chart').getContext('2d');
    
    const labels = Object.keys(priorityCounts);
    const data = Object.values(priorityCounts);
    
    // Define colors for priorities
    const priorityColors = {
        'Highest': 'rgba(255, 99, 132, 0.8)',
        'High': 'rgba(255, 159, 64, 0.8)',
        'Medium': 'rgba(255, 206, 86, 0.8)',
        'Low': 'rgba(75, 192, 192, 0.8)',
        'Lowest': 'rgba(54, 162, 235, 0.8)'
    };
    
    // Default color for undefined priorities
    const defaultColor = 'rgba(153, 102, 255, 0.8)';
    
    // Create background colors array
    const backgroundColors = labels.map(label => priorityColors[label] || defaultColor);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'Issues by Priority'
                },
                datalabels: {
                    formatter: (value, ctx) => {
                        const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = (value / total * 100).toFixed(1);
                        return `${percentage}%`;
                    },
                    color: '#fff',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// Update Productivity Chart
function updateProductivityChart() {
    const ctx = document.getElementById('productivity-chart').getContext('2d');
    
    // Get top assignees by issue count
    const topAssignees = Object.entries(assigneeCounts)
        .filter(([name]) => name !== 'Unknown' && name !== '')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const labels = topAssignees.map(([name]) => name);
    const data = topAssignees.map(([, count]) => count);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Assigned Issues',
                data: data,
                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Issues'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Assignee'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Issue Distribution by Assignee'
                }
            }
        }
    });
}

// Update Cycle Time Chart
function updateCycleTimeChart() {
    const ctx = document.getElementById('cycle-time-chart').getContext('2d');
    
    // Get lead times by issue type
    const issueTypes = Object.keys(leadTimeData);
    const leadTimes = Object.values(leadTimeData);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: issueTypes,
            datasets: [{
                label: 'Average Lead Time (Days)',
                data: leadTimes,
                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Days'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Issue Type'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Average Lead Time by Issue Type'
                }
            }
        }
    });
}

// Update Workflow Efficiency Table
function updateEfficiencyTable() {
    const table = document.getElementById('efficiency-table').getElementsByTagName('tbody')[0];
    table.innerHTML = '';
    
    // Sort workflow stages by percentage (descending)
    const sortedStages = [...workflowStages].sort((a, b) => b.percentage - a.percentage);
    
    // Add rows to table
    sortedStages.forEach(stage => {
        const row = table.insertRow();
        
        // Add cells
        const stageCell = row.insertCell(0);
        const avgTimeCell = row.insertCell(1);
        const percentageCell = row.insertCell(2);
        
        // Set cell values
        stageCell.textContent = stage.stage;
        avgTimeCell.textContent = stage.avgDays.toFixed(1);
        percentageCell.textContent = `${stage.percentage.toFixed(1)}%`;
        
        // Add styling for bottlenecks
        if (stage.percentage > 20 && stage.stage !== 'Done' && stage.stage !== 'Closed') {
            row.classList.add('bottleneck');
        }
    });
}

// Update Issue Aging Table
function updateAgingTable() {
    const table = document.getElementById('aging-table').getElementsByTagName('tbody')[0];
    table.innerHTML = '';
    
    // Add rows to table
    for (const [status, aging] of Object.entries(issueAging)) {
        const row = table.insertRow();
        
        // Add cells
        const statusCell = row.insertCell(0);
        const lt7Cell = row.insertCell(1);
        const days7to14Cell = row.insertCell(2);
        const days15to30Cell = row.insertCell(3);
        const gt30Cell = row.insertCell(4);
        
        // Set cell values
        statusCell.textContent = status;
        lt7Cell.textContent = aging.lt7days;
        days7to14Cell.textContent = aging['7to14days'];
        days15to30Cell.textContent = aging['15to30days'];
        gt30Cell.textContent = aging.gt30days;
        
        // Add styling for old issues
        if (aging.gt30days > 0) {
            gt30Cell.classList.add('warning');
        }
    }
}

// Update last updated timestamp
function updateLastUpdated() {
    const now = new Date();
    document.getElementById('last-updated').textContent = now.toLocaleString();
}

// Generate executive summary
function generateExecutiveSummary() {
    // Get key metrics
    const totalIssues = jiraData.length;
    const doneIssues = jiraData.filter(issue => 
        issue.status === 'Done' || issue.status === 'Closed' || issue.status === 'Resolved'
    ).length;
    const completionRate = (doneIssues / totalIssues * 100).toFixed(1);
    
    // Get most common issue types
    const issueTypeCounts = Object.entries(countByProperty(jiraData, 'issueType'))
        .sort((a, b) => b[1] - a[1]);
    const topIssueTypes = issueTypeCounts.slice(0, 3)
        .map(([type, count]) => `${type} (${count})`)
        .join(', ');
    
    // Calculate average resolution time
    let avgResolutionTime = 0;
    const resolvedIssues = jiraData.filter(issue => issue.resolved && issue.created);
    
    if (resolvedIssues.length > 0) {
        const totalResolutionDays = resolvedIssues.reduce((sum, issue) => {
            const days = (issue.resolved - issue.created) / (1000 * 60 * 60 * 24);
            return sum + days;
        }, 0);
        
        avgResolutionTime = (totalResolutionDays / resolvedIssues.length).toFixed(1);
    }
    
    // Get project distribution
    const projectCounts = Object.entries(countByProperty(jiraData, 'projectName'))
        .sort((a, b) => b[1] - a[1]);
    const topProjects = projectCounts.slice(0, 3)
        .map(([project, count]) => `${project} (${count})`)
        .join(', ');
    
    // Generate summary text
    const summary = `
        This dashboard presents an analysis of ${totalIssues} Jira tickets with a completion rate of ${completionRate}%.
        The average resolution time is ${avgResolutionTime} days. Most tickets are of type ${topIssueTypes},
        primarily from projects: ${topProjects}. The dashboard shows key performance metrics,
        issue distributions, and workflow efficiency data to provide a comprehensive view of performance.
    `;
    
    // Update the summary text
    document.getElementById('summary-text').textContent = summary.replace(/\s+/g, ' ').trim();
}

// Initialize export buttons
function initializeExportButtons() {
    // Export PDF button
    document.getElementById('export-pdf').addEventListener('click', function() {
        window.print();
    });
    
    // Export CSV button
    document.getElementById('export-csv').addEventListener('click', function() {
        exportTableToCSV('jira_performance_data.csv');
    });
}

// Export table to CSV
function exportTableToCSV(filename) {
    // Create CSV content
    let csv = [];
    
    // Add headers
    csv.push(['Key', 'Summary', 'Type', 'Status', 'Project', 'Created', 'Resolved', 'Resolution Days'].join(','));
    
    // Add data rows
    jiraData.forEach(issue => {
        let row = [
            issue.key,
            `"${issue.summary.replace(/"/g, '""')}"`, // Escape quotes in summary
            issue.issueType,
            issue.status,
            issue.projectName,
            issue.created ? issue.created.toLocaleDateString() : '',
            issue.resolved ? issue.resolved.toLocaleDateString() : '',
            issue.resolved && issue.created ? Math.round((issue.resolved - issue.created) / (1000 * 60 * 60 * 24)) : ''
        ];
        csv.push(row.join(','));
    });
    
    // Create download link
    const csvContent = "data:text/csv;charset=utf-8," + csv.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize date filter
function initializeDateFilter() {
    const dateFilter = document.getElementById('date-filter');
    
    dateFilter.addEventListener('change', function() {
        const selectedValue = this.value;
        
        if (selectedValue === 'custom') {
            // Show date picker for custom range (simplified version)
            const startDate = prompt('Enter start date (YYYY-MM-DD):', '2025-01-01');
            const endDate = prompt('Enter end date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
            
            if (startDate && endDate) {
                filterDataByDateRange(new Date(startDate), new Date(endDate));
            } else {
                // Reset selection if cancelled
                dateFilter.value = 'all';
                resetDateFilter();
            }
        } else {
            // Handle predefined ranges
            const now = new Date();
            
            switch (selectedValue) {
                case 'last30':
                    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    filterDataByDateRange(thirtyDaysAgo, now);
                    break;
                case 'last90':
                    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    filterDataByDateRange(ninetyDaysAgo, now);
                    break;
                case 'last180':
                    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
                    filterDataByDateRange(sixMonthsAgo, now);
                    break;
                default:
                    resetDateFilter();
                    break;
            }
        }
    });
}

// Filter data by date range
function filterDataByDateRange(startDate, endDate) {
    // Store original data if not already stored
    if (!window.originalJiraData) {
        window.originalJiraData = [...jiraData];
    }
    
    // Filter data
    jiraData = window.originalJiraData.filter(issue => {
        if (!issue.created) return false;
        return issue.created >= startDate && issue.created <= endDate;
    });
    
    // Recalculate metrics and update dashboard
    calculateMetrics();
    updateDashboard();
    generateExecutiveSummary();
}

// Reset date filter
function resetDateFilter() {
    if (window.originalJiraData) {
        jiraData = [...window.originalJiraData];
        calculateMetrics();
        updateDashboard();
        generateExecutiveSummary();
    }
}