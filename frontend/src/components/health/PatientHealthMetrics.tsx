import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type Metric = {
  id: number;
  systolic_bp: string;
  diastolic_bp: string;
  bs: string;
  body_temp?: string;
  heartrate?: string;
  date: string;
};

export function PatientHealthMetrics({ metrics }: { metrics: Metric[] }) {
  const data = metrics.map((m) => ({
    date: new Date(m.date).toLocaleDateString(), // Format date for x-axis
    systolic: Number(m.systolic_bp),
    diastolic: Number(m.diastolic_bp),
    bloodSugar: Number(m.bs),
    heartRate: m.heartrate ? Number(m.heartrate) : undefined,
    temperature: m.body_temp ? Number(m.body_temp) : undefined,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottomRight', offset: -5 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="systolic" stroke="#8884d8" name="Systolic BP" />
        <Line type="monotone" dataKey="diastolic" stroke="#82ca9d" name="Diastolic BP" />
        <Line type="monotone" dataKey="bloodSugar" stroke="#ff7300" name="Blood Sugar" />
        {data.some(d => d.heartRate !== undefined) && (
          <Line type="monotone" dataKey="heartRate" stroke="#e6194b" name="Heart Rate" />
        )}
        {data.some(d => d.temperature !== undefined) && (
          <Line type="monotone" dataKey="temperature" stroke="#4363d8" name="Body Temp" />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
