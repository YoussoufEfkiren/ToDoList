import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreVertical, Calendar, CheckCircle2, PlayCircle, AlertCircle } from "lucide-react";

export default function TaskList({ tasks, onTaskUpdated, onStatusChange, onDeleteClick, viewMode = "list" }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onStatusChange={onStatusChange}
            onDeleteClick={onDeleteClick}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
            isOverdue={isOverdue}
          />
        ))}
      </div>
    );
  }


  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskListItem 
          key={task.id} 
          task={task} 
          onStatusChange={onStatusChange}
          onDeleteClick={onDeleteClick}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
          formatDate={formatDate}
          isOverdue={isOverdue}
        />
      ))}
    </div>
  );
}


function TaskCard({ task, onStatusChange, onDeleteClick, getStatusIcon, getStatusColor, formatDate, isOverdue }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
              <Link 
                to={`/tasks/${task.id}/edit`}
                className="hover:text-blue-600 transition-colors"
              >
                {task.title}
              </Link>
            </CardTitle>
            <Badge className={`${getStatusColor(task.status)} text-xs font-medium mb-3`}>
              {getStatusIcon(task.status)}
              <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
            </Badge>
          </div>
          <TaskDropdown task={task} onStatusChange={onStatusChange} onDeleteClick={onDeleteClick} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {task.description && (
          <CardDescription className="text-sm text-gray-600 line-clamp-3 mb-3">
            {task.description}
          </CardDescription>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span className={isOverdue(task.due_date) ? "text-red-600 font-medium" : ""}>
              {formatDate(task.due_date)}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            {new Date(task.created_at).toLocaleDateString()}
          </div>
        </div>

        {isOverdue(task.due_date) && (
          <Badge variant="destructive" className="mt-2 text-xs">
            Overdue
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}


function TaskListItem({ task, onStatusChange, onDeleteClick, getStatusIcon, getStatusColor, formatDate, isOverdue }) {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              {getStatusIcon(task.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  <Link 
                    to={`/tasks/${task.id}/edit`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {task.title}
                  </Link>
                </h3>
                <Badge className={`${getStatusColor(task.status)} text-xs font-medium`}>
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
              
              {task.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className={isOverdue(task.due_date) ? "text-red-600 font-medium" : ""}>
                    {formatDate(task.due_date)}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Created: {new Date(task.created_at).toLocaleDateString()}
                </div>
              </div>

              {isOverdue(task.due_date) && (
                <Badge variant="destructive" className="mt-2 text-xs">
                  Overdue
                </Badge>
              )}
            </div>
          </div>
          
          <TaskDropdown task={task} onStatusChange={onStatusChange} onDeleteClick={onDeleteClick} />
        </div>
      </CardContent>
    </Card>
  );
}


function TaskDropdown({ task, onStatusChange, onDeleteClick }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">

        <DropdownMenuItem asChild>
          <Link to={`/tasks/${task.id}/edit`} className="cursor-pointer">
            <Edit className="h-4 w-4 mr-2" />
            Edit Task
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />


        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
          Change Status
        </div>
        
        {task.status !== 'pending' && (
          <DropdownMenuItem 
            onClick={() => onStatusChange(task.id, 'pending')}
            className="cursor-pointer"
          >
            <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
            Mark as Pending
          </DropdownMenuItem>
        )}
        {task.status !== 'in_progress' && (
          <DropdownMenuItem 
            onClick={() => onStatusChange(task.id, 'in_progress')}
            className="cursor-pointer"
          >
            <PlayCircle className="h-4 w-4 mr-2 text-blue-600" />
            Mark In Progress
          </DropdownMenuItem>
        )}
        {task.status !== 'completed' && (
          <DropdownMenuItem 
            onClick={() => onStatusChange(task.id, 'completed')}
            className="cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
            Mark Completed
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />


        <DropdownMenuItem 
          onClick={() => onDeleteClick(task)}
          className="text-red-600 cursor-pointer"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}