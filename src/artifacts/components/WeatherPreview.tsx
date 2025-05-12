import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherData } from '../types';

interface WeatherPreviewProps {
  weatherData: WeatherData[];
}

const WeatherPreview: React.FC<WeatherPreviewProps> = ({ weatherData }) => (
  <Card>
    <CardHeader>
      <CardTitle>10-Day Weather Preview</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {weatherData.length > 0 ? (
          weatherData.map((day, index) => (
            <div key={index} className="text-center p-2 border rounded">
              <p className="text-sm font-medium">{day.date}</p>
              <p className="text-2xl my-2">{day.icon}</p>
              <p className="text-sm text-gray-600">{day.weather}</p>
              <p className="text-lg font-bold">{Math.round(day.temp)}°F</p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            Loading weather data...
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default WeatherPreview;