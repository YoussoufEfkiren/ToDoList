import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, CheckCircle2, Trash2, Calendar, Clock, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "unread", "read"
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    setPollingInterval(interval);

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFilteredNotifications(notifications);
    } else if (filter === "unread") {
      setFilteredNotifications(notifications.filter(notif => !notif.read));
    } else if (filter === "read") {
      setFilteredNotifications(notifications.filter(notif => notif.read));
    }
  }, [notifications, filter]);

  const fetchNotifications = async () => {
    try {
      // Simuler des notifications depuis l'API
      // Dans une vraie application, vous auriez un endpoint API pour les notifications
      const tasksResponse = await API.get("/tasks");
      const tasks = tasksResponse.data.tasks || tasksResponse.data;
      
      // Créer des notifications basées sur les tâches récentes
      const mockNotifications = generateMockNotifications(tasks);
      setNotifications(mockNotifications);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setIsLoading(false);
    }
  };

  const generateMockNotifications = (tasks) => {
    const notificationTypes = [
      {
        type: "task_created",
        message: (task) => `New task created: "${task.title}"`,
        icon: "📝"
      },
      {
        type: "task_completed", 
        message: (task) => `Task completed: "${task.title}"`,
        icon: "✅"
      },
      {
        type: "task_due_soon",
        message: (task) => `Task due soon: "${task.title}"`,
        icon: "⏰"
      },
      {
        type: "task_overdue",
        message: (task) => `Task overdue: "${task.title}"`,
        icon: "🚨"
      }
    ];

    return tasks.slice(0, 10).map((task, index) => {
      const notificationType = notificationTypes[index % notificationTypes.length];
      const hoursAgo = index * 2; // Simuler des heures différentes
      
      return {
        id: `notif-${task.id}-${index}`,
        type: notificationType.type,
        message: notificationType.message(task),
        icon: notificationType.icon,
        task_id: task.id,
        read: index > 2, // Les premières notifications sont non lues
        created_at: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
        data: {
          task_title: task.title,
          task_status: task.status,
          due_date: task.due_date
        }
      };
    });
  };

  const markAsRead = async (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = async () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = async (notificationId) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
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

  const getNotificationColor = (type) => {
    switch (type) {
      case "task_created": return "bg-blue-50 border-blue-200";
      case "task_completed": return "bg-green-50 border-green-200";
      case "task_due_soon": return "bg-yellow-50 border-yellow-200";
      case "task_overdue": return "bg-red-50 border-red-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  const getNotificationIcon = (icon) => {
    return <span className="text-lg">{icon}</span>;
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tasks" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Tasks
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="h-8 w-8 text-blue-600" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount} new
                  </Badge>
                )}
              </h1>
              <p className="text-gray-600 mt-1">
                Stay updated with your task activities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={markAllAsRead}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark all as read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={clearAllNotifications} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{unreadCount}</p>
                  <p className="text-sm text-gray-600">Unread</p>
                </div>
                <Bell className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {notifications.filter(n => n.type === 'task_created').length}
                  </p>
                  <p className="text-sm text-gray-600">New Tasks</p>
                </div>
                <span className="text-2xl">📝</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {notifications.filter(n => n.type === 'task_completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <span className="text-2xl">✅</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your task notifications and updates
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bell className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No notifications
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === "all" 
                    ? "You're all caught up! New notifications will appear here." 
                    : `No ${filter} notifications found`}
                </p>
                {filter !== "all" && (
                  <Button onClick={() => setFilter("all")}>
                    View all notifications
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Notification Icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border flex items-center justify-center">
                        {getNotificationIcon(notification.icon)}
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className={`font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                          {!notification.read && (
                            <Badge variant="secondary" className="ml-2">
                              New
                            </Badge>
                          )}
                        </div>

                        {/* Additional Info */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTimeAgo(notification.created_at)}
                          </div>
                          {notification.data.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(notification.data.due_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 w-8 p-0"
                            title="Mark as read"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Auto-refresh Indicator */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Clock className="h-3 w-3" />
            Auto-refreshing every 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
}