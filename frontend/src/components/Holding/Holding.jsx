const Holding = ({ quantity, symbol, company, prev_close, last_sale, book_cost, allTime }) => {
  if (!prev_close) {
    prev_close = last_sale;
  }

  const net = allTime ? Math.round(((quantity*last_sale) - book_cost) * 100)/100
    : Math.round((last_sale - prev_close) * 100) / 100;
  const percentChange = allTime ? Math.round((10000 * net) / book_cost)/100
    : Math.round((10000 * net)/prev_close)/100;
  const isPositive = percentChange >= 0;

  return (
    <div className="bg-white shadow-sm rounded-xl p-4 mb-3 hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold">{symbol}</h3>
            <span className="text-gray-500 text-sm">({quantity} shares)</span>
          </div>
          <h5 className="text-gray-500 text-sm">{company}</h5>
        </div>

        
        <div className="text-right">
          <h5 className="text-lg font-medium">${last_sale}</h5>
          <h5
            className={`text-sm font-semibold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : "-"}${Math.abs(net)} ({percentChange}%)
          </h5>
        </div>
      </div>
    </div>
  );
};

export default Holding;
