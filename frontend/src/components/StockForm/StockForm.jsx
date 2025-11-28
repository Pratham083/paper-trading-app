import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../AuthContext/AuthContext';

function StockForm({ stock, action, setHoldings }) {
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.value;
    if (/^\d+$/.test(value)) {
      setQuantity(Number(value));
    } else {
      setQuantity('');
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false });
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!quantity) {
      showToast('Please enter a value.', 'error');
      return;
    }

    try {
      let res;

      if (action === 'buy') {
        res = await api.post(`/api/holding/buy`, {
          stock_id: stock,
          quantity,
        });
      } else {
        res = await api.post(`/api/holding/sell`, {
          stock_id: stock,
          quantity,
        });
      }
      const holding = res.data.holding;

      if(holding.quantity === 0) {
        setHoldings(null)
      } else {
        setHoldings({
          'quantity':holding.quantity,
          'book_cost':holding.book_cost,
          'avg_price':holding.book_cost/holding.quantity,
          'total_value':holding.quantity*holding.stock.last_sale,
        })
      }

      const msg = holding.quantity != 0 ? `Success: You now own ${holding.quantity} shares of ${holding.stock.symbol}!`
        : `Success: You have sold all your shares of ${holding.stock.symbol}`;
      showToast(msg, 'success');
    } catch (err) {
      let msg = '';

      if (err?.response?.data?.non_field_errors) {
        msg = `Error: ${err.response.data.non_field_errors[0]}`;
      } else {
        msg = 'Error: Unknown, try again later.';
      }

      showToast(msg, 'error');
    }

    setQuantity('');
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mt-4 max-w-[200px] space-y-2"
      >
        <div className="flex border border-secondary rounded-lg overflow-hidden">
          <input
            type="text"
            value={quantity}
            onChange={handleChange}
            placeholder="Enter a value"
            className="
              w-full 
              px-3 py-2 
              text-center 
              border-none 
              bg-background 
              text-text 
              focus:ring-0 
              focus:outline-none
            "
          />

          <button
            type="submit"
            className="
              px-4 
              rounded-r-lg 
              font-medium 
              bg-primary 
              text-text 
              hover:bg-primary-highlighted
            "
          >
            {action}
          </button>
        </div>
      </form>

      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`
              px-4 py-3 
              rounded-lg 
              shadow-lg 
              text-text 
              transition-opacity 
              ${toast.type === 'success' ? 'bg-primary' : 'bg-accent'}
            `}
          >
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
}

export default StockForm;
