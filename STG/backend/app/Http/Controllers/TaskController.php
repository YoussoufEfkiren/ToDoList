<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TaskController extends Controller
{
    
    public function index(): JsonResponse
    {
        $tasks = Auth::user()->tasks()->get();
        
        return response()->json([
            'tasks' => $tasks
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:pending,in_progress,completed',
            'due_date' => 'nullable|date',
        ]);

        try {
            $taskData = [
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'] ?? 'pending',
                'user_id' => Auth::id(),
            ];

            
            if (isset($validated['due_date']) && !empty($validated['due_date'])) {
                $taskData['due_date'] = $validated['due_date'];
            }

            $task = Task::create($taskData);

            return response()->json([
                'message' => 'Task created successfully',
                'task' => $task
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            Log::error('Task creation error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Error creating task',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    
    public function show(Task $task): JsonResponse
    {
        if ($task->user_id !== Auth::id()) {
            return response()->json([
                'error' => 'Forbidden'
            ], Response::HTTP_FORBIDDEN);
        }

        return response()->json([
            'task' => $task
        ]);
    }

    
    public function update(Request $request, Task $task): JsonResponse
    {
        if ($task->user_id !== Auth::id()) {
            return response()->json([
                'error' => 'Forbidden'
            ], Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:pending,in_progress,completed',
            'due_date' => 'nullable|date',
        ]);

        try {
            $updateData = [];

            if (isset($validated['title'])) {
                $updateData['title'] = $validated['title'];
            }
            if (isset($validated['description'])) {
                $updateData['description'] = $validated['description'];
            }
            if (isset($validated['status'])) {
                $updateData['status'] = $validated['status'];
            }
            if (array_key_exists('due_date', $validated)) {
                $updateData['due_date'] = $validated['due_date'] ?: null;
            }

            $task->update($updateData);

            return response()->json([
                'message' => 'Task updated successfully',
                'task' => $task
            ]);

        } catch (\Exception $e) {
            Log::error('Task update error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Error updating task',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    
    public function updateStatus(Request $request, Task $task): JsonResponse
    {
        if ($task->user_id !== Auth::id()) {
            return response()->json([
                'error' => 'Forbidden'
            ], Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        $task->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Task status updated successfully',
            'task' => $task
        ]);
    }

    
    public function destroy(Task $task): JsonResponse
    {
        if ($task->user_id !== Auth::id()) {
            return response()->json([
                'error' => 'Forbidden'
            ], Response::HTTP_FORBIDDEN);
        }

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully'
        ]);
    }

    
    public function getByStatus($status): JsonResponse
    {
        if (!in_array($status, ['pending', 'in_progress', 'completed'])) {
            return response()->json([
                'error' => 'Invalid status'
            ], Response::HTTP_BAD_REQUEST);
        }

        $tasks = Auth::user()->tasks()
            ->where('status', $status)
            ->get();

        return response()->json([
            'tasks' => $tasks
        ]);
    }
}