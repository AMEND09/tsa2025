import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bug, AlertTriangle } from 'lucide-react';
import { Issue } from '../types';

interface IssueTrackerProps {
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
  handleResolveIssue: (id: number) => void;
}

const IssueTracker: React.FC<IssueTrackerProps> = ({ issues, setIssues, handleResolveIssue }) => {
  const [issueInput, setIssueInput] = useState({ type: '', description: '', severity: 'low' });

  const handleIssueSubmit = () => {
    setIssues([...issues, { ...issueInput, id: Date.now(), status: 'open', dateReported: new Date() }]);
    setIssueInput({ type: '', description: '', severity: 'low' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Farm Issues
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Input 
              name="type"
              placeholder="Issue type (pest, disease, etc.)"
              value={issueInput.type}
              onChange={(e) => setIssueInput(prev => ({ ...prev, type: e.target.value }))}
              className="border rounded px-2 py-1"
            />
            <select 
              data-walkthrough="issue-severity"
              name="severity"
              className="w-full p-2 border rounded"
              value={issueInput.severity}
              onChange={(e) => setIssueInput(prev => ({ ...prev, severity: e.target.value }))}
            >
              <option value="low">Low Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="high">High Severity</option>
            </select>
          </div>
          <Input 
            name="description"
            placeholder="Description"
            value={issueInput.description}
            onChange={(e) => setIssueInput(prev => ({ ...prev, description: e.target.value }))}
            className="border rounded px-2 py-1"
          />
          <Button onClick={handleIssueSubmit} className="w-full">Report Issue</Button>
          
          <div className="space-y-2">
            {issues.map(issue => (
              <Alert key={issue.id} variant={issue.severity === 'high' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between">
                    <span className="font-bold">{issue.type}</span>
                    <span className="text-sm">{issue.severity} severity</span>
                  </div>
                  <p className="text-sm">{issue.description}</p>
                  <div className="flex justify-end">
                    {issue.status === 'open' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleResolveIssue(issue.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueTracker;