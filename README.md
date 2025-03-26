# Jira Performance Dashboard

A comprehensive dashboard for visualizing Jira performance metrics, team productivity, and project status.

## Features

- **Executive Summary**: At-a-glance overview of key performance metrics and insights
- **Interactive Visualizations**: Dynamic charts showing issue status, type distribution, and trends
- **Workflow Analysis**: Identify bottlenecks and efficiency challenges in your team's workflow
- **Ticket Analysis**: Filter and search through tickets with detailed metrics
- **Performance Reports**: Generate comprehensive reports for managers and stakeholders
- **Export Functionality**: Export data and visualizations for further analysis or presentation
- **Date Filtering**: Analyze performance for specific time periods
- **Team Member Performance**: Track individual productivity and workload distribution
- **Project Health**: Monitor project status and completion rates

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Jira exported CSV data in the required format

### Setup Instructions

1. **Export Jira Data**:
   - In Jira, go to Issues > Search for Issues
   - Set up your filters to select the relevant issues
   - Select "Export" > "CSV (All Fields)"
   - Save the file as `Jira Export CSV (all fields).csv` in the dashboard directory

2. **Launch the Dashboard**:
   - Open `index.html` in your web browser
   - The dashboard will automatically load and process the CSV data

### CSV Format Requirements

The dashboard expects a CSV file with the following columns:
- `Summary` - Issue summary
- `Issue key` - Jira issue key (e.g., PROJ-123)
- `Issue Type` - Type of issue
- `Status` - Current issue status
- `Project name` - Name of the project
- `Resolution` - Resolution status
- `Created` - Creation date/time
- `Updated` - Last update date/time
- `Resolved` - Resolution date/time
- `Log Work` - Work log data

## Dashboard Pages

### Overview

The main dashboard page provides a high-level overview of performance with:
- Key performance indicators
- Issue status distribution
- Issue type breakdown
- Sprint velocity
- Priority analysis
- Team productivity
- Workflow efficiency metrics

### Ticket Analysis

The ticket analysis page allows you to:
- Filter tickets by status, type, priority, and date
- View trend charts showing creation vs resolution rates
- See cumulative flow diagrams of work in progress
- Browse and search through individual tickets

### Reports

The reports page provides detailed analysis with:
- Performance analysis report
- Project health metrics
- Key efficiency metrics
- Recommendations for improvement

## Customizing the Dashboard

### Adding Your Own Charts

1. Create a new canvas element in the HTML:
   ```html
   <div class="chart-container">
       <h3>Your Chart Title</h3>
       <canvas id="your-chart-id"></canvas>
   </div>
   ```

2. Add a new function in `dashboard.js` to create your chart:
   ```javascript
   function updateYourChart() {
       const ctx = document.getElementById('your-chart-id').getContext('2d');
       
       // Process your data
       const data = processYourData();
       
       // Create the chart
       new Chart(ctx, {
           // Chart configuration
       });
   }
   ```

3. Call your function in the `updateDashboard()` function.

### Modifying Date Formats

If your Jira export uses different date formats, update the `parseDate()` function in `dashboard.js` to handle your format.

## For Recruiters

This performance dashboard demonstrates the following skills:
- **JavaScript Programming**: Complex data processing and visualization techniques
- **Data Analysis**: Extracting and presenting meaningful metrics from raw data
- **UI/UX Design**: Creating an intuitive and informative interface
- **Problem Solving**: Identifying bottlenecks and inefficiencies in workflows
- **Technical Documentation**: Comprehensive and clear documentation

The code is structured for maintainability with clear separation of concerns:
- Data loading and processing
- Metric calculation
- Visualization rendering
- User interaction handling

## License

This project is open source and available for educational and professional use.

## Acknowledgements

- Chart.js for visualization capabilities
- Marked.js for markdown rendering in the reports section