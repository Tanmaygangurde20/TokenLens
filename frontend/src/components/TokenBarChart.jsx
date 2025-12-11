import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function TokenBarChart({ data }) {
  const processed = (data || []).slice(0, 20).map((d, i) => ({
    name: d.token.replace(/\n/g, "\\n"),
    prob: d.prob
  }));

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={processed} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 'dataMax']} />
          <YAxis dataKey="name" type="category" width={150} />
          <Tooltip />
          <Bar dataKey="prob" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
