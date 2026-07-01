import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { 
  LayoutDashboard, Rss, Search, Building2, Bookmark, 
  BarChart3, Bot, FileText, PlayCircle 
} from 'lucide-react';

const tabs = [
  { name: 'Dashboard', path: '/monitor/dashboard', icon: LayoutDashboard },
  { name: 'News Feed', path: '/monitor/news-feed', icon: Rss },
  { name: 'Investigations', path: '/monitor/investigations', icon: Search },
  { name: 'Monitored Companies', path: '/monitor/companies', icon: Building2 },
  { name: 'Watchlists', path: '/monitor/watchlists', icon: Bookmark },
  { name: 'Risk Analytics', path: '/monitor/risk-analytics', icon: BarChart3 },
  { name: 'Reports', path: '/monitor/reports', icon: FileText },
];

export function MonitorLayout() {
  const location = useLocation();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F8F9FC] font-sans text-slate-800">
        <div className="max-w-screen-2xl mx-auto px-6 py-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[28px] font-bold text-slate-900 mb-2 tracking-tight">Monitor Customers</h1>
              <p className="text-[14px] text-slate-500 max-w-4xl leading-relaxed">
                An AI-powered risk analyst continuously monitoring every customer on your portfolio — proactively telling you what matters before it becomes a problem.
              </p>
            </div>
          </div>

          {/* Horizontal Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 mb-6 bg-white rounded-t-xl px-2 pt-2 shadow-sm">
            {tabs.map(tab => {
              const isActive = location.pathname.startsWith(tab.path);
              return (
                <NavLink
                  key={tab.name}
                  to={tab.path}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap
                    ${isActive 
                      ? 'border-pink-600 text-pink-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }
                  `}
                >
                  <tab.icon className={`w-4 h-4 ${isActive ? 'text-pink-600' : 'text-slate-400'}`} />
                  {tab.name}
                </NavLink>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="pb-12">
            <Outlet />
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
