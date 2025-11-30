import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { formatNumber } from '../../utils';

function StockChart({data, timeframe}) {
  if (!data || data.length === 0) {
    return <p style={{ color: 'white' }}>No data available</p>;
  }

  const parsedData = data.map(point => ({...point,dateObj: new Date(point.date)}));

  const tickFormatter = (tick) => {
    const date = new Date(tick);
    if (timeframe === '1d') {
      return date.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'});
    } else if (timeframe === '1wk') {
      return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
    } else {
      return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
    }
  };

  const generateYTicks = (data, maxTicks=5) => {
    const values = data.map(d => d.price);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const step = (max-min)/(maxTicks-1);
    const ticks = [];

    for (let i = 0; i < maxTicks; i++) {
      ticks.push(min + step * i);
    }

    return ticks;
  }

  const startPrice = parsedData[0].price;
  const endPrice = parsedData[parsedData.length - 1].price;
  const net = endPrice - startPrice;
  const netPercent = 100*net/startPrice;
  const periodText = {
    '1d':'from open',
    '1wk':'past week',
    '1mo':'past month',
    '3mo':'past 3 months',
    '1y':'past year',
    '5y':'past 5 years',
  }

  return (
    <div className="bg-background p-5 rounded-xl">
      <h2 className="text-3xl font-semibold mb-2">${formatNumber(endPrice)} USD</h2>
      <h3 className={`text-xl font-semibold mb-6 ${net > -0.01? "text-green-600":"text-red-600"}`}>
        {net > -0.01 ? '+' : '-'}${formatNumber(net)} ({formatNumber(netPercent)})% {periodText[timeframe]}
      </h3>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={parsedData}>

          <CartesianGrid stroke="var(--color-secondary)" strokeDasharray="5 5" />

          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--color-text)' }}
            stroke="var(--color-text)"
            tickFormatter={tickFormatter}
            interval={Math.ceil(parsedData.length / 8) - 1}
            />

          <YAxis
            stroke="var(--color-text)"
            tick={{ fill: 'var(--color-text)' }}
            domain={([dataMin, dataMax]) => {
              const padding = (dataMax - dataMin) * 0.05;
              return [dataMin - padding, dataMax + padding];
            }}
            tickFormatter={(val) => `$${formatNumber(val)}`}
            ticks={generateYTicks(parsedData, 5)}
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
