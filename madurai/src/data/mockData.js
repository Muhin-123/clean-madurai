export const WARDS = [
  'Anna Nagar', 'Sellur', 'Teppakulam', 'Goripalayam', 'KK Nagar',
  'Tallakulam', 'Arasaradi', 'Villapuram', 'Simmakkal', 'Palanganatham',
  'Thirumangalam', 'Madakulam', 'Usilampatti Road', 'Othakadai', 'Aruppukottai Road',
];

export const mockStats = {
  complaintsToday: 47,
  pendingComplaints: 23,
  resolvedToday: 24,
  criticalBins: 8,
  toiletComplaints: 12,
  bioWasteTraded: 1240,
};

export const mockComplaints = [
  { id: 'CMP001', type: 'Garbage Overflow', ward: 'Anna Nagar', status: 'Pending', time: '08:32 AM', priority: 'High', image: null, location: { lat: 9.9252, lng: 78.1198 } },
  { id: 'CMP002', type: 'Open Drain', ward: 'Sellur', status: 'In Progress', time: '09:15 AM', priority: 'Medium', image: null, location: { lat: 9.9180, lng: 78.1100 } },
  { id: 'CMP003', type: 'Dead Animal', ward: 'Teppakulam', status: 'Resolved', time: '07:45 AM', priority: 'High', image: null, location: { lat: 9.9300, lng: 78.1250 } },
  { id: 'CMP004', type: 'Garbage Overflow', ward: 'KK Nagar', status: 'Pending', time: '10:20 AM', priority: 'Low', image: null, location: { lat: 9.9400, lng: 78.1300 } },
  { id: 'CMP005', type: 'Blocked Drain', ward: 'Goripalayam', status: 'In Progress', time: '11:00 AM', priority: 'Medium', image: null, location: { lat: 9.9150, lng: 78.1050 } },
  { id: 'CMP006', type: 'Street Cleaning', ward: 'Tallakulam', status: 'Resolved', time: '06:30 AM', priority: 'Low', image: null, location: { lat: 9.9350, lng: 78.1150 } },
  { id: 'CMP007', type: 'Garbage Overflow', ward: 'Arasaradi', status: 'Pending', time: '12:15 PM', priority: 'High', image: null, location: { lat: 9.9280, lng: 78.1180 } },
  { id: 'CMP008', type: 'Open Drain', ward: 'Villapuram', status: 'Resolved', time: '01:00 PM', priority: 'Medium', image: null, location: { lat: 9.9100, lng: 78.0950 } },
];

export const mockToiletComplaints = [
  { id: 'TC001', location: 'Meenakshi Temple Bus Stop', issue: 'Not Cleaned', status: 'Pending', time: '08:00 AM', ward: 'Simmakkal' },
  { id: 'TC002', location: 'Central Bus Stand', issue: 'Water Supply Issue', status: 'In Progress', time: '09:30 AM', ward: 'Tallakulam' },
  { id: 'TC003', location: 'Sellur Market', issue: 'Broken Door', status: 'Resolved', time: '07:00 AM', ward: 'Sellur' },
  { id: 'TC004', location: 'KK Nagar Park', issue: 'Not Cleaned', status: 'Pending', time: '10:00 AM', ward: 'KK Nagar' },
  { id: 'TC005', location: 'Teppakulam Tank', issue: 'Stink Issue', status: 'In Progress', time: '11:30 AM', ward: 'Teppakulam' },
];

export const mockSmartBins = [
  { id: 'BIN001', ward: 'Anna Nagar', lat: 9.9252, lng: 78.1198, fill: 92, status: 'Critical', lastCleaned: '2024-01-15 06:00', lidOpen: false },
  { id: 'BIN002', ward: 'Sellur', lat: 9.9180, lng: 78.1100, fill: 65, status: 'Warning', lastCleaned: '2024-01-15 08:00', lidOpen: false },
  { id: 'BIN003', ward: 'Teppakulam', lat: 9.9300, lng: 78.1250, fill: 30, status: 'Good', lastCleaned: '2024-01-15 07:30', lidOpen: true },
  { id: 'BIN004', ward: 'Goripalayam', lat: 9.9150, lng: 78.1050, fill: 88, status: 'Critical', lastCleaned: '2024-01-15 05:00', lidOpen: false },
  { id: 'BIN005', ward: 'KK Nagar', lat: 9.9400, lng: 78.1300, fill: 45, status: 'Good', lastCleaned: '2024-01-15 09:00', lidOpen: false },
  { id: 'BIN006', ward: 'Tallakulam', lat: 9.9350, lng: 78.1150, fill: 75, status: 'Warning', lastCleaned: '2024-01-15 06:30', lidOpen: false },
  { id: 'BIN007', ward: 'Arasaradi', lat: 9.9280, lng: 78.1180, fill: 20, status: 'Good', lastCleaned: '2024-01-15 10:00', lidOpen: true },
  { id: 'BIN008', ward: 'Simmakkal', lat: 9.9200, lng: 78.1130, fill: 95, status: 'Critical', lastCleaned: '2024-01-14 18:00', lidOpen: false },
  { id: 'BIN009', ward: 'Palanganatham', lat: 9.9450, lng: 78.1350, fill: 55, status: 'Warning', lastCleaned: '2024-01-15 07:00', lidOpen: false },
  { id: 'BIN010', ward: 'Villapuram', lat: 9.9100, lng: 78.0950, fill: 10, status: 'Good', lastCleaned: '2024-01-15 11:00', lidOpen: true },
];

