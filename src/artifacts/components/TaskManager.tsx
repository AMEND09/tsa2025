import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { Task } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  handleDeleteTask: (id: number) => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks, handleDeleteTask }) => {
  const [taskInput, setTaskInput] = useState({ title: '', dueDate: '', priority: 'medium' });

  const handleTaskSubmit = () => {
    setTasks([...tasks, { ...taskInput, id: Date.now(), completed: false }]);
    setTaskInput({ title: '', dueDate: '', priority: 'medium' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Farm Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              name="title"
              placeholder="New task"
              value={taskInput.title}
              onChange={(e) => setTaskInput(prev => ({ ...prev, title: e.target.value }))}
              className="border rounded px-2 py-1"
            />
            <Input 
              name="dueDate"
              type="date"
              value={taskInput.dueDate}
              onChange={(e) => setTaskInput(prev => ({ ...prev, dueDate: e.target.value }))}
              className="border rounded px-2 py-1"
            />
            <Button onClick={handleTaskSubmit}>Add</Button>
          </div>
          <div className="space-y-2">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className={task.completed ? 'line-through' : ''}>
                  {task.title}
                </span>
                <div className="flex gap-2">
                  <span className="text-sm text-gray-500">{task.dueDate}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setTasks(tasks.map(t => 
                        t.id === task.id ? {...t, completed: !t.completed} : t
                      ));
                    }}
                  >
                    {task.completed ? 'Undo' : 'Complete'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskManager;