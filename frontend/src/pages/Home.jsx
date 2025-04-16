// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [ranges, setRanges] = useState([]);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchRanges = async () => {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/range`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRanges(res.data);
    };

    fetchRanges();
  }, [token]);
  const handleRangeClick = (rangeId) => {
    navigate(`/view_range/${rangeId}`);
  }
  const handleCreateRangeClick = () => {
    navigate(`/create_range`);
  }
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Ranges</h1>
        <div>
          <button className="btn mr-2" onClick={() => handleCreateRangeClick()}>Create Range</button>
          <button className="btn bg-red-500" onClick={() => dispatch(logout())}>Logout</button>
        </div>
      </div>
      {ranges.length === 0 ? (
        <p className="text-gray-500">No ranges created yet. Click "Create Range" to get started.</p>
      ) : (
        <ul className="space-y-2">
          {ranges.map((range) => (
            <li key={range._id} className="p-4 bg-white shadow rounded" onClick={() => handleRangeClick(range._id)}>
              {range.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;
