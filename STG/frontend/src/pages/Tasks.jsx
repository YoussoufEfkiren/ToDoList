import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import DeleteTaskDialog from "../components/DeleteTaskDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, LogOut, User, Calendar, Filter, Grid3X3, List, Bell, CheckCircle2, PlayCircle, AlertCircle, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await API.get("/tasks");
        const tasksData = res.data.tasks || res.data;
        setTasks(tasksData);
        setIsLoading(false);
        
        // Générer les notifications basées sur les tâches
        generateNotifications(tasksData);
      } catch (err) {
        navigate("/login");
      }
    };
    fetchTasks();
  }, [navigate]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.status === statusFilter));
    }
  }, [tasks, statusFilter]);

  const generateNotifications = (tasksData) => {
    const newNotifications = tasksData.slice(0, 5).map((task, index) => {
      const notificationTypes = [
        {
          type: "task_created",
          message: `New task created: "${task.title}"`,
          icon: "📝",
          color: "text-blue-600"
        },
      ];
      
      const notificationType = notificationTypes[index % notificationTypes.length];
      const hoursAgo = index; // Simuler des heures différentes
      
      return {
        id: `notif-${task.id}-${index}`,
        type: notificationType.type,
        message: notificationType.message,
        icon: notificationType.icon,
        color: notificationType.color,
        task_id: task.id,
        read: index > 2, // Les premières notifications sont non lues
        created_at: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
        task: task
      };
    });
    
    setNotifications(newNotifications);
  };

  const handleTaskCreated = (newTask) => {
    setTasks(prev => [...prev, newTask]);
    setIsTaskFormOpen(false);
    
    // Ajouter une nouvelle notification
    const newNotification = {
      id: `notif-${newTask.id}-${Date.now()}`,
      type: "task_created",
      message: `New task created: "${newTask.title}"`,
      icon: "📝",
      color: "text-blue-600",
      task_id: newTask.id,
      read: false,
      created_at: new Date().toISOString(),
      task: newTask
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    
    
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await API.put(`/tasks/${taskId}`, { status: newStatus });
      const updatedTask = response.data.task;
      handleTaskUpdated(updatedTask);
      

        
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
    
    // Retirer les notifications liées à cette tâche
    setNotifications(prev => prev.filter(notif => notif.task_id !== taskId));
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case 'in_progress': return <PlayCircle className="h-3 w-3 text-blue-600" />;
      default: return <AlertCircle className="h-3 w-3 text-yellow-600" />;
    }
  };

  // Calcul des statistiques
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const unreadNotificationsCount = notifications.filter(notif => !notif.read).length;

  // Tâches triées par date d'échéance
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  Task Manager
                  <Badge variant="secondary" className="text-sm">
                    {totalTasks} tasks
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  Stay organized and boost your productivity
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 px-3"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notifications Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      <Bell className="h-4 w-4" />
                      {unreadNotificationsCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                          {unreadNotificationsCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-96">
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span>Notifications</span>
                      {unreadNotificationsCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllNotificationsAsRead}
                          className="h-6 text-xs"
                        >
                          Mark all read
                        </Button>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notification) => (
                          <DropdownMenuItem 
                            key={notification.id} 
                            className={`p-3 cursor-pointer border-l-4 ${
                              !notification.read 
                                ? 'bg-blue-50 border-l-blue-500' 
                                : 'border-l-transparent'
                            }`}
                            onSelect={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3 w-full">
                              <div className={`text-lg ${notification.color} flex-shrink-0 mt-0.5`}>
                                {notification.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>{getTimeAgo(notification.created_at)}</span>
                                  {notification.task && (
                                    <>
                                      <span>•</span>
                                      <div className="flex items-center gap-1">
                                        {getStatusIcon(notification.task.status)}
                                        <span className="capitalize">
                                          {notification.task.status.replace('_', ' ')}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                              )}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    )}
                    
                    <DropdownMenuSeparator />
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Add Task Button */}
                <Button 
                  onClick={() => setIsTaskFormOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-900">{pendingTasks}</p>
                    <p className="text-sm text-yellow-700">Pending</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{inProgressTasks}</p>
                    <p className="text-sm text-blue-700">In Progress</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg border border-green-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-2xl font-bold text-green-900">{completedTasks}</p>
                    <p className="text-sm text-green-700">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading your tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {statusFilter === "all" ? "No tasks yet" : `No ${statusFilter} tasks`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {statusFilter === "all" 
                    ? "Get started by creating your first task!" 
                    : `No tasks found with status "${statusFilter}"`}
                </p>
                {statusFilter === "all" && (
                  <Button 
                    onClick={() => setIsTaskFormOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Task
                  </Button>
                )}
              </div>
            ) : (
              <TaskList 
                tasks={sortedTasks} 
                onTaskUpdated={handleTaskUpdated}
                onStatusChange={handleStatusChange}
                onDeleteClick={handleDeleteClick}
                viewMode={viewMode}
              />
            )}
          </CardContent>
        </Card>

        {/* Task Form Popup */}
        <TaskForm 
          open={isTaskFormOpen}
          onOpenChange={setIsTaskFormOpen}
          onTaskCreated={handleTaskCreated}
        />

        {/* Delete Task Dialog */}
        <DeleteTaskDialog 
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          task={taskToDelete}
          onTaskDeleted={handleTaskDeleted}
        />
      </div>
    </div>
  );
}