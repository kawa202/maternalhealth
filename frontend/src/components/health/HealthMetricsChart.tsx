import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export function HealthMetricsChart() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = localStorage.getItem('user');

  const userId = JSON.parse(user).id;

  // Function to fetch data from backend
  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/get_metrics/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setMetrics(data.metrics);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Build datasets by mapping each metric entry.
  const heartRateData = metrics
    .map((m) => {
      return {
        x: format(new Date(m.date), 'HH:mm'),
        y: Number(m.heartrate),
      };
    })
    .filter((point) => !isNaN(point.y));

  const systolicBPData = metrics
    .map((m) => {
      return {
        x: format(new Date(m.date), 'HH:mm'),
        y: Number(m.systolic_bp),
      };
    })
    .filter((point) => !isNaN(point.y));

  const diastolicBPData = metrics
    .map((m) => {
      return {
        x: format(new Date(m.date), 'HH:mm'),
        y: Number(m.diastolic_bp),
      };
    })
    .filter((point) => !isNaN(point.y));

  const bloodSugarData = metrics
    .map((m) => {
      return {
        x: format(new Date(m.date), 'HH:mm'),
        y: Number(m.bs),
      };
    })
    .filter((point) => !isNaN(point.y));

  const bodyTempData = metrics
    .map((m) => {
      return {
        x: format(new Date(m.date), 'HH:mm'),
        y: Number(m.body_temp),
      };
    })
    .filter((point) => !isNaN(point.y));

  // Prepare the datasets for the combined Heart Rate & Blood Pressure chart.
  const heartRateDataSet = {
    label: 'Heart Rate (bpm)',
    data: heartRateData.map((d) => d.y),
    borderColor: '#4A90E2',
    backgroundColor: 'rgba(74, 144, 226, 0.5)',
  };

  const systolicBPDataSet = {
    label: 'Systolic BP (mmHg)',
    data: systolicBPData.map((d) => d.y),
    borderColor: '#FF5733',
    backgroundColor: 'rgba(255, 87, 51, 0.5)',
  };

  const diastolicBPDataSet = {
    label: 'Diastolic BP (mmHg)',
    data: diastolicBPData.map((d) => d.y),
    borderColor: '#FFB533',
    backgroundColor: 'rgba(255, 181, 51, 0.5)',
  };

  // For the combo chart, use labels from heartRateData (if available) or merge timestamps appropriately.
  const labels = heartRateData.map((d) => d.x);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* All charts in a single column layout */}
      <div className="space-y-6">
        {/* Combined Chart: Heart Rate & Blood Pressure */}
        <div className="rounded-lg bg-white p-4 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold">
            Heart Rate & Blood Pressure Trend
          </h3>
          <Line
            options={options}
            data={{
              labels,
              datasets: [heartRateDataSet, systolicBPDataSet, diastolicBPDataSet],
            }}
          />
        </div>

        {/* Blood Sugar Chart */}
        {/* <div className="rounded-lg bg-white p-4 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold">Blood Sugar Trend</h3>
          <Line
            options={options}
            data={{
              labels: bloodSugarData.map((d) => d.x),
              datasets: [
                {
                  label: 'Blood Sugar (mg/dL)',
                  data: bloodSugarData.map((d) => d.y),
                  borderColor: '#4CAF50',
                  backgroundColor: 'rgba(76, 175, 80, 0.5)',
                },
              ],
            }}
          />
        </div> */}

        {/* Body Temperature Chart */}
        {/* <div className="rounded-lg bg-white p-4 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold">Body Temperature Trend</h3>
          <Line
            options={options}
            data={{
              labels: bodyTempData.map((d) => d.x),
              datasets: [
                {
                  label: 'Body Temperature (°C)',
                  data: bodyTempData.map((d) => d.y),
                  borderColor: '#FF9800',
                  backgroundColor: 'rgba(255, 152, 0, 0.5)',
                },
              ],
            }}
          />
        </div> */}
      </div>
    </div>
  );
}
