import React from "react";
import { Bookmark, CategoryStats } from "../services/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

interface DashboardProps {
  bookmarks: Bookmark[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

export const Dashboard: React.FC<DashboardProps> = ({ bookmarks }) => {
  const total = bookmarks.length;
  const favorites = bookmarks.filter(b => b.isFavorite).length;
  const uncategorized = bookmarks.filter(b => !b.category).length;
  const suspects = bookmarks.filter(b => b.linkStatus === 'suspect' || b.linkStatus === 'dead').length;

  const categoryData: CategoryStats[] = bookmarks.reduce((acc, curr) => {
    const cat = curr.category || "Non classé";
    const existing = acc.find(i => i.name === cat);
    if (existing) existing.count++;
    else acc.push({ name: cat, count: 1 });
    return acc;
  }, [] as CategoryStats[]).sort((a, b) => b.count - a.count).slice(0, 7);

  const sourceData = bookmarks.reduce((acc, curr) => {
    const src = curr.source;
    const existing = acc.find(i => i.name === src);
    if(existing) existing.count++;
    else acc.push({name: src, count: 1});
    return acc;
  }, [] as CategoryStats[]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-slate-500 text-sm">Total Favoris</div>
          <div className="text-2xl font-bold text-slate-800">{total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-400">
          <div className="text-slate-500 text-sm">Favoris (Star)</div>
          <div className="text-2xl font-bold text-slate-800">{favorites}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-slate-400">
          <div className="text-slate-500 text-sm">Non Classés</div>
          <div className="text-2xl font-bold text-slate-800">{uncategorized}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="text-slate-500 text-sm">Liens Suspects</div>
          <div className="text-2xl font-bold text-slate-800">{suspects}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Répartition par Catégorie</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label
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
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Répartition par Source</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={sourceData}>
                 <XAxis dataKey="name" />
                 <YAxis />
                 <Tooltip />
                 <Bar dataKey="count" fill="#3B82F6" />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
