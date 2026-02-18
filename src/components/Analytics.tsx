'use client';

import React, { useMemo } from 'react';
import { useCrm } from '@/context/CrmContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  Calendar,
  DollarSign,
  Target,
  Activity,
  BarChart3,
  PieChartIcon
} from 'lucide-react';

const Analytics: React.FC = () => {
  const { companies, filteredCompanies } = useCrm();

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(c.latestContact) > thirtyDaysAgo;
    }).length;

    const totalEmails = companies.reduce((sum, c) => sum + c.totalEmails, 0);
    const totalFollowUps = companies.reduce((sum, c) => sum + c.followUps.length, 0);
    const completedFollowUps = companies.reduce((sum, c) => 
      sum + c.followUps.filter(f => f.completed).length, 0
    );

    const conversionRate = companies.filter(c => c.status === 'Won').length / totalCompanies * 100;
    const avgScore = companies.reduce((sum, c) => sum + c.overallScore, 0) / totalCompanies;

    return {
      totalCompanies,
      activeCompanies,
      inactiveCompanies: totalCompanies - activeCompanies,
      totalEmails,
      totalFollowUps,
      completedFollowUps,
      pendingFollowUps: totalFollowUps - completedFollowUps,
      conversionRate,
      avgScore,
      followUpCompletionRate: totalFollowUps > 0 ? (completedFollowUps / totalFollowUps * 100) : 0
    };
  }, [companies]);

  // Category distribution
  const categoryData = useMemo(() => {
    const categories = companies.reduce((acc, company) => {
      acc[company.category] = (acc[company.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [companies]);

  // Status distribution
  const statusData = useMemo(() => {
    const statuses = companies.reduce((acc, company) => {
      acc[company.status] = (acc[company.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [companies]);

  // Priority distribution
  const priorityData = useMemo(() => {
    const priorities = companies.reduce((acc, company) => {
      acc[company.priority] = (acc[company.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(priorities).map(([name, value]) => ({ name, value }));
  }, [companies]);

  // Activity trend (last 30 days)
  const activityTrend = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const days: Array<{
      date: string;
      day: string;
      companies: number;
      emails: number;
      followUps: number;
    }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        companies: 0,
        emails: 0,
        followUps: 0
      });
    }

    // Count activities per day
    companies.forEach(company => {
      // Count companies with activity on each day
      const latestContactDate = new Date(company.latestContact).toISOString().split('T')[0];
      const dayData = days.find(d => d.date === latestContactDate);
      if (dayData) {
        dayData.companies++;
      }

      // Count emails per day
      company.emails.forEach(email => {
        const emailDate = new Date(email.date).toISOString().split('T')[0];
        const dayData = days.find(d => d.date === emailDate);
        if (dayData) {
          dayData.emails++;
        }
      });

      // Count follow-ups per day
      company.followUps.forEach(followUp => {
        const followUpDate = new Date(followUp.createdAt).toISOString().split('T')[0];
        const dayData = days.find(d => d.date === followUpDate);
        if (dayData) {
          dayData.followUps++;
        }
      });
    });

    return days;
  }, [companies]);

  // Score distribution
  const scoreDistribution = useMemo(() => {
    const buckets = [
      { range: '0-100', min: 0, max: 100, count: 0 },
      { range: '101-500', min: 101, max: 500, count: 0 },
      { range: '501-1000', min: 501, max: 1000, count: 0 },
      { range: '1001-5000', min: 1001, max: 5000, count: 0 },
      { range: '5000+', min: 5001, max: Infinity, count: 0 }
    ];

    companies.forEach(company => {
      const bucket = buckets.find(b => 
        company.overallScore >= b.min && company.overallScore <= b.max
      );
      if (bucket) {
        bucket.count++;
      }
    });

    return buckets.map(b => ({ name: b.range, value: b.count }));
  }, [companies]);

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  const MetricCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    trend?: number;
    suffix?: string;
  }> = ({ title, value, icon, trend, suffix = '' }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {trend > 0 ? (
                <TrendingUp size={16} className="text-green-500" />
              ) : (
                <TrendingDown size={16} className="text-red-500" />
              )}
              <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Companies"
            value={metrics.totalCompanies}
            icon={<Users className="text-blue-600" size={24} />}
          />
          
          <MetricCard
            title="Active (30 days)"
            value={metrics.activeCompanies}
            icon={<Activity className="text-green-600" size={24} />}
          />

          <MetricCard
            title="Total Emails"
            value={metrics.totalEmails}
            icon={<Mail className="text-purple-600" size={24} />}
          />

          <MetricCard
            title="Conversion Rate"
            value={metrics.conversionRate.toFixed(1)}
            suffix="%"
            icon={<Target className="text-orange-600" size={24} />}
          />

          <MetricCard
            title="Avg Lead Score"
            value={Math.round(metrics.avgScore)}
            icon={<BarChart3 className="text-indigo-600" size={24} />}
          />

          <MetricCard
            title="Follow-up Rate"
            value={metrics.followUpCompletionRate.toFixed(1)}
            suffix="%"
            icon={<Calendar className="text-pink-600" size={24} />}
          />

          <MetricCard
            title="Pending Tasks"
            value={metrics.pendingFollowUps}
            icon={<Calendar className="text-red-600" size={24} />}
          />

          <MetricCard
            title="Won Deals"
            value={companies.filter(c => c.status === 'Won').length}
            icon={<DollarSign className="text-green-600" size={24} />}
          />
        </div>

        {/* Activity Trend */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Activity Trend (Last 30 Days)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="companies" 
                  stackId="1"
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6}
                  name="Active Companies"
                />
                <Area 
                  type="monotone" 
                  dataKey="emails" 
                  stackId="2"
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.6}
                  name="Emails"
                />
                <Area 
                  type="monotone" 
                  dataKey="followUps" 
                  stackId="3"
                  stroke="#F59E0B" 
                  fill="#F59E0B" 
                  fillOpacity={0.6}
                  name="Follow-ups"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <PieChartIcon size={20} />
              Category Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pipeline Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {priorityData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.name === 'Hot' ? '#EF4444' : 
                          entry.name === 'Warm' ? '#F59E0B' : 
                          '#3B82F6'
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score Distribution */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Score Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Prospects by Score</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emails</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...companies]
                  .sort((a, b) => b.overallScore - a.overallScore)
                  .slice(0, 10)
                  .map((company) => (
                    <tr key={company.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {company.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {company.overallScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.totalEmails}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          company.status === 'Won' ? 'bg-green-100 text-green-800' :
                          company.status === 'Quoted' ? 'bg-purple-100 text-purple-800' :
                          company.status === 'Qualified' ? 'bg-yellow-100 text-yellow-800' :
                          company.status === 'Lost' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          company.priority === 'Hot' ? 'bg-red-100 text-red-800' :
                          company.priority === 'Warm' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {company.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;