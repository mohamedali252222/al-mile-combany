
import React from 'react';
import Icon from './Icon';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  iconColor: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, iconColor }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
      <div className={`p-3 rounded-full ${iconColor}`}>
        <Icon name={icon} className="w-6 h-6 text-white" />
      </div>
      <div className="mx-4">
        <h4 className="text-sm font-semibold text-gray-500">{title}</h4>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
