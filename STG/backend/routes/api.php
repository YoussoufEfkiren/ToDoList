<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Authentification (inscription & connexion)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Routes protégées par middleware (JWT ou Sanctum selon ton choix)
Route::middleware('auth:api')->group(function () {
    
    //  Déconnexion
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    //  CRUD des tâches
    Route::get('/tasks', [TaskController::class, 'index']);      // Liste des tâches
    Route::post('/tasks', [TaskController::class, 'store']);     // Créer une tâche
    Route::get('/tasks/{task}', [TaskController::class, 'show']); // Voir une tâche
    Route::put('/tasks/{task}', [TaskController::class, 'update']); // Modifier une tâche
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']); // Supprimer une tâche
});