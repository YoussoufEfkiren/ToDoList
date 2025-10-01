<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaskPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function view(User $user, Task $task)
    {
        return $task->user_id === $user->id;
    }

    public function update(User $user, Task $task)
    {
        return $task->user_id === $user->id;
    }

    public function delete(User $user, Task $task)
    {
        return $task->user_id === $user->id;
    }
}