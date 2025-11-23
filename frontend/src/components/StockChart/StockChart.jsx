import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

function StockChart({ data, timeframe }) {

  if (!data || data.length === 0) {
    return <p style={{ color: 'white' }}>No data available</p>;
  }

  const parsedData = data.map(point => ({
    ...point,
    dateObj: new Date(point.date),
  }));

  const filteredData = timeframe === '1wk'
    ? Object.values(parsedData.reduce((acc, cur) => {
        const dateKey = cur.dateObj.toISOString().split('T')[0];
        acc[dateKey] = cur;
        return acc;
      }, {}))
    : parsedData;

  const tickFormatter = (tick) => {
    const date = new Date(tick);
    if (timeframe === '1d') {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (timeframe === '1wk') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="bg-background p-5 rounded-xl">
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={filteredData}>

          <CartesianGrid stroke="var(--color-secondary)" strokeDasharray="5 5" />

          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--color-text)' }}
            stroke="var(--color-text)"
            tickFormatter={tickFormatter}
            />

          <YAxis
            stroke="var(--color-text)"
            tick={{ fill: 'var(--color-text)' }}
            domain={['dataMin - 5', 'dataMax + 5']}
            tickFormatter={(val) => `$${val}`}
            />

          <Tooltip
            contentStyle={{ backgroundColor: 'var(--color-background)', border: 'none' }}
            labelStyle={{ color: 'var(--color-text)' }}
            itemStyle={{ color: 'var(--color-text)' }}
            labelFormatter={(label) => {
              const d = new Date(label);
              return d.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
            }}
            />

          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={{ fill: 'var(--color-primary)', r: 3 }}
            activeDot={{ fill: 'var(--color-primary)', r: 5 }}
            />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StockChart;