export const mockWardRankings = [
  { rank: 1, ward: 'Anna Nagar', score: 96.5, complaints: 2, cleanliness: 98, response: 95, prevRank: 2, change: 'up' },
  { rank: 2, ward: 'Teppakulam', score: 94.2, complaints: 3, cleanliness: 96, response: 92, prevRank: 1, change: 'down' },
  { rank: 3, ward: 'KK Nagar', score: 91.8, complaints: 5, cleanliness: 93, response: 90, prevRank: 3, change: 'same' },
  { rank: 4, ward: 'Tallakulam', score: 88.4, complaints: 7, cleanliness: 89, response: 88, prevRank: 5, change: 'up' },
  { rank: 5, ward: 'Arasaradi', score: 85.0, complaints: 10, cleanliness: 86, response: 84, prevRank: 4, change: 'down' },
  { rank: 6, ward: 'Sellur', score: 82.3, complaints: 12, cleanliness: 83, response: 81, prevRank: 6, change: 'same' },
  { rank: 7, ward: 'Goripalayam', score: 78.9, complaints: 15, cleanliness: 79, response: 78, prevRank: 8, change: 'up' },
  { rank: 8, ward: 'Simmakkal', score: 75.6, complaints: 18, cleanliness: 76, response: 75, prevRank: 7, change: 'down' },
];

export const mockBioWaste = [
  { id: 'BW001', title: 'Vegetable Waste – 50kg', seller: 'Krishnamurthy Farm', ward: 'Arasaradi', price: 500, unit: 'per quintal', quantity: 50, type: 'Vegetable', co2Saved: 12.5, listed: '2 hours ago', contact: '9842XXXXXX', image: null, lat: 9.9280, lng: 78.1180 },
  { id: 'BW002', title: 'Garden Waste – 100kg', seller: 'Green Thumb Nursery', ward: 'KK Nagar', price: 200, unit: 'per quintal', quantity: 100, type: 'Garden', co2Saved: 25.0, listed: '5 hours ago', contact: '9843XXXXXX', image: null, lat: 9.9400, lng: 78.1300 },
  { id: 'BW003', title: 'Rice Husk – 200kg', seller: 'Murugan Rice Mill', ward: 'Sellur', price: 1200, unit: 'per quintal', quantity: 200, type: 'Agricultural', co2Saved: 50.0, listed: '1 day ago', contact: '9841XXXXXX', image: null, lat: 9.9180, lng: 78.1100 },
  { id: 'BW004', title: 'Fruit Waste – 30kg', seller: 'Annamalai Fruits', ward: 'Teppakulam', price: 300, unit: 'per quintal', quantity: 30, type: 'Fruit', co2Saved: 7.5, listed: '3 hours ago', contact: '9844XXXXXX', image: null, lat: 9.9300, lng: 78.1250 },
  { id: 'BW005', title: 'Coconut Shells – 80kg', seller: 'Velu Coir Works', ward: 'Tallakulam', price: 800, unit: 'per quintal', quantity: 80, type: 'Agricultural', co2Saved: 20.0, listed: '6 hours ago', contact: '9845XXXXXX', image: null, lat: 9.9350, lng: 78.1150 },
  { id: 'BW006', title: 'Used Cooking Oil – 20L', seller: 'Hotel Saravana Bhavan', ward: 'Anna Nagar', price: 2500, unit: 'per 100L', quantity: 20, type: 'Oil', co2Saved: 5.0, listed: '30 min ago', contact: '9846XXXXXX', image: null, lat: 9.9252, lng: 78.1198 },
];

export const chartData = {
  wardComplaints: {
    labels: ['Anna Nagar', 'Sellur', 'Teppakulam', 'Goripalayam', 'KK Nagar', 'Tallakulam', 'Arasaradi', 'Simmakkal'],
    datasets: [{
      label: 'Complaints',
      data: [12, 19, 8, 15, 7, 11, 14, 18],
      backgroundColor: [
        'rgba(15, 76, 129, 0.8)', 'rgba(0, 168, 107, 0.8)', 'rgba(15, 76, 129, 0.6)',
        'rgba(229, 57, 53, 0.7)', 'rgba(0, 168, 107, 0.6)', 'rgba(255, 193, 7, 0.7)',
        'rgba(108, 92, 231, 0.7)', 'rgba(229, 57, 53, 0.5)',
      ],
      borderRadius: 8,
      borderSkipped: false,
    }],
  },
  complaintTypes: {
    labels: ['Garbage Overflow', 'Open Drain', 'Dead Animal', 'Street Cleaning', 'Blocked Drain', 'Toilet Issue'],
    datasets: [{
      data: [35, 20, 10, 15, 12, 8],
      backgroundColor: ['#0F4C81', '#00A86B', '#E53935', '#FFC107', '#6C5CE7', '#00b4d8'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  },
  weeklyTrend: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Complaints Filed',
        data: [42, 58, 35, 67, 47, 28, 19],
        borderColor: '#0F4C81',
        backgroundColor: 'rgba(15, 76, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0F4C81',
        pointRadius: 5,
      },
      {
        label: 'Resolved',
        data: [38, 52, 30, 60, 44, 25, 15],
        borderColor: '#00A86B',
        backgroundColor: 'rgba(0, 168, 107, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00A86B',
        pointRadius: 5,
      },
    ],
  },
  bioWaste: {
    labels: ['Composted', 'Biogas', 'Animal Feed', 'Remaining'],
    datasets: [{
      data: [45, 25, 20, 10],
      backgroundColor: ['#00A86B', '#0F4C81', '#FFC107', '#E53935'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  },
};
