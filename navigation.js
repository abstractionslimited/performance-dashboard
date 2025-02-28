// navigation.js
const Navigation = () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  return (
    <nav className="bg-gray-800 text-white shadow-lg mb-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-4">
            <div className="flex items-center py-4">
              <span className="font-bold text-lg">Performance Review</span>
            </div>
            <div className="flex items-center space-x-1">
              <a href="index.html" className={`py-4 px-3 ${currentPage === 'index.html' ? 'text-blue-300 border-b-2 border-blue-300' : 'hover:text-blue-300'}`}>
                Dashboard
              </a>
              <a href="tickets.html" className={`py-4 px-3 ${currentPage === 'tickets.html' ? 'text-blue-300 border-b-2 border-blue-300' : 'hover:text-blue-300'}`}>
                Tickets by Project
              </a>
              <a href="report.html" className={`py-4 px-3 ${currentPage === 'report.html' ? 'text-blue-300 border-b-2 border-blue-300' : 'hover:text-blue-300'}`}>
                Performance Report
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};