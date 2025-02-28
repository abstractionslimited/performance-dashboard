const { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } = Recharts;

const PerformanceDashboard = () => {
  // Status data
  const statusData = [
    { name: "Done", value: 51 },
    { name: "Not Applicable", value: 2 },
    { name: "Cancelled", value: 1 },
    { name: "Doing", value: 1 }
  ];

  // Type data
  const typeData = [
    { name: "Development Subtask", value: 39 },
    { name: "Maintenance Task", value: 7 },
    { name: "Review Subtask", value: 4 },
    { name: "Story", value: 3 },
    { name: "Task", value: 1 },
    { name: "Defect", value: 1 }
  ];

  // Monthly data
  const monthlyData = [
    { name: "Jan 2025", count: 1 },
    { name: "Nov 2024", count: 7 },
    { name: "Oct 2024", count: 3 },
    { name: "Sep 2024", count: 1 },
    { name: "Aug 2024", count: 5 }
  ];

  // Key projects
  const keyProjects = [
    {
      name: "NI Migration",
      key: "NI-Migration",
      startDate: "February 10, 2025",
      endDate: "February 17, 2025",
      duration: 7,
      status: "Done"
    },
    {
      name: "VB Top 6 Activation",
      key: "VB-Top6",
      startDate: "February 19, 2025",
      endDate: "February 28, 2025",
      duration: 9,
      status: "Done"
    },
    {
      name: "PWA Send Free SMS",
      key: "PAPP-3652",
      startDate: "November 21, 2023",
      endDate: "May 3, 2024",
      duration: 165,
      status: "Done"
    },
    {
      name: "1App Recharge with Pin Journey",
      key: "PAPP-5108",
      startDate: "June 4, 2024",
      endDate: "September 5, 2024",
      duration: 93,
      status: "Done"
    },
    {
      name: "Summer 2024",
      key: "PAPP-5791",
      startDate: "August 28, 2024",
      endDate: "September 9, 2024",
      duration: 12,
      status: "Done"
    },
    {
      name: "Apollo Federation Migration",
      key: "PAPP-4955",
      startDate: "May 16, 2024",
      endDate: "June 10, 2024",
      duration: 26,
      status: "Done"
    },
    {
      name: "Storybook Implementation",
      key: "Simplicity",
      startDate: "July 11, 2024",
      endDate: "February 13, 2025",
      duration: 218,
      status: "Done"
    }
  ];

  // Timeline events
  const timelineEvents = [
    { date: "February 10", event: "Started NI Migration project", type: "start" },
    { date: "February 17", event: "Completed NI Migration project", type: "complete" },
    { date: "February 19", event: "Started VB Top 6 Activation", type: "start" },
    { date: "February 28", event: "Completed VB Top 6 Activation", type: "complete" }
  ];

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Performance Dashboard</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg shadow p-4 text-center">
          <h3 className="text-sm text-gray-500 mb-1">Total Tickets</h3>
          <p className="text-2xl font-bold">55</p>
          <p className="text-xs text-gray-500">Across 4 teams</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 text-center">
          <h3 className="text-sm text-gray-500 mb-1">Completed</h3>
          <p className="text-2xl font-bold">51</p>
          <p className="text-xs text-gray-500">92.7% completion rate</p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4 text-center">
          <h3 className="text-sm text-gray-500 mb-1">Key Projects</h3>
          <p className="text-2xl font-bold">7</p>
          <p className="text-xs text-gray-500">Major initiatives</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4 text-center">
          <h3 className="text-sm text-gray-500 mb-1">Teams</h3>
          <p className="text-2xl font-bold">4</p>
          <p className="text-xs text-gray-500">Cross-functional impact</p>
        </div>
      </div>

      {/* Key Projects Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Key Projects Completed</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border">Project</th>
                <th className="py-2 px-4 border">Key</th>
                <th className="py-2 px-4 border">Start Date</th>
                <th className="py-2 px-4 border">End Date</th>
                <th className="py-2 px-4 border">Duration (days)</th>
                <th className="py-2 px-4 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {keyProjects.map((project, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border font-medium">{project.name}</td>
                  <td className="py-2 px-4 border">{project.key}</td>
                  <td className="py-2 px-4 border">{project.startDate}</td>
                  <td className="py-2 px-4 border">{project.endDate}</td>
                  <td className="py-2 px-4 border text-center">{project.duration}</td>
                  <td className="py-2 px-4 border">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      {project.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Squad Impact */}
      <div className="mb-10">
        <h3 className="text-lg font-medium mb-2">Cross-Squad Impact</h3>
        <div className="bg-purple-50 p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded shadow">
              <h4 className="font-semibold mb-1">1App Squad</h4>
              <p className="text-sm">Summer 2024 campaign, Recharge with Pin Journey, Apollo Federation Migration</p>
            </div>
            <div className="p-3 bg-white rounded shadow">
              <h4 className="font-semibold mb-1">Fibre Squad</h4>
              <p className="text-sm">1App Homepage Redesign and mobile upsell for fiber profiles</p>
            </div>
            <div className="p-3 bg-white rounded shadow">
              <h4 className="font-semibold mb-1">Vodacom Business</h4>
              <p className="text-sm">Integration with business systems and services</p>
            </div>
            <div className="p-3 bg-white rounded shadow">
              <h4 className="font-semibold mb-1">Services Squad</h4>
              <p className="text-sm">NI Migration for Pay My Bill service and infrastructure improvements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Ticket Status Chart */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2 text-center">Ticket Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Type Chart */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2 text-center">Ticket Type Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={typeData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="mb-10">
        <h3 className="text-lg font-medium mb-2">Monthly Ticket Volume</h3>
        <div className="h-64 bg-gray-50 p-4 rounded-lg shadow">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* February Timeline */}
      <div className="mb-10">
        <h3 className="text-lg font-medium mb-4">February 2025 Timeline</h3>
        <div className="relative border-l-2 border-blue-300 ml-6">
          {timelineEvents.map((event, index) => (
            <div key={index} className="mb-6 ml-6 relative">
              <div className={`absolute -left-8 w-4 h-4 rounded-full ${event.type === 'start' ? 'bg-blue-500' : 'bg-green-500'
                }`}></div>
              <div className="bg-gray-50 p-3 rounded shadow">
                <p className="font-medium">{event.date}</p>
                <p>{event.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Achievements */}
      <div className="mb-10">
        <h3 className="text-lg font-medium mb-2">Key Achievements</h3>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <ul className="list-disc pl-5 space-y-2">
            <li>Successfully completed NI Migration project ahead of schedule</li>
            <li>Delivered VB Top 6 Activation with zero defects reported</li>
            <li>Completed the complex PWA Send Free SMS project (165 days)</li>
            <li>Successfully implemented 1App Recharge with Pin Journey</li>
            <li>Delivered Summer 2024 project features on schedule</li>
            <li>Successfully migrated to Apollo Federation architecture, enhancing system scalability</li>
            <li>Implemented Storybook as part of the Vodacom Design System, streamlining development</li>
            <li>Maintained 92.7% completion rate across all assigned tickets</li>
            <li>Collaborated effectively with cross-functional teams</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Render the dashboard
ReactDOM.render(<PerformanceDashboard />, document.getElementById('root'));