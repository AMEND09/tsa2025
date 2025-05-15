import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LoginPageProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (userData: { username: string; password: string }) => void;
  onRegister?: (userData: { username: string; password: string; email: string; name: string }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ 
  isOpen, 
  onOpenChange,
  onLogin,
  onRegister
}) => {
  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Registration state
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [registerError, setRegisterError] = useState('');
  
  // Tab state
  const [activeTab, setActiveTab] = useState('login');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    // For demo purposes, we'll accept any login
    onLogin({ username, password });
    
    // Reset form
    setUsername('');
    setPassword('');
  };
  
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    
    // Validate fields
    if (!registerUsername.trim()) {
      setRegisterError('Username is required');
      return;
    }

    if (!registerPassword.trim()) {
      setRegisterError('Password is required');
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }
    
    if (!email.trim()) {
      setRegisterError('Email is required');
      return;
    }
    
    if (!name.trim()) {
      setRegisterError('Name is required');
      return;
    }

    // If onRegister is provided, call it
    if (onRegister) {
      onRegister({ 
        username: registerUsername, 
        password: registerPassword,
        email,
        name
      });
    } else {
      // Otherwise just use the login handler with the registration credentials
      onLogin({ username: registerUsername, password: registerPassword });
    }
    
    // Reset form
    setRegisterUsername('');
    setRegisterPassword('');
    setConfirmPassword('');
    setEmail('');
    setName('');
    
    // Switch to login tab after successful registration
    setActiveTab('login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">EcoSprout Farm Management</DialogTitle>
          <DialogDescription className="text-center">
            Access your farm management dashboard
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-4">
              {error && (
                <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
              
              <p className="text-center text-xs text-gray-500 pt-2">
                For demo purposes, any username and password will work
              </p>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-4">
              {registerError && (
                <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded">
                  {registerError}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="register-username">Username</Label>
                <Input
                  id="register-username"
                  placeholder="Choose a username"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Choose a password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <Button type="submit" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" /> Register
              </Button>
              
              <p className="text-center text-xs text-gray-500 pt-2">
                For demo purposes, registration is simulated
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPage;
